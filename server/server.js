const express = require('express')
const bodyParser = require('body-parser')

const { Todo } = require('./models/todo')
const { User } = require('./models/user')


const app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  console.log(req.body)
  const todo = new Todo({
    text: req.body.text
  })
  todo.save().then(doc => res.send(doc)).catch(e => res.status(400).send(e))
})

app.listen(3000, () => console.log('Server up on port ', '3000'))


// const td = new Todo({
//   text: 'ride my pipe'
// })



// const Tom = new User({ email: '   blogspot.dom'})

// Tom.save().then(res => console.log(res)).catch(err => console.log(err))

// td.save().then(res => console.log(res)).catch(err => console.log(err))