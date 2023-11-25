const express = require('express')
const path = require('path')

const app = express()
const PORT = 8080




// routes
const indexRoute = require('./src/routes/index')
app.use('/', indexRoute)




app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'EJS')
app.set('views', path.join(__dirname, 'src', 'views'))



app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`)
})