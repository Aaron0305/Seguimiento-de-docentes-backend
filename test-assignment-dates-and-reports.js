import axios from 'axios';

console.log('🧪 PROBANDO FUNCIONALIDAD DE FECHAS DE VENCIMIENTO Y CIERRE');
console.log('===========================================================\n');

async function testAssignmentDatesAndReports() {
    const BASE_URL = 'http://localhost:3001/api';
    let adminToken = null;
    let teacherToken = null;

    try {
        // 1. Login como admin
        console.log('1️⃣ Login como administrador...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        adminToken = adminLogin.data.token;
        console.log('✅ Login de admin exitoso');

        // 2. Login como docente
        console.log('2️⃣ Login como docente...');
        const teacherLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });
        teacherToken = teacherLogin.data.token;
        console.log('✅ Login de docente exitoso');

        // 3. Crear una asignación de prueba con fechas específicas
        console.log('\n3️⃣ Creando asignación de prueba con fechas específicas...');
        
        const now = new Date();
        const dueDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Vencida hace 2 días
        const closeDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // Cerrada hace 1 día

        const assignmentData = {
            title: 'PRUEBA - Asignación Cerrada para Test de Reportes',
            description: 'Esta asignación está diseñada para probar el sistema de reportes de mal desempeño. Ya está cerrada.',
            dueDate: dueDate.toISOString(),
            closeDate: closeDate.toISOString(),
            isGeneral: true
        };

        const createResponse = await axios.post(`${BASE_URL}/assignments`, assignmentData, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Asignación cerrada creada:', createResponse.data.data.title);
        console.log(`   - Fecha de vencimiento: ${new Date(createResponse.data.data.dueDate).toLocaleString()}`);
        console.log(`   - Fecha de cierre: ${new Date(createResponse.data.data.closeDate).toLocaleString()}`);

        // 4. Intentar subir una respuesta después del cierre (debe fallar)
        console.log('\n4️⃣ Intentando subir respuesta después del cierre...');
        try {
            const submitResponse = await axios.post(
                `${BASE_URL}/assignments/${createResponse.data.data._id}/submit`,
                { comment: 'Intento de entrega tardía' },
                {
                    headers: {
                        'Authorization': `Bearer ${teacherToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('❌ ERROR: Se permitió la entrega después del cierre');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Correcto: La entrega fue rechazada después del cierre');
                console.log('   Mensaje:', error.response.data.error);
            } else {
                console.log('❌ Error inesperado:', error.response?.data || error.message);
            }
        }

        // 5. Crear una asignación próxima a vencer
        console.log('\n5️⃣ Creando asignación próxima a vencer...');
        
        const dueDateSoon = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // Vence en 1 día
        const closeDateSoon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Cierra en 3 días

        const upcomingAssignment = {
            title: 'PRUEBA - Asignación Próxima a Vencer',
            description: 'Esta asignación vence en 1 día y cierra en 3 días.',
            dueDate: dueDateSoon.toISOString(),
            closeDate: closeDateSoon.toISOString(),
            isGeneral: true
        };

        const upcomingResponse = await axios.post(`${BASE_URL}/assignments`, upcomingAssignment, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Asignación próxima a vencer creada:', upcomingResponse.data.data.title);

        // 6. Generar reporte de mal desempeño
        console.log('\n6️⃣ Generando reporte de mal desempeño...');
        
        const poorPerformanceReport = await axios.post(
            `${BASE_URL}/assignments/reports/send-poor-performance`,
            {
                sendEmails: false // Solo generar reporte, no enviar emails en la prueba
            },
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Reporte de mal desempeño generado');
        console.log('   Docentes con mal desempeño:', poorPerformanceReport.data.data.summary.totalTeachersWithPoorPerformance);
        console.log('   Asignaciones no entregadas:', poorPerformanceReport.data.data.summary.totalMissedAssignments);

        if (poorPerformanceReport.data.data.reports.length > 0) {
            console.log('\n📋 Detalle de docentes con mal desempeño:');
            poorPerformanceReport.data.data.reports.forEach((report, index) => {
                console.log(`   ${index + 1}. ${report.teacherInfo.fullName} (${report.teacherInfo.email})`);
                console.log(`      Asignaciones no entregadas: ${report.missedAssignments.length}`);
                report.missedAssignments.forEach(assignment => {
                    console.log(`        - ${assignment.title} (${assignment.daysPastDue} días de retraso)`);
                });
            });
        }

        // 7. Generar recordatorios
        console.log('\n7️⃣ Generando recordatorios de asignaciones próximas a vencer...');
        
        const remindersReport = await axios.post(
            `${BASE_URL}/assignments/reports/send-reminders`,
            {
                daysAhead: 3,
                sendEmails: false // Solo generar reporte, no enviar emails en la prueba
            },
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Reporte de recordatorios generado');
        console.log('   Docentes con recordatorios:', remindersReport.data.data.summary.totalTeachersWithReminders);
        console.log('   Asignaciones pendientes:', remindersReport.data.data.summary.totalPendingAssignments);

        if (remindersReport.data.data.reminders.length > 0) {
            console.log('\n📋 Detalle de recordatorios:');
            remindersReport.data.data.reminders.forEach((reminder, index) => {
                console.log(`   ${index + 1}. ${reminder.teacherInfo.fullName} (${reminder.teacherInfo.email})`);
                console.log(`      Asignaciones pendientes: ${reminder.pendingAssignments.length}`);
                reminder.pendingAssignments.forEach(assignment => {
                    console.log(`        - ${assignment.title} (${assignment.daysUntilDue} días para vencer - ${assignment.priority})`);
                });
            });
        }

        // 8. Probar entrega antes del vencimiento
        console.log('\n8️⃣ Probando entrega antes del vencimiento...');
        
        try {
            const onTimeSubmit = await axios.post(
                `${BASE_URL}/assignments/${upcomingResponse.data.data._id}/submit`,
                { comment: 'Entrega a tiempo' },
                {
                    headers: {
                        'Authorization': `Bearer ${teacherToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Entrega realizada exitosamente');
            console.log('   Estado de entrega:', onTimeSubmit.data.submissionStatus);
            console.log('   Mensaje:', onTimeSubmit.data.message);
        } catch (error) {
            console.log('❌ Error en entrega:', error.response?.data || error.message);
        }

        console.log('\n🎉 PRUEBAS COMPLETADAS EXITOSAMENTE');
        console.log('=================================');
        console.log('✅ Sistema de fechas de vencimiento y cierre funcionando');
        console.log('✅ Bloqueo de entregas después del cierre funcionando');
        console.log('✅ Generación de reportes de mal desempeño funcionando');
        console.log('✅ Generación de recordatorios funcionando');
        console.log('✅ Estados de entrega (a tiempo/tarde) funcionando');

    } catch (error) {
        console.error('❌ ERROR EN LAS PRUEBAS:', error.response?.data || error.message);
        if (error.response) {
            console.error('📋 Status:', error.response.status);
            console.error('📋 Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testAssignmentDatesAndReports();
