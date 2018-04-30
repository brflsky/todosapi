const express = require('express')
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb')

const { Todo } = require('./models/todo')
const { User } = require('./models/user')

const PORT = process.env.PORT || 3000

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
  if(!ObjectId.isValid(id)) return res.status(404).send()

  Todo.findById(id).then(todo => {
    if(!todo) return res.status(404).send()
    res.send({ todo })
  }).catch(() => res.staus(400).send())
})
app.listen(PORT, () => console.log('Server up on port ', PORT))


module.exports.app = app

// const td = new Todo({
//   text: 'ride my pipe'
// })



// const Tom = new User({ email: '   blogspot.dom'})

// Tom.save().then(res => console.log(res)).catch(err => console.log(err))

// td.save().then(res => console.log(res)).catch(err => console.log(err))