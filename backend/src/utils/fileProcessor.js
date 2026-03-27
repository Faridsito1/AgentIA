const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

/**
 * Extracts the first PDF file found in a ZIP archive.
 * @param {string} zipPath - Full path to the .zip file
 * @param {string} outputDir - Directory where to save the extracted PDF
 * @returns {string} - Full path to the extracted PDF file
 */
function extractPdfFromZip(zipPath, outputDir) {
    try {
        console.log(`[ZIP Utility] Intentando extraer PDF de: ${zipPath}`);
        
        if (!fs.existsSync(zipPath)) {
            throw new Error(`El archivo ZIP no existe: ${zipPath}`);
        }

        const zip = new AdmZip(zipPath);
        const zipEntries = zip.getEntries();
        
        // Find the first entry that ends with .pdf (case insensitive)
        const pdfEntry = zipEntries.find(entry => entry.entryName.toLowerCase().endsWith('.pdf'));

        if (!pdfEntry) {
            console.error(`[ZIP Utility] No se encontró ningún PDF dentro del ZIP: ${path.basename(zipPath)}`);
            // List files for debugging
            zipEntries.forEach(entry => console.log(` - Contenido: ${entry.entryName}`));
            throw new Error('No se encontró un archivo PDF dentro del paquete descargado.');
        }

        console.log(`[ZIP Utility] PDF encontrado: ${pdfEntry.entryName}. Extrayendo...`);
        
        // We'll give it a clean name or use the original one
        const extractedFileName = `extracted_${Date.now()}_${pdfEntry.name}`;
        const finalPath = path.join(outputDir, extractedFileName);
        
        // Extract to the output directory
        zip.extractEntryTo(pdfEntry.entryName, outputDir, false, true, false, extractedFileName);

        console.log(`[ZIP Utility] Extracción completada: ${finalPath}`);
        return finalPath;
    } catch (error) {
        console.error(`[ZIP Utility] Error procesando ZIP:`, error.message);
        throw error;
    }
}

module.exports = { extractPdfFromZip };
