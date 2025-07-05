import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Script de diagnóstico avanzado para problemas de entrega de correo
 */

async function diagnosticEmailDelivery() {
  console.log('🔍 Diagnóstico avanzado de entrega de correos');
  console.log('=' .repeat(50));
  
  // Verificar configuración
  console.log('📋 Configuración actual:');
  console.log('   EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
  console.log('   EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('   EMAIL_USER:', process.env.EMAIL_USER);
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('');

  // Crear transportador
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true, // Activar modo debug
    logger: true // Activar logging detallado
  });

  const testEmails = [
    process.env.EMAIL_USER, // A la misma cuenta de Gmail
    '2022150480607@tesjo.edu.mx', // A la cuenta institucional
  ];

  for (const testEmail of testEmails) {
    console.log(`📧 Probando envío a: ${testEmail}`);
    console.log('-'.repeat(40));
    
    try {
      const result = await transporter.sendMail({
        from: {
          name: 'Test Sistema TESJO',
          address: process.env.EMAIL_FROM
        },
        to: testEmail,
        subject: `🧪 Test de entrega - ${new Date().toLocaleTimeString()}`,
        html: `
          <h2>🧪 Test de Diagnóstico</h2>
          <p><strong>Destinatario:</strong> ${testEmail}</p>
          <p><strong>Hora:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Desde:</strong> ${process.env.EMAIL_FROM}</p>
          <hr>
          <p>Si recibes este correo, la entrega funciona correctamente.</p>
        `,
        text: `Test de diagnóstico enviado a ${testEmail} en ${new Date().toLocaleString()}`
      });

      console.log('✅ Resultado del envío:');
      console.log('   Message ID:', result.messageId);
      console.log('   Accepted:', result.accepted);
      console.log('   Rejected:', result.rejected);
      console.log('   Pending:', result.pending);
      console.log('   Response:', result.response);
      
      if (result.rejected && result.rejected.length > 0) {
        console.log('❌ EMAILS RECHAZADOS:', result.rejected);
        console.log('   Esto indica que el servidor de destino rechazó el correo');
      }
      
      if (result.accepted && result.accepted.length > 0) {
        console.log('✅ EMAILS ACEPTADOS:', result.accepted);
        console.log('   El servidor de destino aceptó el correo para entrega');
      }

    } catch (error) {
      console.error('❌ Error enviando a', testEmail);
      console.error('   Error:', error.message);
      
      if (error.code === 'EAUTH') {
        console.error('   🔐 Problema de autenticación con Gmail');
      } else if (error.code === 'ECONNECTION') {
        console.error('   🌐 Problema de conexión');
      } else if (error.responseCode) {
        console.error('   📫 Código de respuesta SMTP:', error.responseCode);
        console.error('   📫 Respuesta SMTP:', error.response);
      }
    }
    
    console.log('');
  }

  // Cerrar conexión
  transporter.close();
  
  console.log('🎯 Recomendaciones:');
  console.log('1. Si Gmail funciona pero TESJO no: problema con servidor institucional');
  console.log('2. Si ambos fallan: problema de configuración Gmail');
  console.log('3. Si "accepted" pero no llega: revisar spam/filtros');
  console.log('4. Si "rejected": servidor destino bloqueó el correo');
}

// Ejecutar diagnóstico
diagnosticEmailDelivery().catch(console.error);
