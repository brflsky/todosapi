const { MongoClient, ObjectId } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to mongo')
  }

  console.log('Connecting to mongo...')

  // db.collection('Todos').insertOne({
  //   text: 'Something to add',
  //   completed: false
  // }, (err, result) => {
  //   if(err) {
  //     return console.log('Unable to insert todo')
  //   }
  //   console.log(JSON.stringify(result.ops, null, 2))
  // })

  // db.collection('Users').insertOne({
  //   name: 'Mark',
  //   age: 22,
  //   location: 'London'
  // }, (err, result) => {
  //   if(err) {
  //     return console.log('Unable to insert todo')
  //   }
  //   console.log(JSON.stringify(result.ops, null, 2))
  // })

  //db.collection('Todos').find({ completed: true }).toArray().then(docs => console.log(docs)).catch(err => console.log(err))

  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectId('5ae4482d06e80727ac233ad9')
  // }, {
  //   $set: {
  //     comleted: false
  //   }
  // }, {
  //   returnOriginal: false
  // }).then(result => console.log(result))

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectId('5ae3b7ddc97d57232c0ee77d')
  }, {
    $set: {
      name: 'Dupalski'
    },
    $inc: {
      age: 1
    }
  }, {
    returnOriginal: false
  }).then(res => console.log(res))

  db.close()
})