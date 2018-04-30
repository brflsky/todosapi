const expect = require('expect')
const request = require('supertest')

const { app } = require('./server')
const { Todo } = require('./models/todo')

const todos = [
  {
    text: "1st task"
  },
  {
    text: "2nd task"
  },
  {
    text: "3rd task"
  }
]

beforeEach((done) => {
  Todo.remove({}).then(() => Todo.insertMany(todos))
  .then(() => done())
})

describe('POST /todos', () => {
  it('should add todo to database', (done) => {
    const text = 'New todo test';
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) return done(err)
        Todo.find({ text }).then(todos => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        }).catch(err => done(err))
      })
  })

  it('should not add todo to database', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) return done(err)
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
      .expect(200)
      .expect((res) => {
        // if(err) return done(err)
        expect(res.body.todos.length).toBe(3)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () =>{
  it('should return given todo by id', (done) => {
    Todo.find({ text: todos[0].text }).then(todos => {
      request(app)
        .get('/todos/' + todos[0]._id)
        .expect(200)
        .expect(res => expect(res.body.todo.text).toBe(todos[0].text))
        .end(done)
    }).catch(done)
  })
  it('should return 404 for invalid id', (done) => {
      request(app)
        .get('/todos/12345')
        .expect(404)
        .end(done)
  })
})
