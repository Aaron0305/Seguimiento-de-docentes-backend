import fetch from 'node-fetch';
import FormData from 'form-data';

async function testFrontendFlow() {
    console.log('🔍 === SIMULANDO FLUJO DEL FRONTEND ===\n');
    
    try {
        // 1. Simular login desde frontend
        console.log('1. 🔐 Simulando login desde frontend...');
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
        console.log('📋 Login exitoso:', loginData.success);

        if (!loginData.success) {
            console.log('❌ Error en login');
            return;
        }

        const token = loginData.token;

        // 2. Simular creación de asignación con FormData (como en frontend)
        console.log('\n2. 📝 Simulando creación de asignación con FormData...');
        
        const formData = new FormData();
        formData.append('title', 'Asignación de Prueba Frontend');
        formData.append('description', 'es una prueba');
        formData.append('dueDate', '2025-07-07T16:44:00.000Z');
        formData.append('isGeneral', 'true');

        const createResponse = await fetch('http://localhost:3001/api/assignments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // No incluir Content-Type para FormData
            },
            body: formData
        });

        console.log('📋 Status de creación:', createResponse.status);
        const createData = await createResponse.json();
        console.log('📋 Respuesta completa:', createData);

        if (createResponse.ok) {
            console.log('✅ Asignación creada exitosamente desde simulación de frontend');
        } else {
            console.log('❌ Error creando asignación:', createData.message || createData.error);
        }

        // 3. Probar el endpoint debug
        console.log('\n3. 🔍 Probando endpoint debug...');
        const debugResponse = await fetch('http://localhost:3001/api/assignments/debug-headers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test: 'data'
            })
        });

        const debugData = await debugResponse.json();
        console.log('📋 Debug response:', debugData);

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
    }
}

testFrontendFlow();
