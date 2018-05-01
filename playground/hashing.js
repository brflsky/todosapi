const { SHA256 } = require('crypto-js')

const jwt = require('jsonwebtoken')

const data = { id: 10 }

const token = jwt.sign(data, 'secret')

console.log(token)