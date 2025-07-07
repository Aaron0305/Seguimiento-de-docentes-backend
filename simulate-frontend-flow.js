import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function simulateFrontendFlow() {
    try {
        console.log('🎭 SIMULANDO FLUJO COMPLETO DEL FRONTEND');
        console.log('=========================================');

        // Paso 1: Login
        console.log('\n1️⃣ Login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login falló');
        }

        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log('✅ Login exitoso para:', user.email);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Paso 2: Cargar estadísticas (como hace el useEffect)
        console.log('\n2️⃣ Cargando estadísticas...');
        try {
            const statsResponse = await axios.get(`${BASE_URL}/assignments/teacher/stats`, { headers });
            console.log('✅ Estadísticas cargadas:', statsResponse.data.stats);
        } catch (error) {
            console.log('❌ Error cargando estadísticas:', error.response?.data || error.message);
        }

        // Paso 3: Cargar asignaciones con parámetros exactos del frontend
        console.log('\n3️⃣ Cargando asignaciones...');
        
        // Simular estado inicial del frontend
        const statusFilter = 'all';
        const searchTerm = '';
        const sortBy = '-createdAt';
        const page = 1;
        const limit = 6;

        const params = {
            status: statusFilter,
            search: searchTerm,
            sort: sortBy,
            page: page,
            limit: limit
        };

        console.log('📤 Parámetros a enviar:', params);

        // Construir query string como lo hace el frontend
        const queryParams = new URLSearchParams();
        
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.page) queryParams.append('page', params.page);
        
        const url = `${BASE_URL}/assignments/teacher/assignments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        console.log('🔗 URL completa:', url);

        const assignmentsResponse = await axios.get(url, { headers });
        
        console.log('📥 Respuesta recibida:', {
            success: assignmentsResponse.data.success,
            assignmentsCount: assignmentsResponse.data.assignments?.length || 0,
            pagination: assignmentsResponse.data.pagination
        });

        // Paso 4: Verificar qué haría el frontend con esta respuesta
        console.log('\n4️⃣ Procesando respuesta como el frontend...');
        
        if (assignmentsResponse.data.success) {
            const assignments = assignmentsResponse.data.assignments || [];
            const totalPages = assignmentsResponse.data.pagination?.totalPages || 1;
            
            console.log('✅ Respuesta procesada exitosamente:');
            console.log(`   - Asignaciones a mostrar: ${assignments.length}`);
            console.log(`   - Páginas totales: ${totalPages}`);
            
            if (assignments.length > 0) {
                console.log('\n📝 Asignaciones a renderizar:');
                assignments.forEach((assignment, index) => {
                    console.log(`   ${index + 1}. ${assignment.title}`);
                    console.log(`      - Estado: ${assignment.status}`);
                    console.log(`      - Vence: ${new Date(assignment.dueDate).toLocaleDateString()}`);
                    console.log(`      - Cierra: ${new Date(assignment.closeDate).toLocaleDateString()}`);
                });
                
                console.log('\n✅ El frontend DEBERÍA mostrar', assignments.length, 'asignaciones');
            } else {
                console.log('\n❌ Array de asignaciones vacío - frontend mostraría "No tienes asignaciones"');
            }
        } else {
            console.log('❌ Respuesta marcada como no exitosa:', assignmentsResponse.data);
        }

        // Paso 5: Comparar con el endpoint my-assignments para verificar
        console.log('\n5️⃣ Comparando con my-assignments...');
        try {
            const myAssignmentsResponse = await axios.get(`${BASE_URL}/assignments/my-assignments`, { headers });
            console.log('📋 Total en my-assignments:', myAssignmentsResponse.data.assignments?.length || 0);
            
            if (myAssignmentsResponse.data.assignments?.length > 0) {
                console.log('✅ Hay asignaciones en la BD, el problema está en el filtrado o frontend');
            } else {
                console.log('❌ No hay asignaciones para este usuario en la BD');
            }
        } catch (error) {
            console.log('❌ Error en my-assignments:', error.response?.data || error.message);
        }

        return assignmentsResponse.data;

    } catch (error) {
        console.error('❌ Error en simulación:', error.response?.data || error.message);
        return null;
    }
}

simulateFrontendFlow();
