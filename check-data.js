import connectDB from './config/db.js';
import User from './models/User.js';
import Assignment from './models/Assignment.js';

async function checkData() {
    await connectDB();
    
    console.log('🔍 Verificando usuarios con rol docente...');
    const docentes = await User.find({ role: 'docente' }).select('email nombre apellidoPaterno role');
    console.log('📚 Docentes encontrados:', docentes.length);
    docentes.forEach(d => console.log('  -', d.email, '(' + d.nombre, d.apellidoPaterno + ')'));
    
    console.log('\n🔍 Verificando usuario admin...');
    const admin = await User.findOne({ email: 'admin@test.com' }).select('email nombre role');
    console.log('👑 Admin:', admin ? `${admin.email} (${admin.role})` : 'No encontrado');
    
    console.log('\n🔍 Verificando asignaciones creadas...');
    const assignments = await Assignment.find().populate('assignedTo', 'email nombre').sort('-createdAt').limit(5);
    console.log('📋 Asignaciones encontradas:', assignments.length);
    assignments.forEach(a => {
        console.log('  - ' + a.title);
        console.log('    General:', a.isGeneral);
        console.log('    Asignada a:', a.assignedTo.length, 'docentes');
        if (a.assignedTo.length > 0) {
            console.log('    Docentes:', a.assignedTo.map(d => d.email).slice(0, 3).join(', ') + (a.assignedTo.length > 3 ? '...' : ''));
        }
        console.log('    Creada:', a.createdAt);
        console.log('');
    });
    
    process.exit(0);
}

checkData().catch(console.error);
