// .env.js は プロジェクトに含めていません。環境に合わせて以下ファイルを作成して配置してください。
// const endpoint = 'https://(account name).documents.azure.com:443/'
// const key = '(Cosmos DB access key)'
// module.exports = { endpoint, key }
const { endpoint, key } = require('./.env.js')

//@ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient

const config = require('./config')

const databaseId = config.database.id
const containerId = config.container.id
const partitionKey = { kind: 'Hash', paths: ['/Country'] }

const client = new CosmosClient({ endpoint, key })

/**
 * Create the database if it does not exist
 */
async function createDatabase() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId
  })
  console.log(`Created database:\n${database.id}\n`)
}

/**
 * Create the container if it does not exist
 */
async function createContainer() {
  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists(
      { id: containerId, partitionKey },
      { offerThroughput: 400 }
    )
  console.log(`Created container:\n${config.container.id}\n`)
}

/**
 * Scale a container
 * You can scale the throughput (RU/s) of your container up and down to meet the needs of the workload. Learn more: https://aka.ms/cosmos-request-units
 */
async function scaleContainer() {
  const { resource: containerDefinition } = await client
    .database(databaseId)
    .container(containerId)
    .read()
  const {resources: offers} = await client.offers.readAll().fetchAll();
  
  const newRups = 400;
  for (var offer of offers) {
    if (containerDefinition._rid !== offer.offerResourceId)
    {
        continue;
    }
    offer.content.offerThroughput = newRups;
    const offerToReplace = client.offer(offer.id);
    await offerToReplace.replace(offer);
    console.log(`Updated offer to ${newRups} RU/s\n`);
    break;
  }
}

/**
 * Create or Update items if it does not exist
 */
async function upsertItems(itemBodies) {

  const items = client.database(databaseId).container(containerId).items
  const ps = itemBodies.map(body => items.upsert(body))
  await Promise.all(ps)

  console.log(`upserted items : `, itemBodies.map(o => o.id))
}

/**
 * sequence より現在値を取得し +1
 */
async function obtainSequence(id) {
  console.group(`+ obtainSequence(${id})`)
  const q = {
    query: 'SELECT VALUE c FROM c WHERE c.id = @id',
    parameters: [
      {
        name: '@id',
        value: `sequences_${id}`
      }
    ]
  }
  const query = client.database(databaseId).container(containerId).items.query(q)
  const { resources: rs } = await query.fetchAll()
  rs[0].no++
  await upsertItems(rs)

  console.groupEnd()
  console.log(`- obtainSequence(${id})`, rs[0].no)
  return rs[0].no
}

/**
 * Default Hi-Score 登録
 */
async function insertDefaultHiScores() {
  const hiScores = [
    { name: 'SHEEP', score: 1000 },
    { name: 'SHEEP', score: 900 },
    { name: 'SHEEP', score: 800 },
    { name: 'SHEEP', score: 700 },
    { name: 'SHEEP', score: 600 },
    { name: 'SHEEP', score: 500 },
    { name: 'SHEEP', score: 400 },
    { name: 'SHEEP', score: 300 },
    { name: 'SHEEP', score: 200 },
    { name: 'SHEEP', score: 100 },
  ]
  for(const o of hiScores) {
    const id = await obtainSequence('scores')
    o.id = `scores_${id}`
  }
  await upsertItems(hiScores)
}

/**
 * score 登録
 * @param {*} name 
 * @param {*} score 
 */
async function insertScore(name, score) {
  const id = await obtainSequence('scores')
  await upsertItems([ 
    {
      id: `scores_${id}`,
      name: name,
      score: score
    }    
  ])
}


/**
 * 指定された件数 Hi-Score 取得
 * @param {*} count 
 */
async function getHiScores(count) {
  console.group(`+ getHiScores(${count})`)
  const q = {
    query: `SELECT VALUE c FROM c ORDER BY c.score DESC OFFSET 0 LIMIT ${count}`,
    parameters: []
  }
  const query = client.database(databaseId).container(containerId).items.query(q)
  const { resources: rs } = await query.fetchAll()

  console.groupEnd()
  console.log(`- getHiScores(${count})`)
  return rs
}

/**
 * Cleanup the database and collection on completion
 */
async function cleanup() {
  await client.database(databaseId).delete()
}

/**
 * Exit the app with a prompt
 * @param {string} message - The message to display
 */

async function main() {

  try {
    await createDatabase()
    await createContainer()
    // await scaleContainer()
    // await upsertItems(config.sequences)
    await insertDefaultHiScores()
    const scores = await getHiScores(10)
    console.table(scores)
  } catch(error) {
    console.error(error)
  }
}

main()
