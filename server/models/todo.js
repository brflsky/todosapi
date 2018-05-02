const {mongoose} = require('../db/mongoose')

const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
})

module.exports.Todo = Todo