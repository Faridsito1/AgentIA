const cron = require('cron');
const CronJob = cron.CronJob;
const Contratista = require('../models/Contratista');
const SOIScraper = require('../scrapers/soiScraper');
const { uploadToDrive } = require('./driveUploader');
const { setCredentials, getNewClient } = require('../config/google');
const Supervisor = require('../models/Supervisor');
const { extractPdfFromZip } = require('./fileProcessor');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
moment.locale('es');

const job = new CronJob('0 0 1 * *', async () => {
    // At midnight on the 1st of each month
    const m = moment().subtract(1, 'month').format('MMMM'); 
    const month = m.charAt(0).toUpperCase() + m.slice(1);
    const year = moment().format('YYYY');
    await processAllCertificates(month, year);
});

async function processAllCertificates(month, year) {
    console.log(`Starting monthly certificate processing for ${month} ${year}...`);
    try {
        const contratistas = await Contratista.find({}).populate('supervisorId');
        for (const c of contratistas) {
            await processSingleCertificate(c, month, year);
        }
    } catch (error) {
        console.error('Fatal Cron/Scraper loop error:', error);
    }
}

async function processSingleCertificate(c, month, year) {
    console.log(`Starting certificate processing for ${c.nombre} (${month} ${year})...`);
    try {
        let ScraperClass;
        console.log(`[CRON] Identificando plataforma: ${c.plataformaSeguro} para ${c.nombre}`);
        switch (c.plataformaSeguro) {
            case 'SOI': ScraperClass = require('../scrapers/soiScraper'); break;
            case 'ASOPAGOS': ScraperClass = require('../scrapers/asopagosScraper'); break;
            case 'COMPENSAR': ScraperClass = require('../scrapers/compensarScraper'); break;
            case 'APORTES_EN_LINEA': ScraperClass = require('../scrapers/aportesScraper'); break;
            case 'MI_PLANILLA': ScraperClass = require('../scrapers/miplanillaScraper'); break;
            default: 
                console.log(`[CRON] Plataforma desconocida: ${c.plataformaSeguro}`);
                return;
        }

        const scraper = new ScraperClass(c, month, year);
        const filepath = await scraper.run();

        let supervisor = c.supervisorId;
        
        // If supervisor is just an ID, fetch the full object
        if (supervisor && !supervisor.googleDriveToken) {
            supervisor = await Supervisor.findById(supervisor._id || supervisor);
        }

        if (!supervisor || !supervisor.googleDriveToken) {
            console.log(`Supervisor for ${c.nombre} doesn't have Google Drive linked or not found. Cannot upload.`);
            throw new Error('Supervisor no ha vinculado su cuenta de Google Drive');
        }

        const auth = getNewClient();
        setCredentials(supervisor.googleDriveToken, auth);

        // Listen for token refreshes and save them
        auth.on('tokens', async (tokens) => {
            console.log(`[Google OAuth] Refrescando tokens para el supervisor: ${supervisor.nombre}`);
            // Update supervisor's token in DB
            const currentSupervisor = await Supervisor.findById(supervisor._id);
            const updatedTokens = { ...currentSupervisor.googleDriveToken, ...tokens };
            await Supervisor.findByIdAndUpdate(supervisor._id, { googleDriveToken: updatedTokens });
        });

        const fechaActual = moment().format('YYYY-MM-DD');
        const mesAnioFolder = `${month} ${year}`;

        if (!filepath) {
            throw new Error(`El scraper no pudo descargar el archivo para ${c.nombre} en ${c.plataformaSeguro}`);
        }

        // CHECK IF ZIP AND EXTRACT
        let fileToUpload = filepath;
        const isZip = filepath.toLowerCase().endsWith('.zip');
        let extractedPath = null;

        if (isZip) {
            const tmpDir = path.join(__dirname, '../../tmp');
            extractedPath = extractPdfFromZip(filepath, tmpDir);
            fileToUpload = extractedPath;
        }

        const driveUrl = await uploadToDrive(
            auth,
            fileToUpload,
            c.nombre,
            c.plataformaSeguro,
            fechaActual,
            mesAnioFolder,
            supervisor.googleDriveFolderId
        );

        // CLEAN UP
        try {
            if (isZip && fs.existsSync(filepath)) fs.unlinkSync(filepath);
            if (extractedPath && fs.existsSync(extractedPath)) fs.unlinkSync(extractedPath);
        } catch (err) {
            console.warn('Error cleaning up temp files:', err.message);
        }

        // Update existing report or create new one
        let reportIndex = c.reportes.findIndex(r => r.año === year && r.mes === month);
        if (reportIndex >= 0) {
            c.reportes[reportIndex].urlArchivoDrive = driveUrl;
            c.reportes[reportIndex].estado = 'DESCARGADO';
            c.reportes[reportIndex].errorReason = null;
        } else {
            c.reportes.push({
                plataforma: c.plataformaSeguro,
                mes: month,
                año: year,
                urlArchivoDrive: driveUrl,
                estado: 'DESCARGADO'
            });
        }
        await c.save();

    } catch (error) {
        console.error(`Error processing ${c.nombre}:`, error);

        let reportIndex = c.reportes.findIndex(r => r.año === year && r.mes === month);
        if (reportIndex >= 0) {
            c.reportes[reportIndex].estado = 'ERROR';
            c.reportes[reportIndex].errorReason = error.message;
        } else {
            c.reportes.push({
                plataforma: c.plataformaSeguro,
                mes: month,
                año: year,
                estado: 'ERROR',
                errorReason: error.message
            });
        }
        await c.save();
    }
}

module.exports = { job, processAllCertificates, processSingleCertificate };
