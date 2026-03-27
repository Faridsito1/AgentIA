const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Supervisor = require('../models/Supervisor');
const { oauth2Client } = require('../config/google');

// ID de la carpeta principal (Fallback si no hay en DB)
let PARENT_FOLDER_ID = '1yGRNVmRaeaTvG9TwVrSOUYyzRbx6SLcd';

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function ensureAuth() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
        
        const superv = await Supervisor.findOne({ googleDriveToken: { $exists: true } });
        if (!superv || !superv.googleDriveToken) {
            throw new Error("No supervisor found with Google tokens linked.");
        }

        console.log(`[Google Drive] Usando tokens de supervisor: ${superv.nombre}`);
        
        // Cargar Carpeta del Supervisor
        if (superv.googleDriveFolderId) {
            PARENT_FOLDER_ID = superv.googleDriveFolderId;
            console.log(`[Google Drive] Carpeta principal detectada: ${PARENT_FOLDER_ID}`);
        }

        oauth2Client.setCredentials(superv.googleDriveToken);

        // Refrescar si es necesario
        if (!superv.googleDriveToken.expiry_date || new Date().getTime() > (superv.googleDriveToken.expiry_date - 300000)) {
            console.log(`[Google Drive] Token cerca de expirar o sin fecha, refrescando...`);
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);
            await Supervisor.findByIdAndUpdate(superv._id, { googleDriveToken: credentials });
        }
    } catch (err) {
        console.error(`[Google Drive] Error en autenticación OAuth2:`, err.message);
        throw err;
    }
}

async function getOrCreateMonthFolder(monthName) {
    const q = `name='${monthName}' and '${PARENT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const res = await drive.files.list({
        q,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
    });

    if (res.data.files.length > 0) {
        return res.data.files[0].id;
    }

    console.log(`Creando carpeta para el mes: ${monthName}`);
    const folder = await drive.files.create({
        resource: {
            name: monthName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [PARENT_FOLDER_ID]
        },
        fields: 'id',
        supportsAllDrives: true
    });
    return folder.data.id;
}

async function subirPdf(filePath, nombreUsuario, plataforma, fechaPago, mesNombre) {
    try {
        await ensureAuth();
        
        const folderId = await getOrCreateMonthFolder(mesNombre);
        const fileName = `${nombreUsuario} - ${plataforma} - ${fechaPago}.pdf`;
        
        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };

        const media = {
            mimeType: 'application/pdf',
            body: fs.createReadStream(filePath)
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
            supportsAllDrives: true
        });

        console.log(`[Google Drive] Archivo subido: ${file.data.id}`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return file.data.webViewLink;
    } catch (error) {
        console.error('[Google Drive] Error:', error.message);
        throw error;
    }
}

module.exports = { subirPdf };
