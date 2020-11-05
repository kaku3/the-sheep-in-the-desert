import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()

// 読み込みレコード数に対して課金が発生する？
// score 登録毎にランキング集計し、1レコードで保持する。
exports.updateHiScores = functions.firestore
  .document('scores/{scoreId}')
  .onWrite((change, context) => {

  const q = db.collection('scores').orderBy('score', 'desc').limit(5);
  q.get()
  .then((r) => {
    const hiScores = r.docs.map(d => d.data())
    db.collection('hiScores').doc('202010')
    .set({
      json: JSON.stringify(hiScores)
    }).catch((err) => {
      console.error(err)
    })
  }).catch((err) => {
    console.error(err)
  })
})

