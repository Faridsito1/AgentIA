const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const contratistaController = require('../controllers/contratistaController');
const auth = require('../middlewares/auth');

// Supervisor
router.post('/register-supervisor', supervisorController.register);
router.post('/login-supervisor', supervisorController.login);
router.get('/dashboard', auth, supervisorController.getDashboard);

// Contratista
router.post('/register-contratista', contratistaController.register);
// Public
router.get('/supervisors', supervisorController.getAllSupervisors);
router.get('/check-cedula/:cedula', contratistaController.getProfile);

module.exports = router;
