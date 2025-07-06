// Script simple para verificar si el servidor responde
import http from 'http';

const testServer = () => {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/verify',
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        console.log('✅ Servidor respondiendo en puerto 3001');
        console.log('📋 Status:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📤 Respuesta:', data);
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error conectando al servidor:', error.message);
    });

    req.on('timeout', () => {
        console.error('❌ Timeout conectando al servidor');
        req.destroy();
    });

    req.end();
};

testServer();
