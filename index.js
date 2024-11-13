require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

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

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', function getBody(req){
    console.log("req body", req.body)
    if (req.body){
        return JSON.stringify(req.body)
    } else {
        return ""
    }
    
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
    response.send('<h1>Hellow World!</h1>')
})

app.get('/info', (request, response) => {
    const date = new Date()
    Person.find({}).then(result => {
        response.send(`
        <text>Phonebook has info for ${result.length} people</text>
        <br>
        <text>${date.toUTCString()} </text>`)
    })
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        console.log("phonebook: ")
        response.json(result)
    })
   
})

app.get('/api/persons/:id', (request, response, next) => {
    /*const id = request.params.id
    const person = persons.find(person => person.id === id)

    if(person){
        response.json(person)
    } else {
        response.status(404).end()
    }*/

    Person.findById(request.params.id)
        .then(person => {
            if (person){
                response.json(person)
            } else{
                response.status(404).end()
            }
        })
        .catch(error =>next(error))
})

app.put('/api/persons/:id', (request, response, next) =>{
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson =>{
            response.json(updatedPerson)
        })
        .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response) => {
    /*const id = request.params.id 
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()*/
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
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

    /*const nameExists = persons.find(person => person.name === body.name)
    if (nameExists){
        return response.status(409).json({
            error: 'name must be unique'
        })
    }*/

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(person)
    })
    //persons = persons.concat(person)

})

const generateId = () => {
    return String(Math.floor(Math.random() * 9999));
}

//app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) =>{
    console.error(error.message)

    if (error.name === "CastError") {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})