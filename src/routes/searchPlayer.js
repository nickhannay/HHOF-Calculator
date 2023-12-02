const express = require('express')

const router = express.Router()

const SEARCH_URL = "https://search.d3.nhle.com/api/v1/search/player"
const BASE_URL = 'https://api-web.nhle.com/v1/player/'

router.post('/', async (req, res) => {
        const name = req.body["search-input"]
        console.log(`received search request for [${name}]`)

        
        // make get request to external API
        const playerResults = await getSearchResults(name)
        res.render('index', { results : playerResults, searchTerm: name});
})





async function getSearchResults(searchName){
        let players = []
        if(searchName){
                const searchParams = {
                        culture: 'en-us',
                        q: searchName
                }
        
                const searchUrl = new URL(SEARCH_URL)
                searchUrl.search = new URLSearchParams(searchParams).toString()
                const searchResults = await fetch(searchUrl)
                const resultsJSON = await searchResults.json()
                console.log(resultsJSON)
        
                await Promise.all(resultsJSON.map(async (player) => {
                    if (player.lastSeasonId !== null) {
                      try {
                        const headShotResponse = await fetch(BASE_URL + player.playerId + '/landing');
                        const playerDetails = await headShotResponse.json();
                        const headShotSrc = playerDetails.headshot; 
                        players.push({ name: player.name, id: player.playerId, headShot: headShotSrc });

                      } catch (error) {
                        console.error(`Error retrieving player headshots: ${error}`);
                      }
                    }
                  }));
        }
        console.log(players)
        return players

}


module.exports = router