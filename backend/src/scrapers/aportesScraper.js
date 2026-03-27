const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const path = require('path');
const fs = require('fs');
const BaseScraper = require('./baseScraper');
const captchaService = require('../services/captchaService');
const { extractPdfFromZip } = require('../utils/fileProcessor');

class AportesScraper extends BaseScraper {
    constructor(contratista, month, year) {
        super(contratista, month, year);
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async init() {
        this.browser = await chromium.launch({ headless: true }); 
        this.context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        this.page = await this.context.newPage();
    }

    async run() {
        try {
            console.log(`[APORTES EN LINEA SCRAPER] Iniciando para: ${this.contratista.nombre}`);
            await this.init();

            console.log(`[APORTES EN LINEA SCRAPER] Navegando a Aportes en Línea...`);
            await this.page.goto('https://empresas.aportesenlinea.com/Autoservicio/CertificadoAportes.aspx', { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            await this.page.waitForTimeout(3000);

            // 1. Detectar SiteKey y Resolver Captcha PRIMERO
            let captchaHealthy = false;
            let reloadAttempts = 0;
            const maxReloads = 5;
            let siteKey = null;

            while (!captchaHealthy && reloadAttempts < maxReloads) {
                console.log(`[APORTES EN LINEA SCRAPER] Verificando salud del captcha... (Intento ${reloadAttempts + 1})`);
                await this.page.waitForTimeout(3000);
                
                const errorVisible = await this.page.evaluate(() => {
                    const text = document.body.innerText.toLowerCase();
                    return text.includes('cuota gratuita') || text.includes('supera la cuota') || text.includes('quota exceeded');
                });

                if (errorVisible) {
                    console.log(`[APORTES EN LINEA SCRAPER] Captcha con error de cuota detectado. Recargando página...`);
                    await this.page.reload({ waitUntil: 'domcontentloaded' });
                    reloadAttempts++;
                    continue;
                }

                siteKey = await this.page.evaluate(() => {
                    const el = document.querySelector('.g-recaptcha');
                    if (el) return el.getAttribute('data-sitekey');
                    const ifr = document.querySelector('iframe[src*="recaptcha"]');
                    if (ifr) {
                        const m = ifr.src.match(/k=([^&]+)/);
                        return m ? m[1] : null;
                    }
                    return null;
                });

                if (siteKey) {
                    captchaHealthy = true;
                } else {
                    console.log(`[APORTES EN LINEA SCRAPER] SiteKey no encontrada aún, esperando...`);
                    await this.page.waitForTimeout(2000);
                    reloadAttempts++; 
                }
            }

            if (siteKey && captchaHealthy) {
                console.log(`[APORTES EN LINEA SCRAPER] SiteKey detectada (${siteKey}). Procediendo...`);
                
                try {
                    console.log(`[APORTES EN LINEA SCRAPER] Intentando marcar checkbox 'No soy un robot'...`);
                    const iframeElement = await this.page.waitForSelector('iframe[title*="reCAPTCHA"], iframe[src*="api2/anchor"]', { timeout: 15000 });
                    const frame = await iframeElement.contentFrame();
                    if (frame) {
                        await frame.click('#recaptcha-anchor', { timeout: 10000 });
                        console.log(`[APORTES EN LINEA SCRAPER] Checkbox clickeado correctamente.`);
                        await this.page.waitForTimeout(3000); 
                    }
                } catch (e) {
                    console.log(`[APORTES EN LINEA SCRAPER] Nota: No se pudo clickear visualmente el checkbox: ${e.message}`);
                }

                try {
                    console.log(`[APORTES EN LINEA SCRAPER] Solicitando resolución a 2Captcha...`);
                    let token = null;
                    try {
                        token = await captchaService.solveRecaptchaV2Enterprise(siteKey, this.page.url());
                    } catch (err) {
                        console.log(`[APORTES EN LINEA SCRAPER] Enterprise falló, probando V2 normal...`);
                        token = await captchaService.solveRecaptchaV2(siteKey, this.page.url());
                    }

                    if (token) {
                        console.log(`[APORTES EN LINEA SCRAPER] Token de captcha obtenido. Inyectando...`);
                        await this.page.evaluate((t) => {
                            const resInput = document.getElementById('g-recaptcha-response');
                            if (resInput) {
                                resInput.innerHTML = t;
                                resInput.value = t;
                            }
                        }, token);
                    }
                } catch (e) {
                    console.log(`[APORTES EN LINEA SCRAPER] Error resolviendo captcha: ${e.message}`);
                }
            }

            // 2. Llenado de formulario
            try {
                console.log(`[APORTES EN LINEA SCRAPER] Llenando formulario de datos...`);
                const loginData = this.contratista.datosPlataforma?.loginData || {};
                
                const docTypeMap = { 'cc': '1', 'ce': '2', 'nit': '3', 'pp': '4' };
                const docCode = docTypeMap[loginData.docType?.toLowerCase()] || '1';
                await this.page.selectOption('#contenido_ddlTipoIdent', docCode);
                
                await this.page.fill('#contenido_tbNumeroIdentificacion', this.contratista.cedula);
                
                if (loginData.fechaExpedicion) {
                    const fExp = loginData.fechaExpedicion.replace(/-/g, '/');
                    console.log(`[APORTES EN LINEA SCRAPER] Llenando Fecha Expedición: ${fExp}`);
                    await this.page.fill('#contenido_txtFechaExp', fExp);
                }

                if (this.contratista.eps && this.contratista.eps !== 'N/A') {
                    console.log(`[APORTES EN LINEA SCRAPER] Seleccionando EPS: ${this.contratista.eps}`);
                    await this.page.click('#contenido_txtAdmin');
                    await this.page.fill('#contenido_txtAdmin', '');
                    
                    const epsSearch = this.contratista.eps.toLowerCase();
                    for (const char of epsSearch.substring(0, 6)) {
                        await this.page.keyboard.type(char, { delay: 100 });
                    }
                    await this.page.waitForTimeout(3000);
                    
                    const itemSelector = '.ui-autocomplete .ui-menu-item, .ui-menu-item, .ui-autocomplete li';
                    try {
                        await this.page.waitForSelector(itemSelector, { timeout: 15000, state: 'visible' });
                        const items = await this.page.$$(itemSelector);
                        let clicked = false;
                        for (const item of items) {
                            const text = (await item.innerText()).toLowerCase();
                            if (text.includes(epsSearch)) {
                                await item.click();
                                clicked = true;
                                break;
                            }
                        }
                        if (!clicked && items.length > 0) await items[0].click();
                    } catch (e) {
                        await this.page.keyboard.press('ArrowDown');
                        await this.page.keyboard.press('Enter');
                    }
                }

                const mesesMap = { 'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'};
                const mesIni = mesesMap[(loginData.desdeMes || this.month || 'enero').toLowerCase()] || '01';
                const anioIni = loginData.desdeAnio || this.year || '2026';
                const mesFin = mesesMap[(loginData.hastaMes || this.month || 'febrero').toLowerCase()] || '02';
                const anioFin = loginData.hastaAnio || this.year || '2026';

                await this.page.selectOption('#contenido_ddlMesIni', mesIni);
                await this.page.selectOption('#contenido_ddlAnioIni', anioIni);
                await this.page.selectOption('#contenido_ddlMesFin', mesFin);
                await this.page.selectOption('#contenido_ddlAnioFin', anioFin);

            } catch (errFill) {
                console.log("[APORTES EN LINEA SCRAPER] Error llenando formulario:", errFill.message);
            }

            await this.page.waitForTimeout(2000);
            
            // --- ACCIÓN FINAL ---
            console.log(`[APORTES EN LINEA SCRAPER] Generando certificado...`);
            const context = this.page.context();
            const tmpDir = path.join(__dirname, '../../tmp');
            
            const [winner] = await Promise.all([
                Promise.race([
                    context.waitForEvent('page', { timeout: 60000 }).then(p => ({ type: 'popup', val: p })).catch(() => ({ type: 'timeout' })),
                    context.waitForEvent('download', { timeout: 60000 }).then(d => ({ type: 'download', val: d })).catch(() => ({ type: 'timeout' })),
                    new Promise(r => setTimeout(() => r({ type: 'timeout' }), 65000))
                ]),
                this.page.click('#contenido_btnCalcular', { force: true }).catch(() => {
                    return this.page.dispatchEvent('#contenido_btnCalcular', 'click');
                })
            ]);

            let finalPath = null;
            if (winner.type === 'download' && winner.val) {
                finalPath = path.join(tmpDir, winner.val.suggestedFilename());
                await winner.val.saveAs(finalPath);
            } else if (winner.type === 'popup' && winner.val) {
                const popup = winner.val;
                console.log(`[APORTES EN LINEA SCRAPER] Popup detectado. Esperando descarga...`);
                try {
                    await popup.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => {});
                    const dl = await popup.waitForEvent('download', { timeout: 30000 }).catch(async () => {
                         // Fallback click
                         await popup.click('#btnDescargar').catch(() => {});
                         return popup.waitForEvent('download', { timeout: 10000 }).catch(() => null);
                    });
                    if (dl) {
                        finalPath = path.join(tmpDir, dl.suggestedFilename());
                        await dl.saveAs(finalPath);
                    }
                } catch (e) {
                    console.log(`[APORTES EN LINEA SCRAPER] Error en popup: ${e.message}`);
                }
                await popup.close().catch(() => {});
            }

            if (finalPath && finalPath.toLowerCase().endsWith('.zip')) {
                console.log(`[APORTES EN LINEA SCRAPER] Extrayendo ZIP...`);
                const pdfPath = extractPdfFromZip(finalPath, tmpDir);
                if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
                finalPath = pdfPath;
            }

            if (this.browser) await this.browser.close();
            console.log(finalPath ? `[APORTES EN LINEA SCRAPER] ¡ÉXITO! Certificado: ${finalPath}` : `[APORTES EN LINEA SCRAPER] Falló la descarga.`);
            return finalPath;

        } catch (error) {
            console.error(`[APORTES EN LINEA SCRAPER] ERROR FATAL:`, error);
            if (this.browser) await this.browser.close();
            throw error;
        }
    }
}

module.exports = AportesScraper;
