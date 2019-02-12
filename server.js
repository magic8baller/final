const express = require('express')
const cors = require('cors')
const spotifyAuth = require('./spotify-auth')
const path = require('path')
const { URL } = require('url')
require('dotenv').config()

const { client_id, client_secret, redirect_uri } = process.env

// const client_id = '2bb803854dae4494a2598e2fab28a489'
// const client_secret = 'cca17d91730b4f4badea7e9b5f568f3f'
// const redirect_uri = 'http://localhost:3001/callback'

const port = new URL(redirect_uri).port

const app = express()

app
  .use(express.static(path.join(__dirname, 'public')))
  .use(cors())
  .use(spotifyAuth({ client_id, client_secret, redirect_uri }))

app.listen(port, () => console.log(`Listening on ${port}`))
