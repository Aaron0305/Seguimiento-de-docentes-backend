import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testDirectAPI() {
    try {
        console.log('🔍 PROBANDO API DIRECTAMENTE\n');

        // 1. Login
        console.log('1️⃣ Login como docente...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login falló');
        }

        console.log('✅ Login exitoso');
        console.log('👤 Usuario logueado:', {
            id: loginResponse.data.user._id,
            nombre: loginResponse.data.user.nombre,
            email: loginResponse.data.user.email,
            role: loginResponse.data.user.role
        });

        const token = loginResponse.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Obtener asignaciones usando /my-assignments
        console.log('\n2️⃣ Obteniendo asignaciones via /my-assignments...');
        const myAssignmentsResponse = await axios.get(`${BASE_URL}/assignments/my-assignments`, { headers });
        
        console.log('📦 Respuesta completa:', JSON.stringify(myAssignmentsResponse.data, null, 2));

        if (myAssignmentsResponse.data.success && myAssignmentsResponse.data.assignments.length > 0) {
            const firstAssignment = myAssignmentsResponse.data.assignments[0];
            console.log('\n📋 Primera asignación raw data:');
            console.log(JSON.stringify(firstAssignment, null, 2));
        }

        // 3. Obtener asignaciones usando /teacher/assignments
        console.log('\n3️⃣ Obteniendo asignaciones via /teacher/assignments...');
        const teacherAssignmentsResponse = await axios.get(`${BASE_URL}/assignments/teacher/assignments`, { headers });
        
        console.log('📦 Respuesta completa:', JSON.stringify(teacherAssignmentsResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testDirectAPI();
