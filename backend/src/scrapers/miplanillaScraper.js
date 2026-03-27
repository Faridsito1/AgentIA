const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const path = require('path');
const fs = require('fs');
const BaseScraper = require('./baseScraper');
const captchaService = require('../services/captchaService');

class MiPlanillaScraper extends BaseScraper {
    constructor(contratista, month, year) {
        super(contratista, month, year);
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async init() {
        this.browser = await chromium.launch({ headless: true }); 
        this.context = await this.browser.newContext({
            viewport: { width: 1280, height: 800 }
        });
        this.page = await this.context.newPage();
    }

    async run() {
        let lastError = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`[MI PLANILLA SCRAPER] Intento ${attempt} para: ${this.contratista.nombre}`);
                await this.init();

                console.log(`[MI PLANILLA SCRAPER] Navegando a: https://www.miplanilla.com/Private/Consultaplanillaindependiente.aspx`);
                await this.page.goto('https://www.miplanilla.com/Private/Consultaplanillaindependiente.aspx', { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 60000 
                });

                await this.page.waitForSelector('#cp1_ddlTipoDocumento', { visible: true, timeout: 30000 });
                console.log(`[MI PLANILLA SCRAPER] Página cargada.`);
                await this.page.waitForTimeout(3000); 

                const loginData = this.contratista.datosPlataforma?.loginData || {};
                const miData = loginData.miPlanilla || {};

                console.log(`[MI PLANILLA SCRAPER] Llenando campos principales...`);
                
                // 1. Tipo Documento
                const docTypeMap = { 'cc': 'Cédula Ciudadanía', 'ce': 'Cédula de extranjería', 'nit': 'NIT', 'pp': 'Pasaporte' };
                const docTypeText = docTypeMap[loginData.docType?.toLowerCase()] || 'Cédula Ciudadanía';
                await this.page.selectOption('#cp1_ddlTipoDocumento', { label: docTypeText });
                
                // 2. Número de Documento
                await this.page.fill('#cp1_txtNumeroDocumento', this.contratista.cedula);
                
                // 3. Número de Planilla
                const nPlanilla = miData.numeroPlanilla || loginData.numeroPlanilla || '';
                if (nPlanilla) await this.page.fill('#cp1_txtNumeroPlanilla', nPlanilla);

                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                
                // 4. Fecha de Pago (Día/Mes/Año)
                const diaP = loginData.diaPago || miData.fechaPago?.dia;
                const mesP = loginData.mesPago || miData.fechaPago?.mes;
                const anioP = loginData.anioPago || miData.fechaPago?.anio;

                if (diaP || mesP || anioP) {
                    console.log(`[MI PLANILLA SCRAPER] Llenando Fecha de Pago: ${diaP}/${mesP}/${anioP}`);
                    if (diaP) await this.page.selectOption('#cp1_cmbDiaPago', String(parseInt(diaP)));
                    if (mesP) {
                        // mesP might be name or number
                        let label = isNaN(parseInt(mesP)) ? mesP : meses[parseInt(mesP) - 1];
                        await this.page.selectOption('#cp1_cmbMesPago', { label });
                    }
                    if (anioP) await this.page.selectOption('#cp1_ddlAnoPago', String(anioP));
                }

                // 5. Periodo Salud (Mes/Año)
                let mesSaludLabel = "";
                if (miData.periodoSalud?.mes) {
                    mesSaludLabel = meses[parseInt(miData.periodoSalud.mes) - 1];
                } else if (this.month) {
                    if (isNaN(parseInt(this.month))) {
                        mesSaludLabel = this.month.charAt(0).toUpperCase() + this.month.slice(1).toLowerCase();
                    } else {
                        mesSaludLabel = meses[parseInt(this.month) - 1];
                    }
                }
                const anioSalud = loginData.anioPago || miData.periodoSalud?.anio || this.year;

                if (mesSaludLabel) {
                    console.log(`[MI PLANILLA SCRAPER] Periodo Salud - Mes: ${mesSaludLabel}`);
                    await this.page.selectOption('#cp1_ddlMesSalud', { label: mesSaludLabel });
                }
                if (anioSalud) {
                    console.log(`[MI PLANILLA SCRAPER] Periodo Salud - Año: ${anioSalud}`);
                    await this.page.selectOption('#cp1_ddlAnoSalud', String(anioSalud));
                }

                // 6. Valor Total
                // User requested strictly 590900 without . or $
                const valorLimpio = "590900";
                console.log(`[MI PLANILLA SCRAPER] Valor Total hardcodeado: ${valorLimpio}`);
                await this.page.fill('#cp1_txtValorPagado', '');
                await this.page.type('#cp1_txtValorPagado', valorLimpio, { delay: 100 });

                console.log(`[MI PLANILLA SCRAPER] Resolviendo captcha de imagen...`);
                const captchaImg = await this.page.waitForSelector('#cp1_imgCaptcha, img[src*="captchaImage"]', { visible: true, timeout: 15000 });
                const buffer = await captchaImg.screenshot();
                const captchaText = await captchaService.solveImageCaptcha(buffer.toString('base64'));
                console.log(`[MI PLANILLA SCRAPER] Captcha recibido: ${captchaText}`);
                await this.page.fill('#cp1_txtCaptcha', captchaText);

                await this.page.waitForTimeout(1000);
                await this.page.click('#cp1_ButtonConsultar');

                console.log(`[MI PLANILLA SCRAPER] Esperando resultados o mensaje de error...`);
                await this.page.waitForFunction(() => {
                    const result = document.querySelector('#cp1_pnlResultado');
                    const error = document.querySelector('#cp1_lblError');
                    const text = document.body.innerText.includes('Administradoras pagadas');
                    return (result && result.clientHeight > 0) || (error && error.clientHeight > 0) || text;
                }, { timeout: 60000 });
                
                // Verificamos si hay un error visible antes de proceder
                const errorElement = await this.page.$('#cp1_lblError');
                const isErrorVisible = errorElement ? await errorElement.isVisible() : false;

                if (isErrorVisible) {
                    const errMsg = await errorElement.textContent();
                    if (errMsg && errMsg.trim().length > 0) {
                        console.error(`[MI PLANILLA SCRAPER] Error detectado: ${errMsg.trim()}`);
                        throw new Error(`Error en Mi Planilla: ${errMsg.trim()}`);
                    }
                }

                console.log(`[MI PLANILLA SCRAPER] ¡Resultados detectados con éxito o texto de confirmación presente!`);
                
                // Aseguramos que se vea la planilla
                await this.page.evaluate(() => {
                    const el = document.querySelector('#cp1_pnlResultado') || document.body;
                    if (el) el.scrollIntoView();
                });
                await this.page.waitForTimeout(3000);
                
                console.log(`[MI PLANILLA SCRAPER] Generando captura de página completa...`);
                const tmpDir = path.join(__dirname, '../../tmp');
                if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
                const screenshotPath = path.join(tmpDir, `MiPlanilla_Result_${this.contratista.cedula}_${Date.now()}.png`);
                
                // Capturamos la página completa (no solo la tabla) como solicitaste
                await this.page.screenshot({ path: screenshotPath, fullPage: true });

                const { PDFDocument } = require('pdf-lib');
                const pdfDoc = await PDFDocument.create();
                const imgBytes = fs.readFileSync(screenshotPath);
                const img = await pdfDoc.embedPng(imgBytes);
                
                // Ajustamos la página del PDF al tamaño de la captura
                const pdfPage = pdfDoc.addPage([img.width + 40, img.height + 40]);
                pdfPage.drawImage(img, { x: 20, y: 20, width: img.width, height: img.height });
                
                const pdfBytes = await pdfDoc.save();
                const pdfPath = path.join(tmpDir, `MiPlanilla_${this.contratista.cedula}.pdf`);
                fs.writeFileSync(pdfPath, pdfBytes);

                if (fs.existsSync(screenshotPath)) fs.unlinkSync(screenshotPath);
                if (this.browser) await this.browser.close();
                console.log(`[MI PLANILLA SCRAPER] Proceso completado exitosamente.`);
                return pdfPath;

            } catch (error) {
                console.error(`[MI PLANILLA SCRAPER] Error en intento ${attempt}: ${error.message}`);
                lastError = error;
                if (this.browser) await this.browser.close();
            }
        }
        throw lastError || new Error("Falla total en Mi Planilla.");
    }
}

module.exports = MiPlanillaScraper;
