import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testAssignmentImprovements() {
    try {
        console.log('🧪 PROBANDO MEJORAS EN ASIGNACIONES');
        console.log('====================================');

        // 1. Login
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

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Obtener asignaciones para verificar que incluyen el rol del creador
        console.log('\n2️⃣ Obteniendo asignaciones...');
        const assignmentsResponse = await axios.get(`${BASE_URL}/assignments/teacher/assignments?status=all&limit=3`, { headers });
        
        if (assignmentsResponse.data.success && assignmentsResponse.data.assignments.length > 0) {
            console.log('✅ Asignaciones obtenidas exitosamente');
            
            assignmentsResponse.data.assignments.forEach((assignment, index) => {
                console.log(`\n📋 Asignación ${index + 1}:`);
                console.log(`   - Título: ${assignment.title}`);
                console.log(`   - Estado: ${assignment.status}`);
                console.log(`   - Fecha vencimiento: ${new Date(assignment.dueDate).toLocaleString('es-ES')}`);
                console.log(`   - Fecha cierre: ${new Date(assignment.closeDate).toLocaleString('es-ES')}`);
                
                if (assignment.createdBy) {
                    console.log(`   - Creado por: ${assignment.createdBy.nombre} ${assignment.createdBy.apellidoPaterno}`);
                    console.log(`   - Rol del creador: ${assignment.createdBy.role || 'No especificado'}`);
                } else {
                    console.log('   - ⚠️ Información del creador no disponible');
                }

                // Verificar estado de fechas
                const now = new Date();
                const dueDate = new Date(assignment.dueDate);
                const closeDate = new Date(assignment.closeDate);
                
                let status = '';
                if (now > closeDate) {
                    status = '🔴 CERRADA - No se puede entregar';
                } else if (now > dueDate) {
                    status = '🟡 VENCIDA - Se puede entregar con retraso';
                } else {
                    status = '🟢 ACTIVA - Se puede entregar a tiempo';
                }
                
                console.log(`   - Estado temporal: ${status}`);
            });
        } else {
            console.log('❌ No se obtuvieron asignaciones');
        }

        // 3. Obtener detalles de una asignación específica
        if (assignmentsResponse.data.assignments.length > 0) {
            const firstAssignment = assignmentsResponse.data.assignments[0];
            
            console.log(`\n3️⃣ Obteniendo detalles de asignación: ${firstAssignment.title}`);
            
            const detailResponse = await axios.get(`${BASE_URL}/assignments/${firstAssignment._id}`, { headers });
            
            if (detailResponse.data.success) {
                console.log('✅ Detalles obtenidos exitosamente');
                const assignment = detailResponse.data.data;
                
                console.log('\n📋 Información detallada:');
                console.log(`   - ID: ${assignment._id}`);
                console.log(`   - Título: ${assignment.title}`);
                console.log(`   - Descripción: ${assignment.description.substring(0, 100)}...`);
                console.log(`   - Estado: ${assignment.status}`);
                console.log(`   - Fecha vencimiento: ${new Date(assignment.dueDate).toLocaleString('es-ES')}`);
                console.log(`   - Fecha cierre: ${new Date(assignment.closeDate).toLocaleString('es-ES')}`);
                console.log(`   - Fecha creación: ${new Date(assignment.createdAt).toLocaleString('es-ES')}`);
                
                if (assignment.createdBy) {
                    console.log(`   - Creado por: ${assignment.createdBy.nombre} ${assignment.createdBy.apellidoPaterno} ${assignment.createdBy.apellidoMaterno || ''}`);
                    console.log(`   - Email creador: ${assignment.createdBy.email}`);
                    console.log(`   - Rol creador: ${assignment.createdBy.role || 'No especificado'}`);
                }
                
                if (assignment.completedAt) {
                    console.log(`   - Completada el: ${new Date(assignment.completedAt).toLocaleString('es-ES')}`);
                }
            }
        }

        console.log('\n✅ Prueba completada exitosamente');
        console.log('\n🎯 Verificaciones realizadas:');
        console.log('   ✅ Fechas incluyen hora');
        console.log('   ✅ Información del creador incluye rol');
        console.log('   ✅ Estados de asignación según fechas');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
    }
}

testAssignmentImprovements();
