import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

// Simular el flujo exacto del frontend
async function testFrontendFlow() {
    try {
        console.log('🚀 PROBANDO FLUJO EXACTO DEL FRONTEND');
        console.log('=====================================');

        // 1. Login como docente
        console.log('\n1️⃣ Login como docente...');
        // Usar las mismas credenciales del diagnóstico que funcionó
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'andreslopezpina187@gmail.com',
            password: '123456'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login falló');
        }

        const token = loginResponse.data.token;
        console.log('✅ Login exitoso');

        // Headers que usa el frontend
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Probar el endpoint exacto que usa getTeacherAssignments del frontend
        console.log('\n2️⃣ Probando endpoint /assignments/teacher/assignments...');
        
        // Construir URL exactamente como lo hace el frontend
        const params = {
            status: 'all',
            search: '',
            sort: '-createdAt',
            limit: 6,
            page: 1
        };

        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.page) queryParams.append('page', params.page);
        
        const url = `${BASE_URL}/assignments/teacher/assignments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        console.log('🔗 URL completa:', url);
        
        const assignmentsResponse = await axios.get(url, { headers });
        
        console.log('✅ Respuesta del servidor:');
        console.log('📊 Success:', assignmentsResponse.data.success);
        console.log('📋 Total asignaciones:', assignmentsResponse.data.assignments?.length || 0);
        console.log('📄 Paginación:', assignmentsResponse.data.pagination);
        
        if (assignmentsResponse.data.assignments && assignmentsResponse.data.assignments.length > 0) {
            console.log('\n📝 Primeras 3 asignaciones:');
            assignmentsResponse.data.assignments.slice(0, 3).forEach((assignment, index) => {
                console.log(`   ${index + 1}. ${assignment.title}`);
                console.log(`      - Estado: ${assignment.status}`);
                console.log(`      - Fecha vencimiento: ${assignment.dueDate}`);
                console.log(`      - Fecha cierre: ${assignment.closeDate}`);
            });
        } else {
            console.log('❌ No se encontraron asignaciones');
        }

        // 3. Comparar con el endpoint my-assignments
        console.log('\n3️⃣ Comparando con /assignments/my-assignments...');
        const myAssignmentsResponse = await axios.get(`${BASE_URL}/assignments/my-assignments`, { headers });
        
        console.log('📋 my-assignments total:', myAssignmentsResponse.data.assignments?.length || 0);

        // 4. Probar también las estadísticas
        console.log('\n4️⃣ Probando estadísticas...');
        const statsResponse = await axios.get(`${BASE_URL}/assignments/teacher/stats`, { headers });
        console.log('📊 Estadísticas:', statsResponse.data.stats);

        return {
            teacherAssignments: assignmentsResponse.data,
            myAssignments: myAssignmentsResponse.data,
            stats: statsResponse.data
        };

    } catch (error) {
        console.error('❌ Error en el test:', error.response?.data || error.message);
        return null;
    }
}

// Ejecutar el test
testFrontendFlow()
    .then(result => {
        if (result) {
            console.log('\n✅ Test completado exitosamente');
        }
    })
    .catch(error => {
        console.error('❌ Test falló:', error);
    });
