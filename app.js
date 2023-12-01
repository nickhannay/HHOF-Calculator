const express = require('express')
const path = require('path')
const cors = require('cors')
const favicon = require('serve-favicon')
const {validationResults, body } = require('express-validator') // look up proper use
const app = express()
const PORT = 8080

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src', 'views'))


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: true}))





// routes
const indexRoute = require('./src/routes/index')
app.use('/', indexRoute)

const searchPlayerRoute = require('./src/routes/searchPlayer')
app.use('/search', searchPlayerRoute)

const displayPlayerRoute = require('./src/routes/player')
app.use('/player', displayPlayerRoute)


app.use(express.static(path.join(__dirname, 'public')))




app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`)
})