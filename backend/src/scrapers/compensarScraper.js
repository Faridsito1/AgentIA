const MiPlanillaScraper = require('./miplanillaScraper');

/**
 * Compensar Scraper
 * Many Compensar users use the Mi Planilla platform.
 */
class CompensarScraper extends MiPlanillaScraper {
    async run() {
        console.log(`[COMPENSAR SCRAPER] Iniciando proceso vía Mi Planilla para ${this.contratista.nombre}...`);
        return await super.run();
    }
}

module.exports = CompensarScraper;
