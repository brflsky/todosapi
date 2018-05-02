const { SHA256 } = require('crypto-js')
const bcrypt = require('bcryptjs')

// const jwt = require('jsonwebtoken')

// const data = { id: 10 }

// const token = jwt.sign(data, 'secret')

// console.log(token)

const password = '123abc'

// bcrypt.genSalt(10, salt => bcrypt.hash(password, salt, then(hash => console.log('hash:', hash))) .then(salt => bcrypt.hash(password, salt)).then(hash => console.log('hash:', hash)), 

bcrypt.genSalt(10, (err, salt) => bcrypt.hash(password, salt, (err, hash) => console.log(hash)))