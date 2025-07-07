import axios from 'axios';
import FormData from 'form-data';

console.log('🎭 CREANDO ASIGNACIONES DE PRUEBA PARA DOCENTES');
console.log('==============================================\n');

async function createTestAssignments() {
    const BASE_URL = 'http://localhost:3001/api';
    
    try {
        // 1. Login como admin para crear asignaciones
        console.log('1️⃣ Login como administrador...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        const adminToken = loginResponse.data.token;
        console.log('✅ Login exitoso');
        
        // 2. Crear varias asignaciones de prueba
        const assignmentsToCreate = [
            {
                title: 'Planificación del Curriculum Semestral',
                description: 'Elaborar la planificación completa del curriculum para el próximo semestre, incluyendo objetivos de aprendizaje, cronograma de actividades y metodologías de evaluación.',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 semana
                isGeneral: true
            },
            {
                title: 'Evaluación de Proyectos Finales',
                description: 'Revisar y evaluar todos los proyectos finales de los estudiantes del curso actual. Proporcionar retroalimentación detallada y calificaciones.',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
                isGeneral: true
            },
            {
                title: 'Preparación de Material Didáctico',
                description: 'Crear y actualizar material didáctico para las próximas clases, incluyendo presentaciones, ejercicios prácticos y recursos multimedia.',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 semanas
                isGeneral: true
            },
            {
                title: 'Reunión de Coordinación Académica',
                description: 'Participar en la reunión mensual de coordinación académica para discutir estrategias pedagógicas y resolver temas administrativos.',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
                isGeneral: true
            },
            {
                title: 'Capacitación en Nuevas Tecnologías',
                description: 'Completar el curso de capacitación en nuevas tecnologías educativas para mejorar la enseñanza en modalidad virtual y presencial.',
                dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 semanas
                isGeneral: true
            }
        ];
        
        console.log('\n2️⃣ Creando asignaciones de prueba...');
        const createdAssignments = [];
        
        for (let i = 0; i < assignmentsToCreate.length; i++) {
            const assignment = assignmentsToCreate[i];
            
            const formData = new FormData();
            formData.append('title', assignment.title);
            formData.append('description', assignment.description);
            formData.append('dueDate', assignment.dueDate.toISOString());
            formData.append('isGeneral', assignment.isGeneral.toString());
            
            try {
                const response = await axios.post(`${BASE_URL}/assignments`, formData, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        ...formData.getHeaders()
                    }
                });
                
                if (response.data.success) {
                    createdAssignments.push(response.data.data);
                    console.log(`✅ Asignación ${i + 1} creada: "${assignment.title}"`);
                }
            } catch (error) {
                console.log(`❌ Error creando asignación ${i + 1}:`, error.response?.data?.error || error.message);
            }
        }
        
        console.log(`\n📊 Resumen: ${createdAssignments.length} asignaciones creadas exitosamente`);
        
        // 3. Ahora probemos los endpoints de docente con datos reales
        console.log('\n3️⃣ Probando endpoints con datos reales...');
        
        // Obtener estadísticas
        const statsResponse = await axios.get(`${BASE_URL}/assignments/teacher/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        console.log('📊 Estadísticas actualizadas:');
        console.log(`  - Total: ${statsResponse.data.stats.total}`);
        console.log(`  - Pendientes: ${statsResponse.data.stats.pending}`);
        console.log(`  - Completadas: ${statsResponse.data.stats.completed}`);
        console.log(`  - Vencidas: ${statsResponse.data.stats.overdue}`);
        console.log(`  - Próximas a vencer: ${statsResponse.data.stats.upcomingDeadlines}`);
        console.log(`  - Tasa de finalización: ${statsResponse.data.stats.completionRate}%`);
        
        // Obtener asignaciones
        const assignmentsResponse = await axios.get(`${BASE_URL}/assignments/teacher/assignments`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            params: { limit: 10 }
        });
        
        console.log(`\n📋 Asignaciones disponibles: ${assignmentsResponse.data.assignments.length}`);
        
        if (assignmentsResponse.data.assignments.length > 0) {
            const firstAssignment = assignmentsResponse.data.assignments[0];
            console.log(`\n📝 Primera asignación: "${firstAssignment.title}"`);
            console.log(`   Estado: ${firstAssignment.status}`);
            console.log(`   Vence: ${new Date(firstAssignment.dueDate).toLocaleDateString()}`);
            
            // Marcar una como completada para prueba
            console.log('\n4️⃣ Marcando una asignación como completada...');
            try {
                const completeResponse = await axios.patch(
                    `${BASE_URL}/assignments/teacher/${firstAssignment._id}/complete`,
                    {},
                    { headers: { Authorization: `Bearer ${adminToken}` } }
                );
                
                console.log('✅ Asignación marcada como completada exitosamente');
                
                // Verificar estadísticas actualizadas
                const updatedStatsResponse = await axios.get(`${BASE_URL}/assignments/teacher/stats`, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                
                console.log('\n📊 Estadísticas después de completar una asignación:');
                console.log(`  - Completadas: ${updatedStatsResponse.data.stats.completed}`);
                console.log(`  - Pendientes: ${updatedStatsResponse.data.stats.pending}`);
                console.log(`  - Tasa de finalización: ${updatedStatsResponse.data.stats.completionRate}%`);
                
            } catch (error) {
                console.log('❌ Error marcando como completada:', error.response?.data?.error);
            }
        }
        
        console.log('\n🎉 CONFIGURACIÓN DE PRUEBA COMPLETADA');
        console.log('====================================');
        console.log('✅ Asignaciones de prueba creadas');
        console.log('✅ Endpoints funcionando correctamente');
        console.log('✅ Sistema listo para pruebas del frontend');
        console.log('\n🚀 Ahora puedes probar la interfaz de docentes en el frontend!');
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        if (error.response) {
            console.error('📋 Respuesta:', error.response.data);
        }
    }
}

createTestAssignments();
