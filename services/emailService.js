import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Servicio de Email para el envío de correos electrónicos
 * Soporta múltiples proveedores: Gmail, SendGrid, AWS SES, etc.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    // No inicializar inmediatamente, esperar a que se necesite
  }

  /**
   * Inicializa el transportador de email basado en las variables de entorno
   */
  initializeTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'development';
    console.log('🔧 Inicializando transportador de email...');
    console.log('📧 EMAIL_PROVIDER desde .env:', emailProvider);
    console.log('📧 NODE_ENV desde .env:', process.env.NODE_ENV);

    switch (emailProvider.toLowerCase()) {
      case 'gmail':
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD, // App Password para Gmail
          },
        });
        break;

      case 'sendgrid':
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY,
          },
        });
        break;

      case 'aws-ses':
        this.transporter = nodemailer.createTransport({
          host: process.env.AWS_SES_HOST || 'email-smtp.us-east-1.amazonaws.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.AWS_SES_ACCESS_KEY,
            pass: process.env.AWS_SES_SECRET_KEY,
          },
        });
        break;

      case 'outlook':
      case 'hotmail':
        console.log('✅ Configurando transportador para Outlook...');
        this.transporter = nodemailer.createTransport({
          service: 'hotmail', // Usar servicio directo
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        console.log('✅ Transportador Outlook configurado');
        break;

      case 'tesjo':
      case 'institucional':
        console.log('✅ Configurando transportador para cuenta institucional TESJO...');
        this.transporter = nodemailer.createTransport({
          host: 'smtp.office365.com', // Servidor para cuentas institucionales
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            ciphers: 'SSLv3'
          }
        });
        console.log('✅ Transportador institucional configurado');
        break;

      case 'smtp':
        console.log('✅ Configurando transportador SMTP para cuenta institucional...');
        console.log('📧 Host:', process.env.SMTP_HOST);
        console.log('📧 Puerto:', process.env.SMTP_PORT);
        console.log('📧 Usuario:', process.env.EMAIL_USER);
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
          },
          // Configuración específica para Office365
          authMethod: 'LOGIN',
          pool: true,
          maxConnections: 5,
          rateDelta: 20000,
          rateLimit: 5
        });
        console.log('✅ Transportador SMTP configurado');
        break;

      case 'development':
      default:
        console.warn('⚠️ Modo de desarrollo - emails solo se mostrarán en consola');
        // Para desarrollo, usar un transportador que solo muestre logs
        this.transporter = {
          sendMail: async (mailOptions) => {
            console.log('\n📧 =====================================');
            console.log('📧 EMAIL DE DESARROLLO (No enviado)');
            console.log('📧 =====================================');
            console.log('📧 De:', mailOptions.from);
            console.log('📧 Para:', mailOptions.to);
            console.log('📧 Asunto:', mailOptions.subject);
            console.log('📧 Texto:', mailOptions.text);
            console.log('📧 =====================================\n');
            return {
              messageId: 'dev-' + Date.now(),
              accepted: [mailOptions.to]
            };
          },
          verify: async () => {
            console.log('✅ Transportador de desarrollo configurado');
            return true;
          }
        };
    }
  }

  /**
   * Asegura que el transportador esté inicializado
   */
  ensureTransporter() {
    if (!this.transporter) {
      this.initializeTransporter();
    }
  }

  /**
   * Compila un template de Handlebars con datos
   * @param {string} templateName - Nombre del template
   * @param {object} data - Datos para el template
   * @returns {string} - HTML compilado
   */
  compileTemplate(templateName, data) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(templatePath)) {
        console.warn(`⚠️ Template no encontrado: ${templatePath}`);
        return this.getDefaultTemplate(templateName, data);
      }
      
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      console.error('❌ Error compilando template:', error);
      return this.getDefaultTemplate(templateName, data);
    }
  }

  /**
   * Template por defecto si no se encuentran los archivos .hbs
   */
  getDefaultTemplate(templateName, data) {
    if (templateName === 'password-reset') {
      return `
<!DOCTYPE html>
<html>
<head><title>Recuperación de Contraseña</title></head>
<body>
  <h2>Recuperación de Contraseña</h2>
  <p>Hola ${data.userName},</p>
  <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
  <a href="${data.resetUrl}">Restablecer Contraseña</a>
  <p>Este enlace expirará en ${data.expirationTime}.</p>
  <p>Si no solicitaste esto, puedes ignorar este correo.</p>
</body>
</html>
      `;
    } else if (templateName === 'password-changed') {
      return `
<!DOCTYPE html>
<html>
<head><title>Contraseña Actualizada</title></head>
<body>
  <h2>Contraseña Actualizada</h2>
  <p>Hola ${data.userName},</p>
  <p>Tu contraseña ha sido actualizada exitosamente el ${data.changeDate}.</p>
  <p>Si no fuiste tú, contacta inmediatamente a soporte.</p>
</body>
</html>
      `;
    }
    return '<p>Error: Template no disponible</p>';
  }

  /**
   * Envía un email de recuperación de contraseña
   * @param {string} email - Email del destinatario
   * @param {string} resetToken - Token de recuperación
   * @param {object} user - Datos del usuario
   */
  async sendPasswordResetEmail(email, resetToken, user) {
    try {
      this.ensureTransporter(); // Asegurar que el transportador esté inicializado
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const templateData = {
        userName: `${user.nombre} ${user.apellidoPaterno}`,
        resetUrl,
        expirationTime: '1 hora',
        supportEmail: process.env.SUPPORT_EMAIL || 'soporte@sistema.com',
        companyName: process.env.COMPANY_NAME || 'Sistema de Seguimiento de Docentes',
        currentYear: new Date().getFullYear()
      };

      const htmlContent = this.compileTemplate('password-reset', templateData);

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Sistema de Seguimiento',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: email,
        subject: 'Recuperación de Contraseña - Sistema de Seguimiento',
        html: htmlContent,
        text: `
Hola ${templateData.userName},

Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:

${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo.

Saludos,
${templateData.companyName}
        `.trim()
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email de recuperación enviado:', {
        messageId: result.messageId,
        email: email,
        accepted: result.accepted,
        rejected: result.rejected,
        pending: result.pending,
        response: result.response
      });

      // Verificar si el email fue rechazado
      if (result.rejected && result.rejected.length > 0) {
        console.warn('⚠️ Algunos destinatarios fueron rechazados:', result.rejected);
      }

      return {
        success: true,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected
      };

    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw new Error('Error al enviar el correo de recuperación');
    }
  }

  /**
   * Envía un email de confirmación de cambio de contraseña
   * @param {string} email - Email del destinatario
   * @param {object} user - Datos del usuario
   */
  async sendPasswordChangeConfirmation(email, user) {
    try {
      const templateData = {
        userName: `${user.nombre} ${user.apellidoPaterno}`,
        changeDate: new Date().toLocaleString('es-ES'),
        supportEmail: process.env.SUPPORT_EMAIL || 'soporte@sistema.com',
        companyName: process.env.COMPANY_NAME || 'Sistema de Seguimiento de Docentes',
        currentYear: new Date().getFullYear()
      };

      const htmlContent = this.compileTemplate('password-changed', templateData);

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Sistema de Seguimiento',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to: email,
        subject: 'Contraseña Actualizada - Sistema de Seguimiento',
        html: htmlContent,
        text: `
Hola ${templateData.userName},

Tu contraseña ha sido actualizada exitosamente el ${templateData.changeDate}.

Si no realizaste este cambio, contacta inmediatamente a nuestro soporte en ${templateData.supportEmail}.

Saludos,
${templateData.companyName}
        `.trim()
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email de confirmación enviado:', {
        messageId: result.messageId,
        email: email
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      // No lanzar error aquí, ya que el cambio de contraseña fue exitoso
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica la conexión del servicio de email
   */
  async verifyConnection() {
    try {
      this.ensureTransporter(); // Asegurar que el transportador esté inicializado
      await this.transporter.verify();
      console.log('✅ Servicio de email configurado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error en la configuración de email:', error);
      return false;
    }
  }
}

// Crear instancia única del servicio
const emailService = new EmailService();

export default emailService;
