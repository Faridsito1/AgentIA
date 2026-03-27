const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const BaseScraper = require('./baseScraper');
const captchaService = require('../services/captchaService');
const unzipper = require('unzipper');

class AsopagosScraper extends BaseScraper {
    constructor(contratista, month, year) {
        super(contratista, month, year);
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async init() {
        this.browser = await chromium.launch({ headless: true }); 
        this.context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            acceptDownloads: true
        });
        this.page = await this.context.newPage();
    }

    async run() {
        try {
            console.log(`[ASOPAGOS SCRAPER] Iniciando para: ${this.contratista.nombre} - CC: ${this.contratista.cedula}`);
            await this.init();

            console.log(`[ASOPAGOS SCRAPER] Navegando a Asopagos...`);
            try {
                await this.page.goto('https://www.enlace-apb.com/interssi/descargarCertificacionPago.jsp', { waitUntil: 'commit', timeout: 30000 });
            } catch (navErr) {
                console.log("[ASOPAGOS SCRAPER] Timeout en navegación (swallowed):", navErr.message);
            }
            
            await this.page.waitForTimeout(5000);

            try {
                console.log(`[ASOPAGOS SCRAPER] Llenando formulario...`);
                // DocType
                const docType = this.contratista.datosPlataforma?.loginData?.docType?.toUpperCase() || 'CC';
                await this.page.selectOption('#tipoID', docType).catch(() => {});
                
                await this.page.fill('#numeroID', this.contratista.cedula).catch(() => {});
                
                if (this.year) {
                    await this.page.fill('#ano', this.year).catch(() => {});
                }
                
                if (this.month) {
                    const monthMap = {
                        'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
                        'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
                        'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
                    };
                    const mVal = monthMap[this.month.toLowerCase()] || '01';
                    await this.page.selectOption('#mes', mVal).catch(() => {});
                }
                
                await this.page.selectOption('#tipoReporte', 'sinValores').catch(() => {});

                console.log(`[ASOPAGOS SCRAPER] Resolviendo Captcha de Imagen con 2Captcha...`);
                
                // Wait for captcha to load
                await this.page.waitForSelector('#captcha_imgpop', { timeout: 10000 });
                await this.page.waitForTimeout(2000); // ensure it is loaded
                
                const captchaImgElement = await this.page.$('#captcha_imgpop');
                if (captchaImgElement) {
                    const srcBuffer = await captchaImgElement.screenshot();
                    const base64Image = srcBuffer.toString('base64');
                    
                    const captchaText = await captchaService.solveImageCaptcha(base64Image);
                    console.log(`[ASOPAGOS SCRAPER] Texto Captcha Resuelto: ${captchaText}`);
                    
                    await this.page.fill('#captchaIn', captchaText);
                }

                console.log(`[ASOPAGOS SCRAPER] Haciendo clic en el botón de consulta/descarga...`);
                
                // Intentar varios selectores por si el ID cambió
                const btnSelector = 'button:has-text("Consultar"), #enviarConsRP, .btn-primary, .btn-success';

                const [download] = await Promise.all([
                    this.page.waitForEvent('download', { timeout: 60000 }).catch(e => {
                        console.log("[ASOPAGOS SCRAPER] No se detectó evento de descarga:", e.message);
                        return null;
                    }),
                    this.page.click(btnSelector).catch(e => {
                        console.log("[ASOPAGOS SCRAPER] Fallo al hacer clic con selector estándar, intentando envío forzado...");
                        return this.page.dispatchEvent(btnSelector, 'click');
                    })
                ]);
                
                if (!download) {
                    // Si no hubo descarga, tal vez se abrió en el mismo viewer o dio error
                    console.log("[ASOPAGOS SCRAPER] No se obtuvo descarga. Tomando captura de pantalla de los posibles resultados...");
                    const resultPath = path.join(tmpDir, `Asopagos_Result_${this.contratista.cedula}_${Date.now()}.png`);
                    await this.page.screenshot({ path: resultPath, fullPage: true });
                    
                    // Si el usuario quiere PDF, lo convertimos igual que en Mi Planilla
                    const { PDFDocument } = require('pdf-lib');
                    const pdfDoc = await PDFDocument.create();
                    const imgBytes = fs.readFileSync(resultPath);
                    const img = await pdfDoc.embedPng(imgBytes);
                    const pdfPage = pdfDoc.addPage([img.width + 40, img.height + 40]);
                    pdfPage.drawImage(img, { x: 20, y: 20, width: img.width, height: img.height });
                    const pdfBytes = await pdfDoc.save();
                    const pdfPath = path.join(tmpDir, `Asopagos_${this.contratista.cedula}.pdf`);
                    fs.writeFileSync(pdfPath, pdfBytes);
                    
                    if (fs.existsSync(resultPath)) fs.unlinkSync(resultPath);
                    if (this.browser) await this.browser.close();
                    return pdfPath;
                }
                
                console.log(`[ASOPAGOS SCRAPER] Archivo descargándose...`);
                const tmpDir = path.join(__dirname, '../../tmp');
                if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
                
                const suggestedFilename = download.suggestedFilename();
                const isPdf = suggestedFilename.toLowerCase().endsWith('.pdf');
                
                const downloadedFileName = `Asopagos_${this.contratista.cedula}_${Date.now()}${isPdf ? '.pdf' : '.zip'}`;
                const downloadedPath = path.join(tmpDir, downloadedFileName);
                await download.saveAs(downloadedPath);
                console.log(`[ASOPAGOS SCRAPER] Archivo guardado en: ${downloadedPath}`);
                
                let extractedPdfPath = downloadedPath;

                if (!isPdf) {
                    console.log(`[ASOPAGOS SCRAPER] Descomprimiendo ZIP...`);
                    extractedPdfPath = await this.extractPdfFromZip(downloadedPath, tmpDir);
                    // Delete ZIP to leave only PDF
                    try { fs.unlinkSync(downloadedPath); } catch(err) {}
                }

                if (this.browser) await this.browser.close();
                return extractedPdfPath;

            } catch (e) {
                console.log("[ASOPAGOS SCRAPER] Error en navegación/descarga:", e.message);
                
                // Screenshot just in case
                try {
                    await this.page.screenshot({ path: path.join(__dirname, '../../tmp/asopagos_error.png'), fullPage: true });
                } catch(ign) {}
                
                if (this.browser) await this.browser.close();
                throw e;
            }
        } catch (error) {
            console.error(`[ASOPAGOS SCRAPER] Error fatal:`, error);
            if (this.browser) await this.browser.close();
            throw error;
        }
    }

    async extractPdfFromZip(zipPath, destDir) {
        return new Promise((resolve, reject) => {
            let extractedPdfPath = null;
            fs.createReadStream(zipPath)
                .pipe(unzipper.Parse())
                .on('entry', function (entry) {
                    const fileName = entry.path;
                    if (fileName.endsWith('.pdf')) {
                        const newPdfName = `Asopagos_${Date.now()}_${fileName}`;
                        extractedPdfPath = path.join(destDir, newPdfName);
                        entry.pipe(fs.createWriteStream(extractedPdfPath));
                    } else {
                        entry.autodrain();
                    }
                })
                .on('close', () => {
                    if (extractedPdfPath) resolve(extractedPdfPath);
                    else reject(new Error('No se encontró PDF dentro del ZIP.'));
                })
                .on('error', reject);
        });
    }
}

module.exports = AsopagosScraper;
