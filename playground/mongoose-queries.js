const { Todo } = require('../server/models/todo')


const _id = '5ae7365231ea5c7c2678ef8a'
const todo = Todo.findById(_id)
console.log(todo)