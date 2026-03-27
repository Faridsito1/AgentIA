const Contratista = require('../models/Contratista');
const { processSingleCertificate } = require('../utils/cron');

// Register Contratista (typically by supervisor or on landing page for the role)
exports.register = async (req, res) => {
    const { nombre, cedula, eps, sede, plataformaSeguro, supervisorId, datosPlataforma } = req.body;
    try {
        let contratista = await Contratista.findOne({ cedula });
        if (contratista) {
            // Update existing contratista
            console.log(`[AUTH] Actualizando datos para contratista existente: ${cedula}`);
            contratista.nombre = nombre || contratista.nombre;
            contratista.eps = eps || contratista.eps;
            contratista.sede = sede || contratista.sede;
            contratista.plataformaSeguro = plataformaSeguro || contratista.plataformaSeguro;
            contratista.supervisorId = supervisorId || contratista.supervisorId;
            contratista.datosPlataforma = datosPlataforma || contratista.datosPlataforma;
        } else {
            contratista = new Contratista({ nombre, cedula, eps, sede, plataformaSeguro, supervisorId, datosPlataforma });
        }
        await contratista.save();

        // 🟢 TRIGGER SCRAPER ASYNCHRONOUSLY
        if (datosPlataforma && datosPlataforma.periodoPago) {
            const [mes, anio] = datosPlataforma.periodoPago.split(' ');
            if (mes && anio) {
                // We do not await it here so the response returns to the user immediately
                processSingleCertificate(contratista, mes, anio);
            }
        }

        res.json(contratista);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Login Contratista (generate new certificate for an existing user)
exports.login = async (req, res) => {
    const { cedula, mes, anio } = req.body;
    try {
        let contratista = await Contratista.findOne({ cedula });
        if (!contratista) {
            return res.status(404).json({ msg: 'No se encontró un registro con esta cédula. Por favor, cargue sus datos primero.' });
        }

        // Update the period in the database
        if (contratista.datosPlataforma) {
             contratista.datosPlataforma.periodoPago = `${mes} ${anio}`;
             await contratista.save();
        }

        // 🟢 TRIGGER SCRAPER ASYNCHRONOUSLY
        processSingleCertificate(contratista, mes, anio);

        res.json({ msg: 'Solicitud enviada correctamente', contratista });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Get profile
exports.getProfile = async (req, res) => {
    const { cedula } = req.params;
    try {
        const contratista = await Contratista.findOne({ cedula }).select('-reportes');
        if (!contratista) return res.status(404).json({ msg: 'Contratista not found' });
        res.json(contratista);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

// Add report to history (manually or via scraper)
exports.addReport = async (req, res) => {
    const { cedula } = req.params;
    const { plataforma, mes, año, urlArchivoDrive, estado, errorReason } = req.body;
    try {
        const contratista = await Contratista.findOne({ cedula });
        if (!contratista) return res.status(404).json({ msg: 'Contratista not found' });

        contratista.reportes.push({ plataforma, mes, año, urlArchivoDrive, estado, errorReason });
        await contratista.save();
        res.json(contratista.reportes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};
