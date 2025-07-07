import connectDB from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';

async function createTestTeacher() {
    await connectDB();
    
    console.log('👨‍🏫 Creando usuario docente de prueba...');
    
    try {
        // Verificar si ya existe
        const existingTeacher = await User.findOne({ email: 'profesor@test.com' });
        if (existingTeacher) {
            console.log('✅ El docente de prueba ya existe:', existingTeacher.email);
            console.log('📧 Email: profesor@test.com');
            console.log('🔑 Password: profesor123');
            console.log('🎯 Rol:', existingTeacher.role);
            process.exit(0);
        }
        
        // Crear nuevo docente
        const hashedPassword = await bcrypt.hash('profesor123', 10);
        
        const newTeacher = new User({
            email: 'profesor@test.com',
            password: hashedPassword,
            numeroControl: 'PROF001',
            nombre: 'Profesor',
            apellidoPaterno: 'de',
            apellidoMaterno: 'Prueba',
            carrera: '6835f84d797e8dda20f1cd5d', // ID de carrera existente
            semestre: 1,
            role: 'docente',
            isEmailVerified: true
        });
        
        await newTeacher.save();
        
        console.log('✅ Docente de prueba creado exitosamente!');
        console.log('📧 Email: profesor@test.com');
        console.log('🔑 Password: profesor123');
        console.log('🎯 Rol: docente');
        
        console.log('\n🔄 Ahora las asignaciones generales se asignarán también a este docente...');
        
    } catch (error) {
        console.error('❌ Error creando docente:', error.message);
    }
    
    process.exit(0);
}

createTestTeacher();
