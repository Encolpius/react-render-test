require('dotenv').config()
const Note = require('./models/note')
const PORT = process.env.PORT
const http = require('http')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
    const body = request.body
    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    const note = new Note({
        content: body.content,
        important: body.important || false
    })
    note.save().then(savedNote => {
        response.json(savedNote)
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body
    Note.findById(request.params.id)
    .then(note => {
        if (!note) {
            return response.status(404).end()
        }

        note.content = content
        note.important = important

        return note.save().then(updatedNote => {
            response.json(updatedNote)
        })
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: "Unknown endpoint"})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name = 'CastError') {
        return response.status(400).send({error: "Malformed ID"})
    } else if (error.name = 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)