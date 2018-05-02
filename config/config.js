const env = process.env.NODE_ENV || 'development'

if (env === 'test' || env === 'development') {
  const config = require('./config.json')
  const envConfig = config[env]
  // Object.keys(envConfig).forEach(key => process.env[key] = envConfig[key])
  Object.assign(process.env, envConfig)
}

// if (env === 'development') {
//   process.env.PORT = 3000
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodosApp'
// } else if (env === 'test') {
//   process.env.PORT = 3000
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodosAppTEST'
// }

module.exports.env = env