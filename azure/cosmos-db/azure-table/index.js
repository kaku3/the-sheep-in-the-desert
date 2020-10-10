// .env.js
// config = {
//  cosmos: "(DefaultEndpointsProtocol)"
// }
// 

// api document.
// https://azure.github.io/azure-storage-node/
const storage = require('azure-storage')
const config = require('./.env.js')
const client = storage.createTableService(config.cosmos)
const eg = storage.TableUtilities.entityGenerator

const tables = [
  'sequences',
  'scores'
]

/**
 * table 生成。schema は存在しない
 */
async function initTable() {
  console.info('+ init table')

  function _init(t) {
    return new Promise((resolve, reject) => {
      client.createTableIfNotExists(t, (error, result) => {
        if(error) {
          console.error(error)
          reject(error)
        }
        console.info(result)
        resolve(result)
      })
    })
  }
  for(const t of tables) {
    await _init(t)
  }
  console.groupEnd()
  console.info('- init table')
}

async function initSequence() {
  console.group('+ init sequence')

  const entry = {
    PartitionKey: eg.String('sequences'),
    RowKey: eg.String('scores'),
    no: eg.Int64(1) 
  }
  function _init() {
    return new Promise((resolve, reject) => {
      client.insertOrReplaceEntity('sequences', entry, (error, result) => {
        if(error) {
          console.error(error)
          reject(error)
        }
        console.info(result)
        resolve(result)
      })
    })
  }
  await _init()
  console.groupEnd()
  console.info('- init sequence')
}

/**
 * key で指定された sequence を取得して +1 する。
 * @param {string} key 
 */
async function obtainSequence(key) {
  function retrieve(key) {
    return new Promise((resolve, reject) => {
      client.retrieveEntity('sequences', 'sequences', key, (error, result) => {
        if(error) reject(error)
        resolve(result.no._)  // property._ に値が格納されている。
      })
    })
  }
  function replace(key, no) {
    const entry = {
      PartitionKey: eg.String('sequences'),
      RowKey: eg.String(key),
      no: eg.Int64(no) 
    }
    return new Promise((resolve, reject) => {
      client.replaceEntity('sequences', entry, (error, result) => {
        if(error) reject(error)
        resolve(result)
      })
    })
  }

  try {
    const sequence = parseInt(await retrieve(key))
    await replace(key, sequence + 1)
    return sequence
  } catch(e) {
    console.error(e)
  }
  return -1
}

/**
 * score 登録。名前の重複は許可
 * @param {string} name 
 * @param {number} score 
 */
async function insertScore(name, score) {
  console.group('+ insert score')

  const sequence = await obtainSequence('scores')

  const entry = {
    PartitionKey: eg.String('scores'),
    RowKey: eg.String(String(sequence)),
    name: eg.String(name),
    score: eg.Int64(score) 
  }
  function _insert() {
    return new Promise((resolve, reject) => {
      client.insertEntity('scores', entry, (error, result) => {
        if(error) reject(error)
        console.info(sequence, name, score)
        resolve(result)
      })
    })
  }
  try {
    await _insert()
  } catch(e) {
    console.error(name, score)
    console.error(e)
  }
  console.groupEnd()
  console.info('- insert score')
}

/**
 * score 取得
 */
function getScores(count) {
  const q = new storage.TableQuery().select('name', 'score')
    .top(count)

  client.queryEntities('scores', q, null, (error, result) => {
    if(error) {
      console.error(error)      
    } else {
      const entries = result.entries
      for(const e of entries) {
        console.log(e.name._, e.score._)
      }
    }
  })
}



// 初期化テスト
async function init() {
  await initTable()
  await initSequence()
}

// init()

// sequence 取得テスト
// const sequence = await obtainSequence('scores')
// console.log(sequence)

// score 登録テスト
async function insertScores() {
  const scores = [
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
  for(const s of scores) {
    await insertScore(s.name, s.score)
  }  
}
// insertScores()

getScores(10)