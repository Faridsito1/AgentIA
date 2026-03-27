class BaseScraper {
  constructor(contratista, month, year) {
    this.contratista = contratista;
    this.month = month;
    this.year = year;
  }
  async run() {
    throw new Error('Not implemented');
  }
}
module.exports = BaseScraper;
