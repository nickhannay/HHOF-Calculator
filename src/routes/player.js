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
        /*if(player.inHHOF === 1){
                return 100
        }*/

        let numSelke = 0
        let numHart = 0
        let numNorris = 0
        let numRocket = 0
        let numArtRoss = 0
        let numLadyBing = 0
        let numConnSmythe = 0
        let numStanleyCup = 0
        let numTedLindsay = 0

        const weights = {
                ppg: 0.18,
                gamesPlayed: 0.07,
                points: 0.15,
                playoffPoints: 0.13,
                hart: 0.25,
                norris: 0.16,
                connSmythe: 0.21,
                stanleyCups: 0.1,
                gpg: 0.09,
                selke: 0.1,
                apg: 0.1,
                ladyBing: 0.05,
                goals: 0.16,
                artRoss: 0.15,
                rocket: 0.12,
                tedLindsay: 0.18,
                assists: 0.1
        }

        const maxValues = {
                ppg: 1.921,
                gamesPlayed: 1779,
                points: 2857,
                playoffPoints: 382,
                hart: 9,
                norris: 7,
                connSmythe: 3,
                stanleyCups: 11,
                gpg: 0.76,
                selke: 6,
                apg: 1.32,
                ladyBing: 7,
                goals: 894,
                artRoss: 10,
                rocket: 8,
                tedLindsay: 5,
                assists: 1963
        }


        if(player.awards){
                player.awards.forEach((award) => {
                        switch(award.trophy.default){
                                case "Art Ross Trophy":
                                        numArtRoss = award.seasons.length
                                        break
                                case "Conn Smythe Trophy":
                                        numConnSmythe = award.seasons.length
                                        break
                                case "Hart Memorial Trophy":
                                        numHart = award.seasons.length
                                        break
                                case "Maurice “Rocket” Richard Trophy":
                                        numRocket = award.seasons.length
                                        break
                                case "Stanley Cup":  
                                        numStanleyCup = award.seasons.length  
                                        break
                                case "Frank J. Selke Trophy":
                                        numSelke = award.seasons.length
                                        break
                                case "Lady Byng Memorial Trophy":
                                        numLadyBing = award.seasons.length
                                        break
                                case "James Norris Memorial Trophy":
                                        numNorris = award.seasons.length
                                        break
                                case "Ted Lindsay Award":
                                        numTedLindsay = award.seasons.length
                                        break
                                default:
                                        // do nothing
                                        break
                        }
                })
        }
        else{
                console.log("No Trophies")
        }

        const regularSeason = player.careerTotals.regularSeason
        const playoffs = player.careerTotals.playoffs
        stats = {
                
                gamesPlayed : regularSeason.gamesPlayed,
                points : regularSeason.points,
                goals : regularSeason.goals,
                ppg : regularSeason.points / regularSeason.gamesPlayed,
                playoffPoints : playoffs.points,
                gpg : regularSeason.goals / regularSeason.gamesPlayed,
                apg : regularSeason.assists / regularSeason.gamesPlayed,
                assists : regularSeason.assists
        }
        console.log(JSON.stringify(stats))
        
        console.log(`${weights.points} * (${stats.points}/ ${maxValues.points}) `)
        const HOFScore = weights.ppg * (stats.ppg/maxValues.ppg) + 
                        weights.gamesPlayed * (stats.gamesPlayed / maxValues.gamesPlayed) +
                        weights.points * (stats.points/ maxValues.points) +
                        weights.playoffPoints * (stats.playoffPoints / maxValues.playoffPoints) +
                        weights.gpg * (stats.gpg/maxValues.gpg) + 
                        weights.apg * (stats.apg/maxValues.apg) + 
                        weights.goals * (stats.goals / maxValues.goals) +
                        weights.hart * (numHart/ maxValues.hart) + 
                        weights.connSmythe * (numConnSmythe / maxValues.connSmythe) +
                        weights.norris * (numNorris / maxValues.norris) + 
                        weights.ladyBing * (numLadyBing / maxValues.ladyBing) +
                        weights.stanleyCups * (numStanleyCup / maxValues.stanleyCups) + 
                        weights.rocket * (numRocket / maxValues.rocket) + 
                        weights.selke * (numSelke / maxValues.selke) + 
                        weights.tedLindsay * (numTedLindsay / maxValues.tedLindsay) + 
                        weights.assists * ( stats.assists / maxValues.assists)
                        



        console.log(`HOF Score: ${HOFScore}`)
        

        return HOFScore

}