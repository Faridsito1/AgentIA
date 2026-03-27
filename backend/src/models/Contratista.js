const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    plataforma: { type: String, required: true },
    mes: { type: String, required: true },
    año: { type: String, required: true },
    urlArchivoDrive: { type: String },
    fechaDescarga: { type: Date, default: Date.now },
    estado: { type: String, enum: ['PENDIENTE', 'DESCARGADO', 'ERROR'], default: 'PENDIENTE' },
    errorReason: { type: String }
}, { timestamps: true });

const ContratistaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    cedula: { type: String, required: true, unique: true },
    eps: { type: String, required: true },
    sede: { type: String }, // To allow grouping by sede
    plataformaSeguro: { type: String, required: true, enum: ['SOI', 'ASOPAGOS', 'COMPENSAR', 'APORTES_EN_LINEA', 'MI_PLANILLA'] },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor', required: true },
    datosPlataforma: {
        periodoPago: { type: String },
        fechaPlanilla: { type: Date },
        loginData: { type: Object } // Extra data for specific platforms
    },
    reportes: [ReportSchema] // Historial de reportes embebido
}, { timestamps: true });

module.exports = mongoose.model('Contratista', ContratistaSchema);
