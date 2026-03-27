const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const contratistaController = require('../controllers/contratistaController');

// Supervisor access required? For now, we secure via auth middleware
// All these assume req.user.id is the SUPERVISOR

// @route   GET /api/contratistas
// @desc    Get all contratistas for a supervisor
// @access  Private (Supervisor)
router.get('/', auth, async (req, res) => {
    try {
        const list = await require('../models/Contratista').find({ supervisorId: req.user.id });
        res.json(list);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/contratistas/reports/:year/:month
// @desc    Get status of reports for a specific year and month
// @access  Private (Supervisor)
router.get('/reports/:year/:month', auth, async (req, res) => {
    const { year, month } = req.params;
    try {
        const list = await require('../models/Contratista').find({ supervisorId: req.user.id });

        const status = list.map(c => {
            const report = c.reportes.find(r => r.año === year && r.mes === month);
            return {
                id: c._id,
                nombre: c.nombre,
                cedula: c.cedula,
                sede: c.sede, // This would be better if part of supervisor but user said "agrupados por sede"
                estado: report ? report.estado : 'NO PAGO',
                url: report ? report.urlArchivoDrive : null,
                error: report ? report.errorReason : null
            };
        });

        res.json(status);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/contratistas
// @desc    Admin/Supervisor adding a new contratista
// @access  Private (Supervisor)
router.post('/', auth, contratistaController.register);

module.exports = router;
