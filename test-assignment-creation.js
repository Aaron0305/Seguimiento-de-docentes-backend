// Script para probar la creación de asignaciones con token válido
import http from 'http';

const testAssignmentCreation = () => {
    // Token simple generado con la clave correcta
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NmFkYjY2ODk0OTA5Y2FkYjk0NDliZiIsImlhdCI6MTc1MTgzNDQ3OCwiZXhwIjoxNzUyNDM5Mjc4fQ.zXoXRKEDm5RO5mZKD-EBT_9dYNkeQg6gf2oIaYM9Vt8';
    
    // Datos de la asignación de prueba
    const assignmentData = JSON.stringify({
        title: 'Asignación de Prueba desde Script',
        description: 'Esta es una asignación creada desde el script de prueba',
        dueDate: new Date('2025-12-31').toISOString(),
        isGeneral: true
    });

    const options = {
        hostname: 'localhost',
        port: 3002, // Usando puerto 3002 para la prueba
        path: '/api/assignments',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
                    console.log('✅ Asignación creada exitosamente!');
                    console.log('📝 Título:', response.data.title);
                    console.log('📄 ID:', response.data._id);
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

console.log('🚀 Probando creación de asignación...');
testAssignmentCreation();
