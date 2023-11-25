const express = require('express')
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = 8080

app.use(express.json())
app.use(cors())


// routes
const indexRoute = require('./src/routes/index')
app.use('/', indexRoute)

const searchPlayerRoute = require('./src/routes/searchPlayer')
app.use('/searchPlayer', searchPlayerRoute)




app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'EJS')
app.set('views', path.join(__dirname, 'src', 'views'))



app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`)
})