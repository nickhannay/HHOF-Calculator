const express = require('express')

const router = express.Router()

const BASE_URL = 'https://api-web.nhle.com/v1/player/'


router.get('/:id', async (req, res) => {

        const playerId = req.params.id

        const searchUrl = BASE_URL + playerId + '/landing'

        const response = await fetch(searchUrl)
        const playerData = await response.json()


        const hofScore = hofCalculator(playerData)
        res.render('playerinfo', {player: playerData, hofProbability: hofScore})
})

module.exports = router


function hofCalculator(player){
        
        const awards = getAwards(player)
        const regularSeason = player.careerTotals.regularSeason
        const playoffs = player.careerTotals.playoffs || {points : 0}
        let hofScore = 0;

        if(player.position === 'G'){
                

               

        } else{

                const playerWeights = {
                        ppg: { w: 0.18, max: 1.921, prop: 'ppg'},
                        gamesPlayed: {w: 0.07, max: 1779, prop: 'gamesPlayed'},
                        points: {w:0.15, max: 2857, prop: 'points'},
                        playoffPoints: {w:0.13, max: 382, prop: 'playoffPoints'},
                        hart: {w:0.25, max: 9, prop: 'hart'},
                        norris: {w:0.2, max: 7, prop: 'norris'},
                        connSmythe: {w:0.21, max: 3, prop: 'connSmythe'},
                        stanleyCups: {w:0.1, max:11, prop: 'stanleyCup'},
                        gpg: {w:0.1, max:0.76, prop: 'gpg'},
                        selke: {w:0.09, max:6, prop: 'selke'},
                        apg: {w:0.1, max:1.32, prop: 'apg'},
                        ladyBing: {w:0.05, max:7, prop: 'ladyBing'},
                        goals: {w:0.16, max:894, prop: 'goals'},
                        artRoss: {w:0.2, max: 10, prop: 'artRoss'},
                        rocket: {w:0.12, max: 8, prop: 'rocket'},
                        tedLindsay: {w:0.18, max:5, prop: 'tedLindsay'},
                        assists: {w:0.1, max: 1963, prop: 'assists'}
                }

                for( const key in playerWeights){
                        const {w, max, prop} = playerWeights[key]
                        switch(prop){
                                case 'ppg':
                                        hofScore += (w * (regularSeason.points / regularSeason.gamesPlayed)/max)
                                        break
                                case 'playoffPoints':
                                        hofScore += (w * (playoffs.points)/ max)
                                        break
                                case 'gpg':
                                        hofScore += (w * (regularSeason.goals / regularSeason.gamesPlayed)/max)
                                        break
                                case 'apg':
                                        hofScore += (w * (regularSeason.assists / regularSeason.gamesPlayed)/max)
                                        break
                                default:
                                        let val = regularSeason[prop] === undefined ? awards[prop] : regularSeason[prop]
                                        hofScore += (w * (val / max))
                                        break
                        }
                
                }

        }
        return hofScore

}


function getAwards(player){
        const awards = {
                selke :0,
                hart :0,
                norris : 0,
                rocket : 0,
                artRoss : 0,
                ladyBing: 0,
                connSmythe: 0,
                stanleyCup: 0,
                tedLindsay: 0,
                vezina : 0
        }

        if(player.awards){
                player.awards.forEach((award) => {
                        switch(award.trophy.default){
                                case "Art Ross Trophy":
                                        awards.artRoss = award.seasons.length
                                        break
                                case "Conn Smythe Trophy":
                                        awards.connSmythe = award.seasons.length
                                        break
                                case "Hart Memorial Trophy":
                                        awards.hart = award.seasons.length
                                        break
                                case "Maurice “Rocket” Richard Trophy":
                                        awards.rocket = award.seasons.length
                                        break
                                case "Stanley Cup":  
                                        awards.stanleyCup = award.seasons.length  
                                        break
                                case "Frank J. Selke Trophy":
                                        awards.selke = award.seasons.length
                                        break
                                case "Lady Byng Memorial Trophy":
                                        awards.ladyBing = award.seasons.length
                                        break
                                case "James Norris Memorial Trophy":
                                        awards.norris = award.seasons.length
                                        break
                                case "Ted Lindsay Award":
                                        awards.tedLindsay = award.seasons.length
                                        break
                                case "Vezina Trophy":
                                        awards.vezina = award.seasons.length
                                        break
                                default:
                                        // do nothing
                                        break
                        }
                })
        }
        return awards
}