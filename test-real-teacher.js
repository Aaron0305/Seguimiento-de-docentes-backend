import axios from 'axios';

async function testWithRealTeacher() {
    try {
        console.log('🧑‍🏫 Probando con usuario docente real...');
        
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'profesor@test.com',
            password: 'profesor123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login docente exitoso:', loginResponse.data.user.email);
        console.log('🎯 Rol:', loginResponse.data.user.role);
        
        const statsResponse = await axios.get('http://localhost:3001/api/assignments/teacher/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n📊 Estadísticas del docente:');
        console.log('  - Total:', statsResponse.data.stats.total);
        console.log('  - Pendientes:', statsResponse.data.stats.pending);
        console.log('  - Completadas:', statsResponse.data.stats.completed);
        console.log('  - Vencidas:', statsResponse.data.stats.overdue);
        console.log('  - Próximas a vencer:', statsResponse.data.stats.upcomingDeadlines);
        
        const assignmentsResponse = await axios.get('http://localhost:3001/api/assignments/teacher/assignments', {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 3 }
        });
        
        console.log('\n📋 Asignaciones del docente:', assignmentsResponse.data.assignments.length);
        assignmentsResponse.data.assignments.forEach((assignment, index) => {
            console.log(`  ${index + 1}. ${assignment.title}`);
            console.log(`     Estado: ${assignment.status}`);
            console.log(`     Vence: ${new Date(assignment.dueDate).toLocaleDateString()}`);
        });
        
        console.log('\n🎉 ¡Los endpoints funcionan perfectamente con usuarios docentes!');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testWithRealTeacher();
