import Spotify from 'spotify-web-api-js'
import uniq from 'lodash.uniq'
import flatten from 'lodash.flatten'
import chunk from 'lodash.chunk'

export function loginRedirect() {
  return 'http://localhost:3001/login'
}

export function checkForAccessToken() {
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  let accessToken = hashParams.get('access_token')
  let refreshToken = hashParams.get('refresh_token')
  if (!accessToken) {
    return false
  } else {
    return accessToken
  }
}
