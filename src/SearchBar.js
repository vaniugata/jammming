import React, { useState } from 'react';
import SearchResults from './SearchResults';
import Playlist from './Playlist';
import styles from './SearchBar.module.css';
import style from './SearchResults.module.css'
import { HandleDevToken } from './spotify-access-token';

export default function SearchBar() {

    const [searchBar, setSearchBar] = useState('')
    const [playlist, setPlaylist] = useState([])
    const [playlistName, setPlaylistName] = useState('')
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [errorMessage, setErrorMessage] = useState('')



    const fetchTracks = async (searchTerm) => {
        // const accessToken = localStorage.getItem('DevToken');
        const accessToken = localStorage.getItem('user_token');


        const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await response.json();

        if (data.tracks && data.tracks.items) {
            const trackData = data.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));

            setFilteredSongs(trackData); // Store tracks in state
            setErrorMessage('')
        } else {
            setErrorMessage('No results found :(')
        }

    };


    const handleChange = (event) => {
        event.preventDefault()
        setSearchBar(event.target.value)

    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (searchBar.length > 0) {

            fetchTracks(searchBar)

        }
    }

    const addToPlaylist = (song) => {
        const songExists = playlist.some(playlistSong =>
            playlistSong.name === song.name && playlistSong.artist === song.artist
        );
        if (!songExists) {
            setPlaylist(prevPlaylist => [...prevPlaylist, song]);
        }
        console.log('Current Playlist:', playlist);
    }

    const removeSong = (songToRemove) => {
        setPlaylist(playlist.filter(song => song !== songToRemove))
    }

    const handleNameChange = (event) => {
        setPlaylistName(event.target.value)
    }

    const getUserId = async () => {

        const accessToken = localStorage.getItem('user_token')
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            console.log(data)
            return data.id; // Returns the user's Spotify ID
        }
        catch (error) {
            console.error('Error getting ID', error);
        }
    };

    const createSpotifyPlaylist = async (userId, playlistName, accessToken) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playlistName,
                    description: 'Playlist created from my app',
                    public: false // Set to false if you want the playlist to be private
                })
            });

            const data = await response.json();
            return data.id; // Returns the new playlist ID
        }
        catch (error) {
            console.error('Error creating Spotify playlist', error)
        }

    };


    //Add songs to playlist in Spotify

    const addTracksToPlaylist = async (playlistId, trackUris, accessToken) => {
        try {
            await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: trackUris // Array of track URIs to add to the playlist
                })
            });
        }
        catch (error) {
            console.error('Error adding songs', error)
        }
    };


    // Save the playlist in Spotify

    const savePlaylist = async (playlistName, playlist) => {
        try {
            const token = localStorage.getItem('user_token');
            const userId = await getUserId();
            const playlistId = await createSpotifyPlaylist(userId, playlistName, token);

            const trackUris = playlist.map(song => song.uri);
            await addTracksToPlaylist(playlistId, trackUris, token);

            console.log('Playlist saved successfully!');
        } catch (error) {
            console.error('Error saving playlist:', error);
        }
    };

    return (
        <div>
            <div className={styles.Orangesphere}></div>
            <div className={styles.Pinksphere}></div>
            <div className={styles.Bluesphere}></div>
            <div className={styles.glassContainer}>
                <h1 className={styles.h1}>Jammming</h1>
                <div className={styles.searchBarForm}>
                    <form onSubmit={(event) => {
                        HandleDevToken();
                        handleSubmit(event)
                    }
                    }>
                        <input type="text" value={searchBar} onChange={handleChange} placeholder='Search by title or artist'></input>
                        <button type='submit' className={styles.button}>Search</button>
                    </form>
                </div>
                <div className={styles.resultsAndPlaylist}>
                    <div>
                        {errorMessage !== '' ? (
                            <h2 className={style.h2}>{errorMessage}</h2>
                        ) : (
                            filteredSongs.length > 0 && (
                                <SearchResults songs={filteredSongs} onAdd={addToPlaylist} />
                            )
                        )}
                    </div>
                    <div>
                        {
                            playlist.length > 0 &&
                            <Playlist playlist={playlist}
                                playlistName={playlistName}
                                onRemove={removeSong}
                                onNameChange={handleNameChange}
                                savePlaylist={() => {
                                    savePlaylist(playlistName, playlist);
                                }}
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};


