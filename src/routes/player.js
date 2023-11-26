const express = require('express')

const router = express.Router()

const BASE_URL = 'https://api-web.nhle.com/v1/player/'
//8471675/landing

router.get('/:id', async (req, res) => {

        const playerId = req.params.id

        const searchUrl = BASE_URL + playerId + '/landing'

        const response = await fetch(searchUrl)
        const playerData = await response.json()

        res.render('playerinfo', {player: playerData})
})

module.exports = router