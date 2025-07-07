import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function generateLoginCredentials() {
    try {
        console.log('🔑 GENERANDO CREDENCIALES PARA EL NAVEGADOR');
        console.log('===========================================');

        // Login
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'profesor@test.com',
            password: 'profesor123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login falló');
        }

        const token = loginResponse.data.token;
        const user = loginResponse.data.user;

        console.log('✅ Login exitoso');
        console.log('\n📋 Para usar en el navegador:');
        console.log('1. Abre las DevTools (F12)');
        console.log('2. Ve a la pestaña Console');
        console.log('3. Pega los siguientes comandos uno por uno:\n');
        
        console.log(`localStorage.setItem("token", "${token}");`);
        console.log(`localStorage.setItem("user", '${JSON.stringify(user)}');`);
        
        console.log('\n4. Recarga la página');
        console.log('\n👤 Usuario:', user.email);
        console.log('🔑 Token válido hasta:', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString());

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

generateLoginCredentials();
