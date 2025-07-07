import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

const generateTeacherToken = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/seguimiento-docentes');
        console.log('✅ Conectado a MongoDB');

        // Buscar un docente
        const teacher = await User.findOne({ 
            rol: 'docente',
            email: { $exists: true }
        }).populate('carrera');
        
        if (!teacher) {
            console.log('❌ No se encontró ningún docente');
            return;
        }

        // Generar nuevo token
        const token = jwt.sign(
            { 
                id: teacher._id,
                email: teacher.email,
                rol: teacher.rol
            },
            process.env.JWT_SECRET || 'tu_jwt_secret',
            { expiresIn: '7d' }
        );

        console.log('✅ Docente encontrado:', {
            email: teacher.email,
            nombre: teacher.nombre,
            apellidos: `${teacher.apellidoPaterno} ${teacher.apellidoMaterno}`,
            carrera: teacher.carrera?.nombre
        });
        console.log('🔑 Nuevo token generado:');
        console.log(token);
        
        console.log('\n📋 Credenciales para test:');
        console.log(`Email: ${teacher.email}`);
        console.log(`ID: ${teacher._id}`);
        console.log(`Rol: ${teacher.rol}`);

        return {
            token,
            user: teacher
        };

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

generateTeacherToken();
