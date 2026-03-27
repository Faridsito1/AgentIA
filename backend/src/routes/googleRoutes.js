const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Supervisor = require('../models/Supervisor');
const { getAuthUrl, getToken } = require('../config/google');

// @route   GET /api/google/auth
// @desc    Get Google Auth URL for Supervisor
// @access  Private (Supervisor only)
router.get('/auth', auth, async (req, res) => {
    try {
        const url = getAuthUrl(req.user.id);
        res.json({ url });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/google/callback
// @desc    Handle OAuth2 callback and save token
// @access  Public (Called by Google)
router.get('/callback', async (req, res) => {
    const { code, state } = req.query; // State should be supervisorId if we pass it
    // For simplicity, we can pass supervisorId in the 'state' param of getAuthUrl
    try {
        const tokens = await getToken(code);
        const { google } = require('googleapis');
        const { oauth2Client } = require('../config/google');
        oauth2Client.setCredentials(tokens);
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // If we have the supervisorId from 'state', we save it
        if (state) {
            // Create or find a base folder for the system
            let folderId;
            const folderName = 'Certificados Seguridad Social';
            const q = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
            const folderRes = await drive.files.list({ q, fields: 'files(id, name)' });

            if (folderRes.data.files.length > 0) {
                folderId = folderRes.data.files[0].id;
            } else {
                const folderMetadata = {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder'
                };
                const folder = await drive.files.create({
                    resource: folderMetadata,
                    fields: 'id'
                });
                folderId = folder.data.id;
            }

            await Supervisor.findByIdAndUpdate(state, { 
                googleDriveToken: tokens,
                googleDriveFolderId: folderId
            });
            res.send('<h1>Google Drive vinculado correctamente! Ya puedes cerrar esta ventana.</h1>');
        } else {
            res.status(400).send('Falta el estado / ID del supervisor');
        }
    } catch (err) {
        console.error('Error in Google Callback:', err.message);
        res.status(500).send('La autenticación falló: ' + err.message);
    }
});

module.exports = router;
