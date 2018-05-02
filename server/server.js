const { env } = require('../config/config')

const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')
const { ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')

const { Todo } = require('./models/todo')
const { User } = require('./models/user')
const { authenticate } = require('./middlewere/authenticate')

const PORT = process.env.PORT

const app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  })
  todo.save().then(doc => res.send(doc)).catch(e => res.status(400).send(e))
})
app.get('/todos', (req, res) => {
  Todo.find().then(todos => res.send({ todos })).catch(err => res.status(400).send(err))
})
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(404).send()

  Todo.findById(id).then(todo => {
    if (!todo) return res.status(404).send()
    res.send({ todo })
  }).catch(() => res.staus(400).send())
})
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id
  if (!ObjectId.isValid(id)) return res.status(404).send()

  Todo.findByIdAndRemove(id).then(todo => {
    if (!todo) return res.status(404).send()
    res.send({ todo })
  }).catch(() => res.status(404).send())
})

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id
  if (!ObjectId.isValid(id)) return res.status(404).send()
  const body = _.pick(req.body, ['text', 'completed'])
  if (_.isBoolean(body.completed) && body.completed)
    body.completedAt = new Date().getTime()
  else {
    body.completedAt = null
    body.completed = false
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) return res.status(404).send()
      res.send({ todo })
    }).catch(() => res.status(404).send())
})

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  const user = new User(body)
  user.save().then(doc => {
    if (!doc) return res.status(400).send()
    return user.generateAuthToken()
    // res.send(doc)
  })
    .then(token => res.header('x-auth', token).send({ user }))
    .catch((err) => res.status(400).send(err))
})

app.get('/users/me', authenticate, (req, res) => {
  res.send({ user: req.user })
})

app.post('/users/login', (req, res) => {
  User.getUserByCredentials(req.body.email, req.body.password)
    .then(user => user.generateAuthToken().then(token => res.header('x-auth', token).send({ user })))
    // generate new token instead getting old one
    //.then(user => res.header('x-auth', user.tokens.find(token => token.access === 'auth').token).send(user))
    .catch(err => res.status(401).send(err))
})

app.get('/users/logout', authenticate, (req, res) => {
  req.user.deleteUserToken(req.token).then(() => res.status(200).send())
    .catch(err => res.status(400).send(err))
})


app.listen(PORT, () => console.log(`Server is running on PORT:${PORT} in ***** ${env} mode *****`))


module.exports.app = app

// const td = new Todo({
//   text: 'ride my pipe'
// })



// const Tom = new User({ email: '   blogspot.dom'})

// Tom.save().then(res => console.log(res)).catch(err => console.log(err))

// td.save().then(res => console.log(res)).catch(err => console.log(err))