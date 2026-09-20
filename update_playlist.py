import os
import json
import base64
import urllib.request
import urllib.parse

CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
PLAYLIST_ID = '5rFYcSe7fKCXCh3drht24Y'

if not CLIENT_ID or not CLIENT_SECRET:
    print("Erro: Credenciais do Spotify não encontradas.")
    exit(1)

auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
b64_auth = base64.b64encode(auth_str.encode('ascii')).decode('ascii')

token_url = "https://accounts.spotify.com/api/token"
data = urllib.parse.urlencode({'grant_type': 'client_credentials'}).encode('utf-8')

req = urllib.request.Request(token_url, data=data, method='POST')
req.add_header('Authorization', f'Basic {b64_auth}')
req.add_header('Content-Type', 'application/x-www-form-urlencoded')

try:
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        access_token = res_data['access_token']
except Exception as e:
    print(f"Erro ao obter token: {e}")
    exit(1)

playlist_url = f"https://api.spotify.com/v1/playlists/{PLAYLIST_ID}/tracks"
req_playlist = urllib.request.Request(playlist_url, method='GET')
req_playlist.add_header('Authorization', f'Bearer {access_token}')

try:
    with urllib.request.urlopen(req_playlist) as response:
        playlist_data = response.read().decode('utf-8')
        
        with open('playlist.json', 'w', encoding='utf-8') as f:
            f.write(playlist_data)
        print("Playlist atualizada com sucesso em playlist.json!")
except Exception as e:
    print(f"Erro ao buscar playlist: {e}")
    exit(1)
