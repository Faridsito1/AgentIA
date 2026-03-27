const axios = require('axios');

class CaptchaService {
    constructor() {
        this.apiKey = '61a717ac7aa1527ffd2574d8c892da93'; // Proporcionada por el usuario
        this.baseUrl = 'https://2captcha.com';
    }

    /**
     * Resuelve un captcha de imagen normal
     * @param {string} base64Image - Imagen en formato base64
     * @returns {string} - Texto del captcha
     */
    async solveImageCaptcha(base64Image) {
        try {
            console.log("[CAPTCHA SERVICE] Enviando imagen a 2captcha...");
            const res = await axios.post(`${this.baseUrl}/in.php`, {
                key: this.apiKey,
                method: 'base64',
                body: base64Image,
                json: 1
            });

            if (res.data.status !== 1) {
                throw new Error("2Captcha Submit Error: " + res.data.request);
            }
            
            const reqId = res.data.request;
            console.log(`[CAPTCHA SERVICE] Solicitud aceptada (ID: ${reqId}), esperando solución...`);
            
            return await this.pollResult(reqId);
        } catch (error) {
            console.error("[CAPTCHA SERVICE] Error en solveImageCaptcha:", error.message);
            throw error;
        }
    }

    /**
     * Resuelve un reCAPTCHA V2
     */
    async solveRecaptchaV2(sitekey, pageurl) {
        try {
            console.log(`[CAPTCHA SERVICE] Enviando solicitud reCAPTCHA V2 a 2captcha... (SiteKey: ${sitekey})`);
            const url = `${this.baseUrl}/in.php?key=${this.apiKey}&method=userrecaptcha&googlekey=${sitekey}&pageurl=${encodeURIComponent(pageurl)}&json=1`;
            const res = await axios.get(url);

            if (res.data.status !== 1) {
                throw new Error("2Captcha Submit Error: " + res.data.request);
            }
            
            const reqId = res.data.request;
            console.log(`[CAPTCHA SERVICE] Solicitud aceptada (ID: ${reqId}), esperando solución...`);
            
            return await this.pollResult(reqId);
        } catch (error) {
            console.error("[CAPTCHA SERVICE] Error en solveRecaptchaV2:", error.message);
            throw error;
        }
    }
    
    /**
     * Resuelve un reCAPTCHA V2 Enterprise
     */
    async solveRecaptchaV2Enterprise(sitekey, pageurl, action = 'login') {
        try {
            console.log(`[CAPTCHA SERVICE] Enviando solicitud reCAPTCHA Enterprise a 2captcha...`);
            const url = `${this.baseUrl}/in.php?key=${this.apiKey}&method=userrecaptcha&googlekey=${sitekey}&pageurl=${encodeURIComponent(pageurl)}&enterprise=1&action=${action}&json=1`;
            const res = await axios.get(url);

            if (res.data.status !== 1) {
                throw new Error("2Captcha Submit Error: " + res.data.request);
            }
            
            const reqId = res.data.request;
            console.log(`[CAPTCHA SERVICE] Solicitud aceptada (ID: ${reqId}), esperando solución...`);
            
            return await this.pollResult(reqId);
        } catch (error) {
            console.error("[CAPTCHA SERVICE] Error en solveRecaptchaV2Enterprise:", error.message);
            throw error;
        }
    }

    async pollResult(reqId) {
        let attempts = 0;
        const maxAttempts = 24; // 24 * 5 = 120 seconds max
        
        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 5000));
            attempts++;
            
            const url = `${this.baseUrl}/res.php?key=${this.apiKey}&action=get&id=${reqId}&json=1`;
            const res = await axios.get(url);
            console.log(`[CAPTCHA SERVICE] Polling Response (ID: ${reqId}): status=${res.data.status}, request=${res.data.request}`);
            
            if (res.data.status === 1) {
                if (res.data.request === reqId) {
                    console.log(`[CAPTCHA SERVICE] ADVERTENCIA: La solución es igual al ID. Ignorando...`);
                } else {
                    console.log(`[CAPTCHA SERVICE] Captcha resuelto exitosamente: ${res.data.request}`);
                    return res.data.request; // Result code/text
                }
            }
            
            if (res.data.request !== 'CAPCHA_NOT_READY' && res.data.request !== 'ERROR_CAPTCHA_UNSOLVABLE') {
                throw new Error("2Captcha Polling Error: " + res.data.request);
            }
            console.log(`[CAPTCHA SERVICE] Aún no está listo (${res.data.request}), intento ${attempts}/${maxAttempts}...`);
        }
        
        throw new Error("Captcha resolution timeout (120s)");
    }
}

module.exports = new CaptchaService();
