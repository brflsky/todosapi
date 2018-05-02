const expect = require('expect')
const request = require('supertest')
// const { ObjectID } = require('mongodb')

const { app } = require('./server')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')
const { populateTodos, todos, users, populateUsers } = require('../fixtures/fixtures')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
  it('should add todo to database', (done) => {
    const text = 'New todo test';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(err)
        Todo.find({ text, _creator: users[0]._id }).then(todos => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        }).catch(err => done(err))
      })
  })

  it('should not add todo to database', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        Todo.find({}).then(todos => {
          expect(todos.length).toBe(3)
          done()
        }).catch(err => done(err))
      })
  })
})

describe('GET /todos', () => {
  it('should retrive all todos from db', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        // if(err) return done(err)
        expect(res.body.todos.length).toBe(1)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return given todo by id', (done) => {
    Todo.find({ text: todos[0].text }).then(todos => {
      request(app)
        .get('/todos/' + todos[0]._id)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect(res => expect(res.body.todo.text).toBe(todos[0].text))
        .end(done)
    }).catch(done)
  })
  it('should return 404 for invalid id', (done) => {
    request(app)
      .get('/todos/12345')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })
  it('should not return todo created by other user', (done) => {
    Todo.find({ text: todos[1].text }).then(todos => {
      request(app)
        .get('/todos/' + todos[0]._id)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .expect(res => expect(res.body.todo).toNotExist())
        .end(done)
    }).catch(done)
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove given id', (done) => {
    Todo.find({ text: todos[0].text }).then(docs => {
      request(app)
        .delete('/todos/' + docs[0]._id)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect(res => expect(res.body.todo.text).toBe(todos[0].text))
        .end((err, res) => {
          if (err) return done(err)
          Todo.findById(todos[0]._id).then(todo => {
            expect(todo).toNotExist()
            done()
          }).catch(done)
        })
    }).catch(done)
  })

  it('should not remove todo created by other user', (done) => {
    Todo.find({ text: todos[0].text }).then(docs => {
      request(app)
        .delete('/todos/' + docs[0]._id)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .expect(res => expect(res.body.todo).toNotExist())
        .end((err, res) => {
          if (err) return done(err)
          Todo.findById(todos[0]._id).then(todo => {
            expect(todo).toExist()
            done()
          }).catch(done)
        })
    }).catch(done)
  })

  it('should not remove by wrong id', (done) => {
    request(app)
      .delete('/todos/1234')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  it('should update give todo by id', (done) => {
    const updatedTodo = {
      _id: todos[1]._id,
      text: '2nd Task NOT Completed',
      completed: false,
      fake: 'fake'
    }
    request(app)
      .patch('/todos/' + todos[1]._id.toHexString())
      .set('x-auth', users[1].tokens[0].token)
      .send(updatedTodo)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).toNotExist()
        expect(res.body.todo.fake).toNotExist()
        expect(res.body.todo.text).toBe(updatedTodo.text)
      })
      .end((err, res) => {
        if (err) return done(err)
        Todo.findById(todos[1]._id).then(todo => {
          expect(todo.completed).toBe(false)
          expect(todo.completedAt).toNotExist()
          expect(todo.fake).toNotExist()
          expect(todo.text).toBe(updatedTodo.text)
          done()
        }).catch(done)
      })
  })

  it('should not update todo created by another user', (done) => {
    const updatedTodo = {
      _id: todos[1]._id,
      text: '2nd Task NOT Completed',
      completed: false,
      fake: 'fake'
    }
    request(app)
      .patch('/todos/' + todos[1]._id.toHexString())
      .set('x-auth', users[0].tokens[0].token)
      .send(updatedTodo)
      .expect(404)
      .expect(res => {
        expect(res.body.todo).toNotExist()
      })
      .end((err, res) => {
        if (err) return done(err)
        Todo.findById(todos[1]._id).then(todo => {
          expect(todo.completed).toBe(todos[1].completed)
          expect(todo.completedAt).toBe(todos[1].completedAt)
          expect(todo.fake).toNotExist()
          expect(todo.text).toBe(todos[1].text)
          done()
        }).catch(done)
      })
  }) 

  it('should not update by wrong id', (done) => {
    const updatedTodo = {
      _id: 'wrongID',
      text: '2nd Task NOT Completed',
      completed: false,
      fake: 'fake'
    }
    request(app)
      .patch('/todos/' + updatedTodo._id)
      .set('x-auth', users[1].tokens[0].token)
      .send(updatedTodo)
      .expect(404)
      .end(done)
  })
})

describe('GET /users/me', () => {
  it('should return authenticated user', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.user._id).toBe(users[0]._id.toHexString())
        expect(res.body.user.email).toBe(users[0].email)
      }).end(done)
  })

  it('should not return UNauthenticated user', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token + 'badToken')
      .expect(401)
      .expect(res => {
        expect(res.body.user).toNotExist()
      }).end(done)
  })
})

describe('POST /users', () => {
  it('should create user on valid data', (done) => {
    const email = 'x@xxx.xxx'
    const password = '123abc!'

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist()
        expect(res.body.user.email).toBe(email)
        expect(res.body.user._id).toExist()
      }).end(err => {
        if (err) return done(err)

        User.findOne({ email }).then(user => {
          expect(user).toExist()
          expect(user.password).toNotBe(password)
          done()
        })
      })
  })
  it('should NOT create user on INvalid data - pass to short', (done) => {
    const email = 'x@xxx.xxx'
    const password = '123' //to short

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist()
        expect(res.body.user).toNotExist()
      }).end(done)
  })
  it('should NOT create user on valid data - duplicate email', (done) => {
    const email = users[0].email //duplicate email
    const password = '123abc!'

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist()
        expect(res.body.user).toNotExist()
      }).end(done)
  })
})

describe('POST /users/login', () => {
  it('should login user with valid credentials', (done) => {
    request(app)
      .post('/users/login')
      .send(users[0])
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist()
        expect(res.body.user).toExist()
      }).end((err, res) => {
        if (err) return done(err)
        User.getUserByToken(res.headers['x-auth'])
          .then(user => {
            expect(user.email).toBe(users[0].email)
            done()
          }).catch(done)
      })
  })

  it('should NOT login user with INvalid credentials', (done) => {
    request(app)
      .post('/users/login')
      .send({ email: users[0].email, password: 'wrongpassword' })
      .expect(401)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist()
        expect(res.body.user).toNotExist()
      }).end(done)
  })
})

describe('GET /users/logout', () => {
  it('should logout user and delet his token', (done) => {
    request(app)
      .get('/users/logout')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist()
        expect(res.body.user).toNotExist()
      }).end((err, res) => {
        if (err) return done(err)
        User.getUserByToken(users[0].tokens[0].token)
          .then(user => {
            expect(user).toNotExist()
            done()
          }).catch(done)
      })
  })
})