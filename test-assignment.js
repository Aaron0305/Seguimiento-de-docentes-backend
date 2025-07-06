import fetch from 'node-fetch';

// Script para probar la creación de asignaciones
async function testAssignmentCreation() {
    try {
        // Primero hacer login para obtener un token
        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@test.com', // Cambia por un email de admin válido
                password: 'admin123'      // Cambia por la contraseña correcta
            })
        });

        if (!loginResponse.ok) {
            console.log('Error en login:', await loginResponse.text());
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;

        // Crear una asignación de prueba
        const formData = new FormData();
        formData.append('title', 'Asignación de Prueba');
        formData.append('description', 'Esta es una asignación de prueba para verificar que se guarda en la base de datos');
        formData.append('dueDate', new Date('2025-12-31').toISOString());
        formData.append('isGeneral', 'true');

        const response = await fetch('http://localhost:3001/api/assignments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Asignación creada exitosamente:', data);
        } else {
            console.log('❌ Error al crear asignación:', data);
        }

        // Verificar que se guardó obteniendo todas las asignaciones
        const getResponse = await fetch('http://localhost:3001/api/assignments/all', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const assignments = await getResponse.json();
        console.log('📋 Asignaciones en la base de datos:', assignments.data?.length || 0);

    } catch (error) {
        console.error('Error:', error);
    }
}

testAssignmentCreation();
