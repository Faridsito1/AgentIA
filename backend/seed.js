require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Supervisor = require('./src/models/Supervisor');
const Contratista = require('./src/models/Contratista');
const connectDB = require('./src/config/db');

async function seed() {
    await connectDB();

    // Clear DB
    await Supervisor.deleteMany({});
    await Contratista.deleteMany({});

    // Create Supervisor
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    const supervisor = new Supervisor({
        nombre: 'Admin Supervisor',
        email: 'admin@sena.edu.co',
        password: password,
        sede: 'Bogota Centro'
    });
    await supervisor.save();

    // Create Contratistas
    const contratista1 = new Contratista({
        nombre: 'Juan Perez',
        cedula: '123456789',
        eps: 'Sanitas',
        plataformaSeguro: 'SOI',
        supervisorId: supervisor._id,
        reportes: [
            {
                plataforma: 'SOI',
                mes: 'Marzo', // Hardcoded for dashboard test
                año: '2025',
                estado: 'DESCARGADO',
                urlArchivoDrive: 'http://example.com'
            }
        ]
    });
    await contratista1.save();

    const contratista2 = new Contratista({
        nombre: 'Maria Lopez',
        cedula: '987654321',
        eps: 'Compensar',
        plataformaSeguro: 'COMPENSAR',
        supervisorId: supervisor._id
    });
    await contratista2.save();

    console.log('Database seeded successfully');
    process.exit();
}

seed();
