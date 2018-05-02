const {mongoose} = require('../db/mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

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
  user.tokens = user.tokens.concat([{ access, token }])

  return user.save().then(() => token)
}

UserSchema.methods.deleteUserToken = function(token) {
  this.tokens = this.tokens.filter(element => element.token !== token)
  return this.save()
}

UserSchema.statics.getUserByToken = function(token) {
  const User = this
  let decoded
  
  try {
    decoded = jwt.verify(token, 'abc123')
  } catch(err) {
    return Promise.reject()
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

UserSchema.statics.getUserByCredentials = function (email, password) {
  return User.findOne({ email })
  .then(user => new Promise((resolve, reject) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, success) => {
        if (success) resolve(user)
        else reject()
      })
    } else {
      reject()
    }
  }))
}

UserSchema.pre('save', function(next) {
  const user = this
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

const User = mongoose.model('User', UserSchema)

module.exports.User = User