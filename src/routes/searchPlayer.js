const express = require('express')

const router = express.Router()

const BASE_URL = "https://search.d3.nhle.com/api/v1/search/player"

router.post('/', (req, res) => {
        console.log(`received search request for [${JSON.stringify(req.body)}]`)

        
        // make get request to external API
        const name = req.body['name']
        const response = getPlayer(name)


        res.json({ message: 'Request received successfully' });
})


async function getPlayer(name){
        const searchParams = {
                limit: '25',
                culture: 'en-us',
                q: name
        }

        const searchUrl = new URL(BASE_URL)
        searchUrl.search = new URLSearchParams(searchParams).toString()

        const searchResults = await fetch(searchUrl)

        searchResults.json()
        .then( data => {
                console.log(data)
                data
        })
        .catch( e => {
                console.log(`Error: ${e}`)
                e
        })


}


module.exports = router 