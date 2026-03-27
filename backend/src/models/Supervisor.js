const mongoose = require('mongoose');

const SupervisorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sede: { type: String, required: true },
    googleDriveToken: { type: Object }, // Store the OAuth2 token object
    googleDriveFolderId: { type: String } // The ID of the "Reportes Seguridad Social" folder
}, { timestamps: true });

module.exports = mongoose.model('Supervisor', SupervisorSchema);
