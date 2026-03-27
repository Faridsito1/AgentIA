const Supervisor = require('../models/Supervisor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Supervisor
exports.register = async (req, res) => {
    const { nombre, email, password, sede } = req.body;
    try {
        let supervisor = await Supervisor.findOne({ email });
        if (supervisor) return res.status(400).json({ msg: 'Supervisor already exists' });

        supervisor = new Supervisor({ nombre, email, password, sede });
        const salt = await bcrypt.genSalt(10);
        supervisor.password = await bcrypt.hash(password, salt);
        await supervisor.save();

        const payload = { id: supervisor.id };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login Supervisor
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let supervisor = await Supervisor.findOne({ email });
        if (!supervisor) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, supervisor.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { id: supervisor.id };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get Dashboard
exports.getDashboard = async (req, res) => {
    try {
        const supervisor = await Supervisor.findById(req.user.id).select('-password');
        // Fetch related contratistas later
        res.json(supervisor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
// Get all supervisors (public for instructor registration)
exports.getAllSupervisors = async (req, res) => {
    try {
        const supervisors = await Supervisor.find().select('nombre sede');
        res.json(supervisors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
