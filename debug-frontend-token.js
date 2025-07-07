import axios from 'axios';
import FormData from 'form-data';

async function debugFrontendTokenFlow() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL FLUJO DE TOKEN FRONTEND');
    console.log('=====================================\n');

    const BASE_URL = 'http://localhost:3001/api';
    let adminToken = null;

    try {
        // 1. Login como admin (simulando el frontend)
        console.log('1️⃣ PASO 1: Login como administrador');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });

        adminToken = loginResponse.data.token;
        const user = loginResponse.data.user;
        
        console.log('✅ Login exitoso');
        console.log('📋 Respuesta completa:', JSON.stringify(loginResponse.data, null, 2));
        console.log('🔑 Token recibido:', adminToken);
        console.log('👤 Usuario:', user);
        console.log('🎯 Rol del usuario:', user.role);
        console.log();

        // 2. Verificar que el token sea válido inmediatamente
        console.log('2️⃣ PASO 2: Verificación inmediata del token');
        try {
            const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
                headers: { 
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Token válido inmediatamente después del login');
            console.log('👤 Usuario verificado:', verifyResponse.data.user.email);
            console.log('🎯 Rol verificado:', verifyResponse.data.user.role);
        } catch (error) {
            console.log('❌ ERROR: Token inválido inmediatamente después del login');
            console.log('📋 Error:', error.response?.data || error.message);
            return;
        }
        console.log();

        // 3. Simular el flujo exacto del frontend para crear asignación
        console.log('3️⃣ PASO 3: Creación de asignación (simulando frontend exacto)');
        
        // Crear FormData exactamente como lo hace el frontend
        const formData = new FormData();
        
        formData.append('title', 'Asignación de Prueba Frontend Debug');
        formData.append('description', 'Prueba simulando el flujo exacto del frontend');
        formData.append('dueDate', new Date('2025-12-31').toISOString());
        formData.append('isGeneral', 'true');

        // Headers exactos del frontend
        const headers = {
            'Authorization': `Bearer ${adminToken}`,
            ...formData.getHeaders()
        };

        console.log('📤 Headers enviados:', headers);
        console.log('📤 FormData creado con los siguientes campos:');
        console.log('  - title: Asignación de Prueba Frontend Debug');
        console.log('  - description: Prueba simulando el flujo exacto del frontend');
        console.log('  - dueDate:', new Date('2025-12-31').toISOString());
        console.log('  - isGeneral: true');

        const assignmentResponse = await axios.post(`${BASE_URL}/assignments`, formData, {
            headers
        });

        console.log('✅ Asignación creada exitosamente');
        console.log('📋 Respuesta:', JSON.stringify(assignmentResponse.data, null, 2));
        console.log();

        // 4. Verificar que el token sigue siendo válido después de crear asignación
        console.log('4️⃣ PASO 4: Verificación del token después de crear asignación');
        try {
            const verifyAfterResponse = await axios.get(`${BASE_URL}/auth/verify`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            console.log('✅ Token sigue siendo válido después de crear asignación');
            console.log('👤 Usuario:', verifyAfterResponse.data.user.email);
        } catch (error) {
            console.log('❌ ERROR: Token se volvió inválido después de crear asignación');
            console.log('📋 Error:', error.response?.data || error.message);
        }
        console.log();

        // 5. Obtener asignaciones para verificar que se creó correctamente
        console.log('5️⃣ PASO 5: Obtener todas las asignaciones');
        try {
            const assignmentsResponse = await axios.get(`${BASE_URL}/assignments`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            console.log('✅ Asignaciones obtenidas exitosamente');
            console.log('📊 Total de asignaciones:', assignmentsResponse.data.assignments?.length || 0);
            
            const lastAssignment = assignmentsResponse.data.assignments?.[0];
            if (lastAssignment) {
                console.log('📋 Última asignación creada:', lastAssignment.title);
                console.log('📅 Fecha de creación:', lastAssignment.createdAt);
            }
        } catch (error) {
            console.log('❌ ERROR obteniendo asignaciones');
            console.log('📋 Error:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('❌ ERROR EN EL FLUJO:', error.message);
        
        if (error.response) {
            console.error('📋 Respuesta del servidor:', error.response.status, error.response.statusText);
            console.error('📋 Datos del error:', JSON.stringify(error.response.data, null, 2));
            console.error('📋 Headers de respuesta:', error.response.headers);
        }
        
        if (error.config) {
            console.error('📋 Configuración de la petición:', {
                url: error.config.url,
                method: error.config.method,
                headers: error.config.headers
            });
        }
    }

    console.log('\n🔍 ANÁLISIS COMPLETO');
    console.log('=====================================');
    console.log('✅ Si todos los pasos fueron exitosos, el backend está funcionando correctamente');
    console.log('❌ Si algún paso falló, el problema está en el backend');
    console.log('🔧 Si el backend funciona pero el frontend falla, el problema está en:');
    console.log('   - Manejo del token en localStorage');
    console.log('   - Headers de autenticación');
    console.log('   - Formato de las peticiones');
    console.log('   - CORS o problemas de red');
}

// Ejecutar el diagnóstico
debugFrontendTokenFlow().catch(console.error);
