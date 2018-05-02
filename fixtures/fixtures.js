const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken')
const { Todo } = require('../server/models/todo')
const { User } = require('../server/models/user')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const userThreeId = new ObjectID()

const users = [{
  _id: userOneId,
  email: 'a@a.com',
  password: 'user1password',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET )
  }]
}, {
  _id: userTwoId,
  email: 'b@a.com',
  password: 'user2password',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET )
  }]
}]

const todos = [
  {
    _id: new ObjectID(),
    text: "1st task",
    _creator: userOneId
  },
  {
    _id: new ObjectID(),//.toHexString(),
    text: "2nd task",
    completed: true,
    completedAt: 4444,
    _creator: userTwoId
  },
  {
    _id: new ObjectID(),
    text: "3rd task",
    _creator: userThreeId
  }
]


const populateTodos = (done) => {
  Todo.remove({}).then(() => Todo.insertMany(todos))
  .then(() => done())
}
const populateUsers = (done) => {
  User.remove({}).then(() => {
    return Promise.all([new User(users[0]).save(), new User(users[1]).save()])
  }).then(() => done())
}

module.exports = { populateTodos, todos, users, populateUsers }
