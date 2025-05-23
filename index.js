require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
//const mongoose = require('mongoose')
const Note = require('./models/notes')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

//const Note = mongoose.model('Note', noteSchema)

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })
  
  app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
  })

  /* app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  console.log(id)
  const note = notes.find(note => note.id === id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
  
  }) */

  app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id).then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => 
      next(error)
      //console.log('******************Este error es: ******************');
      //console.dir(error, { showHidden: true })
  )})

  app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
  })

app.put('/api/notes/:id', (request, response, next) => {
    //const body = request.body
    const { content, important } = request.body

    /* const note = {
      content: body.content,
      important: body.important,
    } */

  
    Note.findByIdAndUpdate(request.params.id, { content, important }, { new: true, runValidators: true, context: 'query' })
      .then(updatedNote => {
        response.json(updatedNote)
      })
      .catch(error => next(error))
  })  

  /* app.post('/api/notes', (request, response) => {
    const note = request.body
    console.log(note)
    response.json(note)
  }) */

const generateId = () => {
    const maxId = notes.length > 0
          ? Math.max(...notes.map(n => n.id))
          : 0
    return maxId + 1
}

/* app.post('/api/notes', (request, response) => {

    const body = request.body

  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const note = {
    content: body.content,
    important: Boolean(body.important) || false,
    id: generateId(),
  }

  notes = notes.concat(note)
  response.json(note)

})  */ 

app.post('/api/notes', (request, response, next) => {
    const body = request.body
  
    /* if (body.content === undefined) {
      return response.status(400).json({ error: 'content missing' })
    } */
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
    })
  
    note.save().then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})  

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.log('******************Este error es: ******************');
  console.dir(error, { showHidden: true })
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)
  
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})