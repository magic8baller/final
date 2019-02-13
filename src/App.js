import React, { Component } from 'react'
import SpotifyPlayer from 'react-spotify-player'
import './App.css'
require('inter-ui')
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

/* PLAYLISTCOUNTER COMPONENT */
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

/* HOURSCOUNTER COMPONENT */
class HoursCounter extends Component {
  render() {
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) => {
      return songs.concat(eachPlaylist.songs)
    }, [])

    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration
    }, 0)
    let totalDurationHours = Math.round(totalDuration / 60)
    let isTooLow = totalDurationHours < 40
    let hoursCounterStyle = {
      ...counterStyle,

      color: isTooLow ? '#2FD566' : 'white',
      'font-weight': isTooLow ? 'bold' : 'normal'
    }
    return (
      <div style={hoursCounterStyle}>
        <h2>{totalDurationHours} hours</h2>
      </div>
    )
  }
}

/* FILTER COMPONENT */
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

/* PLAYLIST COMPONENT */
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
        <div
          className="internalGridItems"
          style={{
            display: 'grid',
            'grid-template-columns': '1fr'
          }}
        >
          <img src={playlist.imageUrl} style={{ width: '100%' }} />
          <h2
            style={{
              'margin-top': '10px',
              'font-size': '22px',
              'font-style': 'bold',
              'font-family':
                'HelveticaNeue, Helvetica Neue, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif',

              color: '#fff'
            }}
          >
            {' '}
            {playlist.name}{' '}
          </h2>
          <ul
            style={{
              'margin-top': '10px',
              'font-weight': 'bold',
              color: '#AEAEAE',
              'font-family': 'Inter, sans-serif',
              'font-weight': '500',
              'font-style': 'italic',
              'font-size': '14px'
            }}
          >
            <SpotifyPlayer
              uri={playlist.uri}
              size="large"
              theme="white"
              view="coverart"
            />{' '}
            feat:
            {playlist.songs.map(song => (
              <li
                style={{
                  'padding-top': '2px',
                  'font-style': 'normal',
                  'font-size': '14px',
                  'margin-left': '10px'
                }}
              >
                {' '}
                - {song.name}{' '}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

/* MAIN COMPONENT */
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
    if (!accessToken) return
    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: 'Bearer ' + accessToken }
    })
      .then(response => response.json())
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
      .then(response => response.json())
      .then(playlistData => {
        let playlists = playlistData.items

        let trackDataPromises = playlists.map(playlist => {
          let responsePromise = fetch(playlist.tracks.href, {
            headers: { Authorization: 'Bearer ' + accessToken }
          })
          let trackDataPromise = responsePromise.then(response =>
            response.json()
          )
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
              // imageUrl: item.images[0].url,
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
            let matchesPlaylist = playlist.name
              .toLowerCase()
              .includes(this.state.filterString.toLowerCase())
            let matchesSong = playlist.songs.find(song =>
              song.name
                .toLowerCase()
                .includes(this.state.filterString.toLowerCase())
            )
            return matchesPlaylist || matchesSong
          })
        : []

    return (
      <div className="App">
        {this.state.user ? (
          <div>
            <div
              className="topItems"
              style={{
                margin: '15px',
                display: 'grid',
                'grid-template-columns': '3fr 1fr 1fr 0.5fr',
                'align-items': 'center',
                'justify-items': 'center',
                'background-color': 'black',
                padding: '15px 5px 15px 5px'
              }}
            >
              <h1
                className="playlistName"
                style={{
                  color: '#2FD566',
                  'font-size': '34px',
                  'font-family': 'Inter, sans-serif',
                  'font-weight': '700',
                  'justify-self': 'start',
                  'margin-left': '30px'
                }}
              >
                {' '}
                <img src={this.state.user.avatar} alt="avatar" />
                {this.state.user.name}'s Playlists
              </h1>
              <div
                className="bothCounters"
                style={{ 'text-align': 'right', width: '80%' }}
              >
                <PlaylistCounter playlists={playlistToRender} />
                <HoursCounter playlists={playlistToRender} />
              </div>

              <Filter
                className="mainFilter"
                onTextChange={text => this.setState({ filterString: text })}
              />
              <img
                src={require('./images/Spotify_Icon_RGB_Green.png')}
                className="spotifyIcon"
                style={{ 'padding-left': '5px', height: '42px' }}
              />
            </div>

            <div
              className="playlistGridStyle"
              style={{
                display: 'grid',
                'grid-template-columns': 'repeat(4, 1fr)',
                'grid-gap': '20px',
                'background-color': '#181818',
                'margin-top': '15px',
                padding: '30px 15px 30px 15px'
              }}
            >
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
