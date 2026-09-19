<?php
// Define que a resposta será em formato JSON
header('Content-Type: application/json');

// Suas chaves de API do Spotify - MANTENHA-AS AQUI! ELAS FICAM OCULTAS NO SERVIDOR.
$client_id = '84c8d774e72344b7953095d43306f77b';
$client_secret = '4fbfb579fa5849d49bf68bfafc46ceb2';
$playlist_id = '5rFYcSe7fKCXCh3drht24Y';

// Verifica se a requisição é um método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// 1. Obtém o token de acesso do Spotify (sem expor as chaves)
$auth_string = base64_encode($client_id . ':' . $client_secret);
$token_url = 'https://accounts.spotify.com/api/token';
$token_options = [
    'http' => [
        'method' => 'POST',
        'header' => "Authorization: Basic " . $auth_string . "\r\n" .
                    "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => 'grant_type=client_credentials',
    ],
];

$token_context = stream_context_create($token_options);
$token_response = @file_get_contents($token_url, false, $token_context);

if ($token_response === FALSE) {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao obter token do Spotify']);
    exit;
}
$token_data = json_decode($token_response, true);

if (!isset($token_data['access_token'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Token de acesso não encontrado na resposta do Spotify']);
    exit;
}
$access_token = $token_data['access_token'];

// 2. Usa o token para buscar os dados da playlist
$playlist_url = "https://api.spotify.com/v1/playlists/" . $playlist_id . "/tracks";
$playlist_options = [
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: Bearer " . $access_token . "\r\n",
    ],
];
$playlist_context = stream_context_create($playlist_options);
$playlist_response = @file_get_contents($playlist_url, false, $playlist_context);

if ($playlist_response === FALSE) {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao buscar playlist do Spotify']);
    exit;
}

// 3. Envia os dados da playlist para o front-end
echo $playlist_response;
?>
