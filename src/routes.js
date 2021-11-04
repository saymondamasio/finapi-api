const { Router } = require('express')
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

exports.routes = routes
