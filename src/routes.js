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

routes.post('/accounts', (request, response) => {
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

routes.get('/statement', verifyAnExistingAccount, (request, response) => {
  const customer = request.customer

  return response.json(customer.statement)
})

routes.post('/deposit', verifyAnExistingAccount, (request, response) => {
  const { value, description } = request.body

  const customer = request.customer

  const statementOperation = {
    description,
    value,
    created_at: new Date(),
    type: 'credit',
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()
})

exports.routes = routes
