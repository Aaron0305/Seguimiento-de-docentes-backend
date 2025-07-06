// Script para probar la creación de asignaciones sin autenticación
import http from 'http';

const testAssignmentCreationNoAuth = () => {
    // Datos de la asignación de prueba
    const assignmentData = JSON.stringify({
        title: 'Asignación de Prueba - SIN AUTH',
        description: 'Esta asignación demuestra que el backend puede guardar en la base de datos',
        dueDate: new Date('2025-12-31').toISOString(),
        isGeneral: true
    });

    const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/assignments/test', // Usando la ruta sin autenticación
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log('📋 Status:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                if (res.statusCode === 201) {
                    console.log('✅ ¡ASIGNACIÓN CREADA Y GUARDADA EXITOSAMENTE!');
                    console.log('📝 Título:', response.data.title);
                    console.log('📄 ID:', response.data._id);
                    console.log('👥 Asignada a:', response.data.assignedTo?.length || 0, 'usuarios');
                    console.log('📅 Fecha de creación:', response.data.createdAt);
                } else {
                    console.log('❌ Error:', response.error || response.message);
                }
            } catch (e) {
                console.log('📤 Respuesta raw:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error:', error.message);
    });

    req.write(assignmentData);
    req.end();
};

console.log('🚀 Probando creación de asignación SIN autenticación...');
testAssignmentCreationNoAuth();
