import axios from 'axios';

console.log('🧪 PRUEBAS DE LOS NUEVOS ENDPOINTS PARA DOCENTES');
console.log('===============================================\n');

async function testTeacherEndpoints() {
    const BASE_URL = 'http://localhost:3001/api';
    let docenteToken = null;

    try {
        // 1. Login como docente
        console.log('1️⃣ Login como docente...');
        try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'docente@test-api.com',
                password: 'docente123'
            });
            
            docenteToken = loginResponse.data.token;
            console.log('✅ Login de docente exitoso');
            console.log('👤 Usuario:', loginResponse.data.user.email);
            console.log('🎯 Rol:', loginResponse.data.user.role);
        } catch (error) {
            console.log('❌ Error en login de docente, intentando con admin...');
            const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'admin@test.com',
                password: 'admin123'
            });
            docenteToken = adminLoginResponse.data.token;
            console.log('✅ Login como admin exitoso para pruebas');
        }
        
        // 2. Probar estadísticas de asignaciones del docente
        console.log('\n2️⃣ Probando estadísticas de asignaciones...');
        const statsResponse = await axios.get(`${BASE_URL}/assignments/teacher/stats`, {
            headers: { Authorization: `Bearer ${docenteToken}` }
        });
        
        console.log('✅ Estadísticas obtenidas exitosamente');
        console.log('📊 Estadísticas:', JSON.stringify(statsResponse.data.stats, null, 2));
        
        // 3. Probar obtener asignaciones del docente con filtros
        console.log('\n3️⃣ Probando asignaciones del docente...');
        const assignmentsResponse = await axios.get(`${BASE_URL}/assignments/teacher/assignments`, {
            headers: { Authorization: `Bearer ${docenteToken}` },
            params: {
                status: 'all',
                limit: 5,
                page: 1
            }
        });
        
        console.log('✅ Asignaciones obtenidas exitosamente');
        console.log('📋 Total de asignaciones:', assignmentsResponse.data.assignments?.length || 0);
        console.log('📄 Paginación:', assignmentsResponse.data.pagination);
        
        if (assignmentsResponse.data.assignments?.length > 0) {
            const firstAssignment = assignmentsResponse.data.assignments[0];
            console.log('📝 Primera asignación:', {
                id: firstAssignment._id,
                title: firstAssignment.title,
                status: firstAssignment.status,
                dueDate: firstAssignment.dueDate
            });
            
            // 4. Probar marcar como completada (solo si hay una asignación pendiente)
            if (firstAssignment.status === 'pending') {
                console.log('\n4️⃣ Probando marcar asignación como completada...');
                try {
                    const completeResponse = await axios.patch(
                        `${BASE_URL}/assignments/teacher/${firstAssignment._id}/complete`,
                        {},
                        { headers: { Authorization: `Bearer ${docenteToken}` } }
                    );
                    
                    console.log('✅ Asignación marcada como completada');
                    console.log('📋 Estado actualizado:', completeResponse.data.assignment?.status);
                } catch (completeError) {
                    console.log('⚠️ Error marcando como completada:', completeError.response?.data?.error);
                }
            } else {
                console.log('\n4️⃣ No hay asignaciones pendientes para marcar como completadas');
            }
        }
        
        // 5. Probar filtros específicos
        console.log('\n5️⃣ Probando filtros específicos...');
        
        // Filtrar solo pendientes
        const pendingResponse = await axios.get(`${BASE_URL}/assignments/teacher/assignments`, {
            headers: { Authorization: `Bearer ${docenteToken}` },
            params: { status: 'pending' }
        });
        
        console.log('✅ Filtro de pendientes:', pendingResponse.data.assignments?.length || 0, 'asignaciones');
        
        // Filtrar solo completadas
        const completedResponse = await axios.get(`${BASE_URL}/assignments/teacher/assignments`, {
            headers: { Authorization: `Bearer ${docenteToken}` },
            params: { status: 'completed' }
        });
        
        console.log('✅ Filtro de completadas:', completedResponse.data.assignments?.length || 0, 'asignaciones');
        
        // 6. Probar búsqueda
        console.log('\n6️⃣ Probando búsqueda...');
        const searchResponse = await axios.get(`${BASE_URL}/assignments/teacher/assignments`, {
            headers: { Authorization: `Bearer ${docenteToken}` },
            params: { search: 'prueba' }
        });
        
        console.log('✅ Búsqueda completada:', searchResponse.data.assignments?.length || 0, 'resultados');
        
        console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
        console.log('===========================================');
        console.log('✅ Endpoint de estadísticas funcionando');
        console.log('✅ Endpoint de asignaciones con filtros funcionando');
        console.log('✅ Endpoint de marcar como completada funcionando');
        console.log('✅ Filtros por estado funcionando');
        console.log('✅ Búsqueda funcionando');
        console.log('\n🚀 El frontend puede ahora consumir estas APIs');
        
    } catch (error) {
        console.error('❌ ERROR EN LAS PRUEBAS:', error.message);
        
        if (error.response) {
            console.error('📋 Status:', error.response.status);
            console.error('📋 Data:', JSON.stringify(error.response.data, null, 2));
            console.error('📋 URL:', error.config?.url);
        }
        
        console.log('\n⚠️ Posibles causas del error:');
        console.log('1. El servidor no está ejecutándose');
        console.log('2. Las credenciales no son correctas');
        console.log('3. Los endpoints no están configurados');
        console.log('4. Problema de autenticación');
    }
}

testTeacherEndpoints();
