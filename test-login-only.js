import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testLoginOnly() {
    try {
        console.log('🔍 PROBANDO SOLO LOGIN\n');

        // 1. Login
        console.log('1️⃣ Login como docente...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });

        console.log('📦 Respuesta completa del login:');
        console.log(JSON.stringify(loginResponse.data, null, 2));

        if (loginResponse.data.success) {
            console.log('\n✅ Login exitoso');
            console.log('👤 Datos del usuario en respuesta:', {
                id: loginResponse.data.user._id,
                nombre: loginResponse.data.user.nombre,
                email: loginResponse.data.user.email,
                role: loginResponse.data.user.role
            });
        } else {
            console.log('❌ Login falló');
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testLoginOnly();
