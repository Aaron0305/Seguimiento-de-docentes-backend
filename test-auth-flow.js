import fetch from 'node-fetch';

async function testAuthFlow() {
    console.log('🔍 === TESTING AUTHENTICATION FLOW ===\n');
    
    try {
        // 1. Hacer login
        console.log('1. 🔐 Haciendo login...');
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@test-api.com',
                password: 'test123'
            })
        });

        const loginData = await loginResponse.json();
        console.log('📋 Respuesta de login:', loginData);

        if (!loginResponse.ok || !loginData.token) {
            console.log('❌ Login falló');
            return;
        }

        const token = loginData.token;
        console.log('✅ Token obtenido:', token.substring(0, 50) + '...');

        // 2. Probar crear asignación
        console.log('\n2. 📝 Probando crear asignación...');
        const assignmentData = {
            title: 'Asignación de Prueba Auth',
            description: 'Esta es una prueba de autenticación',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            isGeneral: true
        };

        const createResponse = await fetch('http://localhost:3001/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(assignmentData)
        });

        const createData = await createResponse.json();
        console.log('📋 Respuesta de creación:', createResponse.status, createData);

        if (createResponse.ok) {
            console.log('✅ Asignación creada exitosamente');
        } else {
            console.log('❌ Error creando asignación:', createData.message);
        }

        // 3. Probar obtener todas las asignaciones
        console.log('\n3. 📚 Probando obtener asignaciones...');
        const getAllResponse = await fetch('http://localhost:3001/api/assignments/all', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const getAllData = await getAllResponse.json();
        console.log('📋 Respuesta de obtener todas:', getAllResponse.status, getAllData);

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
    }
}

testAuthFlow();
