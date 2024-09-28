import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client_id, client_secret } from './credentials';

export function SpotifyLoginRedirect() {

    const redirectUri = 'http://localhost:3000/callback';
    const authEndpoint = 'https://accounts.spotify.com/authorize';
    const scopes = ['user-read-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private'];

    const params = new URLSearchParams({

        client_id: client_id,
        response_type: 'token',
        redirect_uri: redirectUri,
        scope: scopes.join(' ')
    });

    const url = `${authEndpoint}?${params.toString()}`;

    return (
        <div>
            <a href={url}>
                <button>Login to Spotify</button>
            </a>
        </div>
    );
};

export function Callback() {
    const navigate = useNavigate();
  
    useEffect(() => {
      // Extract the access token from the URL fragment
       const hash = window.location.hash;
      if (hash) {
        const token = hash
          .substring(1)
          .split("&")
          .find((elem) => elem.startsWith("access_token"))
          ?.split("=")[1];
  
        if (token) {
          // Store the token in localStorage
          localStorage.setItem("user_token", token);

          // Navigate to dashboard or another page after storing token
          navigate("/dashboard");
        }
      }
    }, [navigate]);
  
    return (
      <div>
        <h1>Processing Spotify Callback...</h1>
      </div>
    );
  };

export async function HandleDevToken() {

    const credentials = btoa(`${client_id}:${client_secret}`);

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
        },
        body: new URLSearchParams({
            'grant_type': 'client_credentials'
        })
    };

    try {

        const token = localStorage.getItem('DevToken');
        const has_expired = token !== undefined && Date.now() < localStorage.getItem("DevTokenExpiration");

        if (token && !has_expired) {
            return;
        }

        const response = await fetch('https://accounts.spotify.com/api/token', requestOptions);
        const data = await response.json();

        if (response.ok) {
            console.log('Access Token:', data.access_token);
            const expirationTime = Date.now() + data.expires_in * 1000;

            localStorage.setItem('DevToken', data.access_token);
            localStorage.setItem('DevRefreshToken', data.refresh_token);
            localStorage.setItem('DevTokenExpiration', expirationTime);
        } else {
            console.error('Error fetching the token:', data);
        }
    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

export function HandleUserToken() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('user_token');

        if (token) {
            fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            .then(  response => {try { response.json() } catch ( err ){console.log('Error fetching user data:', err); } })
            .then( () => { navigate("/") } )
        }

    }, [navigate]);

    return (
        <div>
            <h1>Spotify User Dashboard</h1>
            <p>Loading user data...</p>
        </div>
    );
};