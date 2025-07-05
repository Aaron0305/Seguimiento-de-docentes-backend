import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Script de prueba para verificar la configuración de Gmail
 * Ejecuta: node test-gmail-config.js
 */

async function testGmailConfig() {
  console.log('🧪 Testing Gmail configuration...');
  
  // Verificar variables de entorno
  console.log('📧 EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***@gmail.com` : 'NO CONFIGURADO');
  console.log('📧 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'CONFIGURADO' : 'NO CONFIGURADO');
  console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Faltan configurar EMAIL_USER y/o EMAIL_PASSWORD en .env');
    return;
  }
  
  // Crear transportador
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  try {
    // Verificar conexión
    console.log('🔗 Verificando conexión...');
    await transporter.verify();
    console.log('✅ Conexión Gmail exitosa!');
    
    // Enviar email de prueba
    console.log('📨 Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_USER, // Se envía a la misma cuenta
      subject: '🧪 Prueba de configuración Gmail - Sistema TESJO',
      html: `
        <h2>✅ Configuración Gmail exitosa</h2>
        <p>Si recibes este correo, la configuración de Gmail está funcionando correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Sistema:</strong> Seguimiento de Docentes - TESJO</p>
        <hr>
        <p><em>Este es un email de prueba del sistema de recuperación de contraseñas.</em></p>
      `,
    });
    
    console.log('✅ Email enviado exitosamente!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📧 Verifica tu bandeja de entrada en:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Error de autenticación. Verifica:');
      console.error('   - Que tengas activada la verificación en 2 pasos');
      console.error('   - Que hayas generado una contraseña de aplicación');
      console.error('   - Que la contraseña de aplicación sea correcta');
    }
  } finally {
    transporter.close();
  }
}

// Ejecutar la prueba
testGmailConfig().catch(console.error);
