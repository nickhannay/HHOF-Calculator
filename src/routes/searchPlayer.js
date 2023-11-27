const express = require('express')

const router = express.Router()

const BASE_URL = "https://search.d3.nhle.com/api/v1/search/player"

router.post('/', async (req, res) => {
        const name = req.body["search-input"]
        console.log(`received search request for [${name}]`)

        
        // make get request to external API
        const playerResults = await getSearchResults(name, 25)


        //console.log(`Results: ${JSON.stringify(playerResults)}`)
        res.render('index', {content: 'index', results : playerResults, searchTerm: name});
})


async function getSearchResults(searchName, limit){
        let players = []
        if(searchName){
                const searchParams = {
                        limit: limit,
                        culture: 'en-us',
                        q: searchName
                }
        
                const searchUrl = new URL(BASE_URL)
                searchUrl.search = new URLSearchParams(searchParams).toString()
                const searchResults = await fetch(searchUrl)
                const resultsJSON = await searchResults.json()
        
                
                resultsJSON.forEach( (player) => {
                        players.push({name: player.name, id: player.playerId})
                })
        }
        console.log(players)
        return players

}


module.exports = router