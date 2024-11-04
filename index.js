const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')

/*const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}*/

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.use(cors())
app.use(express.json())

morgan.token('body', function getBody(req){
    console.log("req body", req.body)
    if (req.body){
        return JSON.stringify(req.body)
    } else {
        return ""
    }
    
})
//:method :url :status :res[content-length] - :response-time ms
//app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
    response.send('<h1>Hellow World!</h1>')
})

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`
        <text>Phonebook has info for ${persons.length} people</text>
        <br>
        <text>${date.toUTCString()} </text>
    `)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if(person){
        response.json(person)
    } else {
        response.status(404).end()
    }

})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id 
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) =>{
    const body = request.body

    if (!body.name){
        return response.status(400).json({
            error: 'name missing'
        })
    } else if (!body.number){
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const nameExists = persons.find(person => person.name === body.name)
    if (nameExists){
        return response.status(409).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)
    response.json(person)
})

const generateId = () => {
    return String(Math.floor(Math.random() * 9999));
}

//app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})