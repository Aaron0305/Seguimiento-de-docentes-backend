import mongoose from 'mongoose';
import Carrera from './models/Carrera.js';

const listCareers = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/medidor');
        console.log('✅ Conectado a MongoDB');

        const carreras = await Carrera.find();
        console.log('📋 Carreras encontradas:', carreras.length);
        
        carreras.forEach(carrera => {
            console.log(`- ${carrera.nombre} (ID: ${carrera._id})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

listCareers();
