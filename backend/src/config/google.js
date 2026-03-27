const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Function to generate the auth URL
const getAuthUrl = (state) => {
    const scopes = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: state
    });
};

// Function to get token from code
const getToken = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

// Function to get a fresh client instance (to avoid listener accumulation)
const getNewClient = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

// Function to set credentials
const setCredentials = (tokens, client = oauth2Client) => {
    client.setCredentials(tokens);
    return client;
};

module.exports = {
    getAuthUrl,
    getToken,
    setCredentials,
    getNewClient,
    oauth2Client
};
