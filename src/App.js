import React, { Component } from 'react'
import SpotifyPlayer from 'react-spotify-player'
import spotifyWebApi from 'spotify-web-api-js'
import './App.css'
require('inter-ui')
const Spotify = new spotifyWebApi()

let defaultStyle = {
  color: '#fff',
  'font-family': 'Inter, sans-serif',
  'font-weight': '500'
}
let counterStyle = {
  ...defaultStyle,

  'font-size': '20px',
  'line-height': '30px'
}

/* PLAYLISTCOUNTER COMP */
class PlaylistCounter extends Component {
  render() {
    let playlistCounterStyle = counterStyle
    return (
      <div style={playlistCounterStyle}>
        <h2>{this.props.playlists.length} playlists</h2>
      </div>
    )
  }
}

/* FILTER COMP */
class Filter extends Component {
  render() {
    return (
      <div style={defaultStyle}>
        <img />
        <input
          type="text"
          onKeyUp={event => this.props.onTextChange(event.target.value)}
          style={{
            ...defaultStyle,
            color: 'black',
            'font-size': '20px',
            padding: '10px'
          }}
        />
      </div>
    )
  }
}

/* PLAYLIST COMP */
class Playlist extends Component {
  render() {
    let playlist = this.props.playlist
    return (
      <div
        style={{
          ...defaultStyle,
          padding: '10px'
        }}
      >
        <div className="internalGridItems">
          <img src={playlist.imageUrl} style={{ width: '100%' }} />
          <h2 className="plistName"> {playlist.name} </h2>
          <ul className="playlistUl">
            <SpotifyPlayer
              // uri={playlist.uri}
              size="large"
              theme="white"
              view="coverart"
            />{' '}
            feat:
            {playlist.songs.map(song => (
              <li className="featSongs"> - {song.name} </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

/* MAIN COMP */
class App extends Component {
  constructor() {
    super()
    this.state = {
      serverData: {},
      filterString: ''
    }
  }

  componentDidMount() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    let accessToken = hashParams.get('access_token')
    let refreshToken = hashParams.get('refresh_token')
    // Spotify.setAccessToken(accessToken)
    if (!accessToken) return
    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: 'Bearer ' + accessToken }
    })
      // Spotify.getMe()
      .then(res => res.json())
      .then(data =>
        this.setState({
          user: {
            name: data.display_name,
            avatar: data.images[0].url
          }
        })
      )

    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: 'Bearer ' + accessToken }
    })
      // Spotify.getPlaylists()
      .then(res => res.json())
      .then(playlistData => {
        let playlists = playlistData.items

        let trackDataPromises = playlists.map(playlist => {
          let resPromise = fetch(playlist.tracks.href, {
            headers: { Authorization: 'Bearer ' + accessToken }
          })
          let trackDataPromise = resPromise.then(res => res.json())
          return trackDataPromise
        })

        let allTracksDataPromises = Promise.all(trackDataPromises)

        let playlistsPromise = allTracksDataPromises.then(trackDatas => {
          trackDatas.forEach((trackData, i) => {
            playlists[i].trackDatas = trackData.items
              .map(item => item.track)
              .map(trackData => ({
                name: trackData.name,
                duration: trackData.duration_ms / 1000
              }))
          })
          return playlists
        })
        return playlistsPromise
      })

      .then(playlists =>
        this.setState({
          playlists: playlists.map(item => {
            return {
              name: item.name,
              imageUrl: item.images[0].url,
              uri: item.uri,
              songs: item.trackDatas.slice(0, 3)
            }
          })
        })
      )
  }

  render() {
    let playlistToRender =
      this.state.user && this.state.playlists
        ? this.state.playlists.filter(playlist => {
            let matchedPlaylist = playlist.name
              .toLowerCase()
              .includes(this.state.filterString.toLowerCase())
            let matchedSong = playlist.songs.find(song =>
              song.name
                .toLowerCase()
                .includes(this.state.filterString.toLowerCase())
            )
            return matchedPlaylist || matchedSong
          })
        : []

    return (
      <div className="App">
        {this.state.user ? (
          <div>
            <div className="topItems">
              <h1 className="playlistName">
                {' '}
                <img src={this.state.user.avatar} alt="avatar" />
                {this.state.user.name}'s Playlists
              </h1>
              <div className="plistCounter">
                <PlaylistCounter playlists={playlistToRender} />
              </div>

              <Filter
                className="mainFilter"
                onTextChange={text => this.setState({ filterString: text })}
              />
              <img
                src={require('./images/Spotify_Icon_RGB_Green.png')}
                className="spotifyIcon"
              />
            </div>

            <div className="playlistGridStyle">
              {playlistToRender.map((playlist, i) => (
                <Playlist playlist={playlist} index={i} />
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              'align-self': 'center',
              'jusity-self': 'center'
            }}
          >
            <button
              onClick={() => {
                window.location = 'http://localhost:3001/login'
              }}
              style={{
                padding: '20px',
                'font-size': ' 35px',
                'margin-top': '150px',
                'background-color': '#2FD566',
                border: 'none',
                width: '35%',
                'justify-self': 'center',
                'border-radius': '50px',
                color: 'white',
                'font-family':
                  'HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif',
                'font-weight': '700',
                'align-self': 'center'
              }}
            >
              Sign in with Spotify
              <img
                src={require('./images/kids_sharin.jpg')}
                style={{ padding: '5px 0 0 15px', height: '32px' }}
              />{' '}
            </button>
          </div>
        )}
      </div>
    )
  }
}

export default App
