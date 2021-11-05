const { Router, application } = require('express')
const { v4 } = require('uuid')

const routes = Router()

const customers = []

function verifyAnExistingAccount(request, response, next) {
  const { cpf } = request.headers

  const customer = customers.find(customer => customer.cpf === cpf)

  if (!customer) {
    return response.status(400).json({ error: 'Customer not found' })
  }

  request.customer = customer

  return next()
}

function getBalance(statement) {
  const balance = statement.reduce((acc, transaction) => {
    if (transaction.type === 'credit') {
      return (acc += transaction.amount)
    }
    if (transaction.type === 'debit') {
      return (acc -= transaction.amount)
    }
  }, 0)

  return balance
}

routes.post('/account', (request, response) => {
  const { name, cpf } = request.body

  const customerAlreadyExists = customers.some(customer => customer.cpf === cpf)

  if (customerAlreadyExists) {
    return response.status(400).json({ error: 'Customer already exists' })
  }

  const customer = {
    id: v4(),
    name,
    cpf,
    statement: [],
  }

  customers.push(customer)

  response.status(201).send()
})

routes.put('/account', verifyAnExistingAccount, (request, response) => {
  const { name } = request.body

  const customer = request.customer

  customer.name = name

  return response.status(204).send()
})

routes.get('/account', verifyAnExistingAccount, (request, response) => {
  const customer = request.customer

  return response.json(customer)
})

routes.get('/statement', verifyAnExistingAccount, (request, response) => {
  const customer = request.customer

  return response.json(customer.statement)
})

routes.get('/statement/date', verifyAnExistingAccount, (request, response) => {
  const { date } = request.query
  const customer = request.customer

  const dateCompare = new Date(date + ' 00:00')

  const statementByDate = customer.statement.filter(
    transaction =>
      transaction.created_at.toDateString() === dateCompare.toDateString(),
  )

  return response.json(statementByDate)
})

routes.post('/deposit', verifyAnExistingAccount, (request, response) => {
  const { amount, description } = request.body

  const customer = request.customer

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()
})

routes.post('/withdraw', verifyAnExistingAccount, (request, response) => {
  const { amount } = request.body
  const customer = request.customer

  const balance = getBalance(customer.statement)

  if (balance < amount) {
    return response.status(400).json({ error: 'Insufficient founds!' })
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()
})

exports.routes = routes
