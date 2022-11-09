var serverSettings = process.env.NODE_ENV !== 'production' ? 
    { 
        API_PROTOCOL: 'http', 
        API_HOST: 'localhost', 
        API_PORT: '8001',
        API_URL: '',
        DEFAULT_TABLE_PAGE_SIZE: 20,
        PLAYER_REQUEST_TIMEOUT: 300000,
        CORS_HOST: ''
    } :
    { 
        API_PROTOCOL: 'https', 
        API_HOST: process.env.APP_HOST,
        API_PORT: '443' ,
        API_URL: '',
        DEFAULT_TABLE_PAGE_SIZE: 20,
        PLAYER_REQUEST_TIMEOUT: 300000,
        CORS_HOST: ''
    };

serverSettings.CORS_HOST = '*';
serverSettings.API_URL = serverSettings.API_PROTOCOL + '://' + serverSettings.API_HOST + ':' + serverSettings.API_PORT;
serverSettings.CHROMIUM_REVISION = '1056772';
// settings.PLAYER_RESPONSE_TIMEOUT = 300;

module.exports = {
     settings: serverSettings
}