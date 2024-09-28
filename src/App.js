import React from 'react';
import SearchBar from './SearchBar';
import { SpotifyLoginRedirect } from './spotify-access-token';

function App() {
    return (
        <>
            <SearchBar />
            <SpotifyLoginRedirect />
        </>
    )
}

export default App;
