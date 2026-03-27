const { google } = require('googleapis');
const fs = require('fs');

async function getOrCreateMonthFolder(drive, monthName, parentFolderId) {
    // Buscar la carpeta del mes
    const q = `name='${monthName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const res = await drive.files.list({
        q,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (res.data.files.length > 0) {
        console.log(`Carpeta de mes encontrada en Drive del Supervisor: ${monthName}`);
        return res.data.files[0].id;
    }

    // Si no existe, crearla
    console.log(`Creando nueva carpeta para el mes: ${monthName} en Drive del Supervisor`);
    const fileMetadata = {
        name: monthName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId]
    };

    const folder = await drive.files.create({
        resource: fileMetadata,
        fields: 'id'
    });

    return folder.data.id;
}

async function uploadToDrive(auth, filePath, nombreUsuario, plataforma, fechaPago, mesNombre, supervisorFolderId) {
    const drive = google.drive({ version: 'v3', auth });

    // Si no definio carpeta, usamos 'root'
    const parentId = supervisorFolderId || 'root';

    try {
        console.log(`[Google Drive] Iniciando subida para: ${nombreUsuario} (${plataforma})`);
        console.log(`[Google Drive] Carpeta padre supervisor ID: ${parentId}`);
        
        const folderId = await getOrCreateMonthFolder(drive, mesNombre, parentId);
        console.log(`[Google Drive] Carpeta de mes ID: ${folderId}`);
        
        const fileName = `${nombreUsuario} - ${plataforma} - ${fechaPago}.pdf`;

        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };

        const media = {
            mimeType: 'application/pdf',
            body: fs.createReadStream(filePath)
        };

        console.log(`[Google Drive] Subiendo archivo: ${fileName}...`);
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        console.log(`[Google Drive OAuth] Archivo subido exitosamente: ${fileName} - ID: ${file.data.id}`);

        return file.data.webViewLink;
    } catch (error) {
        console.error('[Google Drive OAuth] Error subiendo pdf:', error.message);
        if (error.response) {
            console.error('[Google Drive OAuth] Detalle del error:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

module.exports = { uploadToDrive };
