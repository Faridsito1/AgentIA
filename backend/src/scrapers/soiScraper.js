const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const path = require('path');
const fs = require('fs');
const BaseScraper = require('./baseScraper');

class SOIScraper extends BaseScraper {
    constructor(contratista, month, year) {
        super(contratista, month, year);
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async init() {
        // Ejecutar en modo visible para que el usuario pueda ver el proceso
        this.browser = await chromium.launch({ headless: true }); 
        this.context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        this.page = await this.context.newPage();
    }

    async run() {
        try {
            console.log(`[SOI SCRAPER] Iniciando para: ${this.contratista.nombre}`);

            // 1. Iniciar navegador visible
            await this.init();

            // 2. Navegar a la página de SOI
            console.log(`[SOI SCRAPER] Navegando a la página de Nuevo SOI...`);
            await this.page.goto('https://servicio.nuevosoi.com.co/soi/certificadoAportesCotizante.do', { waitUntil: 'load', timeout: 60000 });
            
            // Esperar un momento para que el usuario vea la página cargada
            await this.page.waitForTimeout(3000);

            // 3. Llenado de datos con IDs exactos
            console.log(`[SOI SCRAPER] Llenando formulario para: ${this.contratista.nombre}`);
            
            try {
                // Mapeo de tipos de documento a valores numéricos de SOI
                const docTypeValues = { 'cc': '1', 'ce': '6', 'nit': '2', 'pp': '5' };
                const docVal = docTypeValues[this.contratista.datosPlataforma?.loginData?.docType?.toLowerCase()] || '1';

                // --- DATOS DEL APORTANTE (Sección Arriba) ---
                console.log(`[SOI SCRAPER] Llenando Datos del Aportante (Tipo: ${docVal})...`);
                await this.page.selectOption('#tipoDocumentoAportante', docVal).catch(() => {});
                await this.page.waitForTimeout(1000);
                await this.page.fill('input[name="numeroDocumentoAportante"]', this.contratista.cedula);

                // --- INFORMACION DEL COTIZANTE (Sección Abajo) ---
                console.log(`[SOI SCRAPER] Llenando Información del Cotizante...`);
                // Seleccionar Tipo de Documento
                await this.page.selectOption('#tipoDocumentoCotizante', docVal).catch(() => {});
                await this.page.waitForTimeout(1000);
                
                // Llenar Número de Documento
                await this.page.fill('#numeroDocumentoCotizante', this.contratista.cedula);
                
                // Seleccionar EPS (administradoraSalud)
                if (this.contratista.eps && this.contratista.eps !== 'N/A') {
                    console.log(`[SOI SCRAPER] Buscando EPS: ${this.contratista.eps}`);
                    
                    const epsToFind = this.contratista.eps.toLowerCase();
                    const epsOption = await this.page.evaluate((target) => {
                        const opts = Array.from(document.querySelectorAll('#administradoraSalud option'));
                        const found = opts.find(o => o.innerText.toLowerCase().includes(target));
                        return found ? found.value : null;
                    }, epsToFind);

                    if (epsOption) {
                        console.log(`[SOI SCRAPER] EPS encontrada, seleccionando valor: ${epsOption}`);
                        await this.page.selectOption('#administradoraSalud', epsOption);
                        await this.page.waitForTimeout(1000);
                    } else {
                        console.log(`[SOI SCRAPER] No se encontró ninguna opción que coincida con "${this.contratista.eps}"`);
                    }
                }

                // Seleccionar Mes y Año
                if (this.month && this.year) {
                    console.log(`[SOI SCRAPER] Seleccionando periodo: ${this.month} - ${this.year}`);
                    const mesToFind = this.month.toLowerCase().substring(0, 3);
                    const mesValue = await this.page.evaluate((target) => {
                        const opts = Array.from(document.querySelectorAll('#periodoLiqSaludMes option'));
                        const found = opts.find(o => o.innerText.toLowerCase().includes(target));
                        return found ? found.value : null;
                    }, mesToFind);

                    if (mesValue) {
                        await this.page.selectOption('#periodoLiqSaludMes', mesValue);
                        await this.page.waitForTimeout(500);
                    }
                    
                    await this.page.selectOption('#periodoLiqSaludAnnio', { label: this.year }).catch(() => {});
                    await this.page.waitForTimeout(500);
                }

                console.log(`[SOI SCRAPER] Todos los campos completados.`);
                
                // Esperar para que el usuario pueda presenciar la acción
                await this.page.waitForTimeout(3000);

                // 4. Click en Descargar PDF y esperar la descarga real
                console.log(`[SOI SCRAPER] Presionando botón de Descargar PDF...`);
                
                // Intentar clickear y capturar descarga
                const [download] = await Promise.all([
                    this.page.waitForEvent('download', { timeout: 30000 }),
                    this.page.click('button.btn-success:has-text("Descargar PDF"), #btnDescargarPDF') 
                ]).catch(async (err) => {
                    console.log("[SOI SCRAPER] No se detectó evento de descarga inmediata. Capturando pantalla para diagnóstico...");
                    const errorPath = path.join(__dirname, '../../tmp', `error_soi_${this.contratista.cedula}.png`);
                    await this.page.screenshot({ path: errorPath, fullPage: true });
                    return [null];
                });

                if (download) {
                    const tmpDir = path.join(__dirname, '../../tmp');
                    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

                    const suggestedFilename = download.suggestedFilename();
                    const downloadPath = path.join(tmpDir, suggestedFilename);
                    await download.saveAs(downloadPath);
                    console.log(`[SOI SCRAPER] Descarga real finalizada en ${downloadPath}`);
                    
                    if (this.browser) await this.browser.close();
                    return downloadPath;
                }

            } catch (e) {
                console.log("[SOI SCRAPER] Error en el flujo de llenado:", e.message);
            }

            // Si llegamos aquí y no retornamos el path real
            console.log(`[SOI SCRAPER] No se pudo completar la descarga real.`);
            return null;

        } catch (error) {
            console.error(`Scraper Error for ${this.contratista.nombre}:`, error);
            if (this.browser) await this.browser.close();
            throw error;
        }
    }
}

module.exports = SOIScraper;
