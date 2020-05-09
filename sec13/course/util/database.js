const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

let _db

const mongoConnect = async (callback) => {
  try {
    const connection = await MongoClient.connect(
      'mongodb://localhost:27017/nodejs', 
      { useUnifiedTopology: true }
    )

    _db = connection.db()
    callback()
  } catch(error) {
    console.log(error.name)
  }
}

const getDb = () => {
  if (_db) {
    return _db
  }

  throw 'No Database Found'
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb
exports.objectId = mongodb.ObjectID
