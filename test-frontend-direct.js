import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testFrontendEndpoint() {
    try {
        console.log('🚀 PROBANDO ENDPOINT DEL FRONTEND DIRECTAMENTE');
        console.log('==============================================');

        // 1. Login como en el diagnóstico
        console.log('\n1️⃣ Login como docente...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login falló');
        }

        const token = loginResponse.data.token;
        console.log('✅ Login exitoso');
        console.log('👤 Usuario:', loginResponse.data.user);

        // Headers exactos del frontend
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Parámetros exactos del frontend
        const params = {
            status: 'all',
            search: '',
            sort: '-createdAt',
            limit: 6,
            page: 1
        };

        // Construir URL exactamente como el frontend
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });
        
        const url = `${BASE_URL}/assignments/teacher/assignments?${queryParams.toString()}`;
        
        console.log('\n2️⃣ Probando endpoint del frontend...');
        console.log('� URL:', url);
        
        // Llamar al endpoint
        const response = await axios.get(url, { headers });
        
        console.log('✅ Respuesta exitosa:');
        console.log('📊 Success:', response.data.success);
        console.log('📋 Total asignaciones:', response.data.assignments?.length || 0);
        console.log('📄 Paginación:', response.data.pagination);
        
        if (response.data.assignments && response.data.assignments.length > 0) {
            console.log('\n📝 Asignaciones encontradas:');
            response.data.assignments.forEach((assignment, index) => {
                console.log(`   ${index + 1}. ${assignment.title}`);
                console.log(`      - Estado: ${assignment.status}`);
                console.log(`      - Vence: ${assignment.dueDate}`);
                console.log(`      - Cierra: ${assignment.closeDate}`);
                console.log(`      - Creado: ${assignment.createdAt}`);
            });
        } else {
            console.log('❌ No hay asignaciones en la respuesta');
        }

        // Comparar con my-assignments
        console.log('\n3️⃣ Comparando con my-assignments...');
        const myAssignmentsResponse = await axios.get(`${BASE_URL}/assignments/my-assignments`, { headers });
        console.log('📋 my-assignments:', myAssignmentsResponse.data.assignments?.length || 0, 'asignaciones');

        return response.data;

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        return null;
    }
}

testFrontendEndpoint();
