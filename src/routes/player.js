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

        

        const awards = {
                numSelke :0,
                numHart :0,
                numNorris : 0,
                numRocket : 0,
                numArtRoss : 0,
                numLadyBing: 0,
                numConnSmythe: 0,
                numStanleyCup: 0,
                numTedLindsay: 0,
                numVezina : 0
        }


        if(player.awards){
                player.awards.forEach((award) => {
                        switch(award.trophy.default){
                                case "Art Ross Trophy":
                                        awards.numArtRoss = award.seasons.length
                                        break
                                case "Conn Smythe Trophy":
                                        awards.numConnSmythe = award.seasons.length
                                        break
                                case "Hart Memorial Trophy":
                                        awards.numHart = award.seasons.length
                                        break
                                case "Maurice “Rocket” Richard Trophy":
                                        awards.numRocket = award.seasons.length
                                        break
                                case "Stanley Cup":  
                                        awards.numStanleyCup = award.seasons.length  
                                        break
                                case "Frank J. Selke Trophy":
                                        awards.numSelke = award.seasons.length
                                        break
                                case "Lady Byng Memorial Trophy":
                                        awards.numLadyBing = award.seasons.length
                                        break
                                case "James Norris Memorial Trophy":
                                        awards.numNorris = award.seasons.length
                                        break
                                case "Ted Lindsay Award":
                                        awards.numTedLindsay = award.seasons.length
                                        break
                                case "Vezina Trophy":
                                        awards.numVezina = award.seasons.length
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
        let hofScore = 0;
        if(player.position === 'G'){
                

               

        } else{

                const playerWeights = {
                        ppg: { w: 0.18, max: 1.921},
                        gamesPlayed: {w: 0.07, max: 1779},
                        points: {w:0.15, max: 2857},
                        playoffPoints: {w:0.13, max: 382},
                        hart: {w:0.25, max: 9},
                        norris: {w:0.2, max: 7},
                        connSmythe: {w:0.21, max: 3},
                        stanleyCups: {w:0.1, max:11},
                        gpg: {w:0.1, max:0.76},
                        selke: {w:0.09, max:6},
                        apg: {w:0.1, max:1.32},
                        ladyBing: {w:0.05, max:7},
                        goals: {w:0.16, max:894},
                        artRoss: {w:0.2, max: 10},
                        rocket: {w:0.12, max: 8},
                        tedLindsay: {w:0.18, max:5},
                        assists: {w:0.1, max: 1963}
                }


                hofScore = 
                        playerWeights.ppg.w * ((regularSeason.points / regularSeason.gamesPlayed)/playerWeights.ppg.max) + 
                        playerWeights.gamesPlayed.w * (regularSeason.gamesPlayed / playerWeights.gamesPlayed.max) +
                        playerWeights.points.w * (regularSeason.points/ playerWeights.points.max) +
                        playerWeights.playoffPoints.w * (playoffs.points / playerWeights.playoffPoints.max) +
                        playerWeights.gpg.w * ((regularSeason.goals / regularSeason.gamesPlayed)/playerWeights.gpg.max) + 
                        playerWeights.apg.w * ((regularSeason.assists / regularSeason.gamesPlayed)/playerWeights.apg.max) + 
                        playerWeights.goals.w * (regularSeason.goals / playerWeights.goals.max) +
                        playerWeights.hart.w * (numHart/ playerWeights.hart.max) + 
                        playerWeights.connSmythe.w * (numConnSmythe / playerWeights.connSmythe.max) +
                        playerWeights.norris.w * (numNorris / playerWeights.norris.max) + 
                        playerWeights.ladyBing.w * (numLadyBing / playerWeights.ladyBing.max) +
                        playerWeights.stanleyCups.w * (numStanleyCup / playerWeights.stanleyCups.max) + 
                        playerWeights.rocket.w * (numRocket / playerWeights.rocket.max) + 
                        playerWeights.selke.w * (numSelke / playerWeights.selke.max) + 
                        playerWeights.tedLindsay.w * (numTedLindsay / playerWeights.tedLindsay.max) + 
                        playerWeights.assists.w * ( regularSeason.assists / playerWeights.assists.max) + 
                        playerWeights.artRoss.w * (numArtRoss / playerWeights.artRoss.max)
        }

        
        
                        



        console.log(`HOF Score: ${hofScore}`)
        

        return hofScore

}