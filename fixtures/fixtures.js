const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken')
const { Todo } = require('../server/models/todo')
const { User } = require('../server/models/user')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()

const users = [{
  _id: userOneId,
  email: 'a@a.com',
  password: 'user1password',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123' )
  }]
}, {
  _id: userTwoId,
  email: 'b@a.com',
  password: 'user2password'
}]

const todos = [
  {
    text: "1st task"
  },
  {
    _id: new ObjectID(),//.toHexString(),
    text: "2nd task",
    completed: true,
    completedAt: 4444
  },
  {
    text: "3rd task"
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
