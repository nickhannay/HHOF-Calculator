const express = require('express')

const router = express.Router()

router.post('/', (req, res) => {
        console.log(`received search request for [${JSON.stringify(req.body)}]`)




        
        res.json({ message: 'Request received successfully' });
})

module.exports = router 