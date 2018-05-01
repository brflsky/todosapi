const {mongoose} = require('../db/mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

UserSchema.methods.toJSON = function() {
  const user = this
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email'])
}

UserSchema.methods.generateAuthToken = function() {
  const user = this
  const access = 'auth'
  const token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString()
  console.log('token:', token)
  user.tokens = user.tokens.concat([{ access, token }])

  return user.save().then(() => token)
}

const User = mongoose.model('User', UserSchema)

module.exports.User = User