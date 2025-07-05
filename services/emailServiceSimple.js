/**
 * Servicio de Email simplificado para desarrollo
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'development';
    
    console.log('⚠️ Modo de desarrollo - emails solo se mostrarán en consola');
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

  async sendPasswordResetEmail(email, resetToken, user) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Sistema de Seguimiento',
          address: process.env.EMAIL_FROM || 'noreply@sistema.com'
        },
        to: email,
        subject: 'Recuperación de Contraseña - Sistema de Seguimiento',
        text: `
Hola ${user.nombre} ${user.apellidoPaterno},

Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:

${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo.

Saludos,
Sistema de Seguimiento de Docentes
        `.trim()
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email de recuperación procesado:', {
        messageId: result.messageId,
        email: email,
        accepted: result.accepted
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw new Error('Error al enviar el correo de recuperación');
    }
  }

  async sendPasswordChangeConfirmation(email, user) {
    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Sistema de Seguimiento',
          address: process.env.EMAIL_FROM || 'noreply@sistema.com'
        },
        to: email,
        subject: 'Contraseña Actualizada - Sistema de Seguimiento',
        text: `
Hola ${user.nombre} ${user.apellidoPaterno},

Tu contraseña ha sido actualizada exitosamente.

Si no realizaste este cambio, contacta inmediatamente al soporte.

Saludos,
Sistema de Seguimiento de Docentes
        `.trim()
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email de confirmación procesado:', {
        messageId: result.messageId,
        email: email
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Servicio de email configurado correctamente');
      return true;
    } catch (error) {
      console.log('⚠️ Servicio en modo desarrollo');
      return true;
    }
  }
}

// Crear instancia única del servicio
const emailService = new EmailService();

export default emailService;
