require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('request', function (tokens, req, res) {
    return JSON.stringify(tokens, req, res)
}) 

app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens['request'](req.body)
    ].join(' ')
}))

const generateId = () => {
    const id = Math.floor(Math.random() * 50000)
    return id
}

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}) 

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    },  
]

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has ${persons.length} people </p> <br>
            ${new Date()}`)
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res) => {
    /* const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
     */

    Person.findById(req.params.id).then(person => {
        res.json(person)
    })

   /*  if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    } */
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

app.post('/api/persons', (req,res) => {
    const body = req.body

    const personName = persons.map(function(person) {
        return person.name
    })


    if (!body.name) {
        return res.status(400).json({
            error: 'name missing'
        })
    } else if (!body.number) {
        return res.status(400).json({
            error: 'number missing'
        })
    } else if (personName.includes(body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }


    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    // persons = persons.concat(person)
    
    person.save().then(savedPerson => {
        res.json(savedPerson)
    })

})
