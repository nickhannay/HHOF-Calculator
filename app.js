const express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const PORT = 8080


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src', 'views'))
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({ extended: true }));


// routes
const indexRoute = require('./src/routes/index')
app.use('/', indexRoute)

const searchPlayerRoute = require('./src/routes/searchPlayer')
app.use('/search', searchPlayerRoute)




app.use(express.static(path.join(__dirname, 'public')))





app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`)
})