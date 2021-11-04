const { Router, application } = require('express')
const { v4 } = require('uuid')

const routes = Router()

const costumers = []

routes.post('/accounts', (request, response) => {
  const { name, cpf } = request.body

  const customerAlreadyExists = costumers.some(customer => customer.cpf === cpf)

  if (customerAlreadyExists) {
    return response.status(400).json({ error: 'Customer already exists' })
  }

  const consumer = {
    id: v4(),
    name,
    cpf,
    statement: [],
  }

  costumers.push(consumer)

  response.status(201).send()
})

routes.get('/statement', (request, response) => {
  const { cpf } = request.headers

  const customer = costumers.find(customer => customer.cpf === cpf)

  if (!customer) {
    return response.status(400).json({ error: 'Customer not found' })
  }

  return response.json(customer.statement)
})

exports.routes = routes
