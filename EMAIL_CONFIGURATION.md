# Configuración de Email para Recuperación de Contraseña

## Información General

El sistema soporta múltiples proveedores de email para el envío de correos de recuperación de contraseña:

- **Gmail** (Recomendado para desarrollo)
- **SendGrid** (Recomendado para producción)
- **AWS SES** (Para alta escala)
- **SMTP personalizado** (Para servidores propios)

## Configuración por Proveedor

### 1. Gmail (Desarrollo)

**Pasos para configurar Gmail:**

1. **Habilitar 2FA** en tu cuenta de Google
2. **Generar App Password**:
   - Ve a [Google Account Settings](https://myaccount.google.com/)
   - Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones
   - Genera una contraseña para "Correo"
3. **Configurar variables de entorno**:
   ```env
   EMAIL_PROVIDER=gmail
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=tu-app-password-de-16-caracteres
   EMAIL_FROM=tu-email@gmail.com
   EMAIL_FROM_NAME=Sistema de Seguimiento de Docentes
   ```

### 2. SendGrid (Producción Recomendada)

**Pasos para configurar SendGrid:**

1. **Crear cuenta** en [SendGrid](https://sendgrid.com/)
2. **Generar API Key**:
   - Settings → API Keys → Create API Key
   - Seleccionar "Full Access" o permisos específicos de Mail Send
3. **Configurar variables de entorno**:
   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.tu-api-key-aqui
   EMAIL_FROM=noreply@tu-dominio.com
   EMAIL_FROM_NAME=Sistema de Seguimiento de Docentes
   ```

### 3. AWS SES (Alta Escala)

**Pasos para configurar AWS SES:**

1. **Configurar AWS SES** en la consola de AWS
2. **Verificar dominio** o email de envío
3. **Crear credenciales SMTP** en SES
4. **Configurar variables de entorno**:
   ```env
   EMAIL_PROVIDER=aws-ses
   AWS_SES_HOST=email-smtp.us-east-1.amazonaws.com
   AWS_SES_ACCESS_KEY=tu-access-key
   AWS_SES_SECRET_KEY=tu-secret-key
   EMAIL_FROM=noreply@tu-dominio.com
   EMAIL_FROM_NAME=Sistema de Seguimiento de Docentes
   ```

### 4. SMTP Personalizado

**Para servidores SMTP propios:**

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu-usuario
SMTP_PASSWORD=tu-password
EMAIL_FROM=noreply@tu-dominio.com
EMAIL_FROM_NAME=Sistema de Seguimiento de Docentes
```

## Variables de Entorno Requeridas

### Básicas (Todas las configuraciones)
```env
# Proveedor de email
EMAIL_PROVIDER=gmail|sendgrid|aws-ses|smtp

# Información del remitente
EMAIL_FROM=noreply@tu-dominio.com
EMAIL_FROM_NAME=Sistema de Seguimiento de Docentes

# URLs del sistema
FRONTEND_URL=http://localhost:3000
SUPPORT_EMAIL=soporte@tu-dominio.com
COMPANY_NAME=Sistema de Seguimiento de Docentes
```

### Específicas por Proveedor

Ver secciones anteriores para configuraciones específicas.

## Configuración de Rate Limiting

El sistema incluye rate limiting para prevenir spam:

```env
# Límites de autenticación (login, registro)
AUTH_RATE_LIMIT_WINDOW=900000    # 15 minutos
AUTH_RATE_LIMIT_MAX=5            # 5 intentos

# Límites de recuperación de contraseña
PASSWORD_RESET_RATE_LIMIT_WINDOW=3600000  # 1 hora
PASSWORD_RESET_RATE_LIMIT_MAX=3           # 3 intentos

# Límites de cambio de contraseña
PASSWORD_CHANGE_RATE_LIMIT_WINDOW=900000  # 15 minutos
PASSWORD_CHANGE_RATE_LIMIT_MAX=10         # 10 intentos
```

## Templates de Email

Los templates están ubicados en `server/templates/emails/`:

- `password-reset.hbs` - Email de recuperación de contraseña
- `password-changed.hbs` - Email de confirmación de cambio

### Personalización de Templates

Los templates usan Handlebars y soportan las siguientes variables:

```handlebars
{{userName}}          # Nombre completo del usuario
{{resetUrl}}          # URL de recuperación
{{expirationTime}}    # Tiempo de expiración
{{supportEmail}}      # Email de soporte
{{companyName}}       # Nombre de la empresa
{{currentYear}}       # Año actual
{{changeDate}}        # Fecha de cambio (solo para confirmación)
```

## Instalación de Dependencias

```bash
cd server
npm install nodemailer handlebars express-rate-limit
```

## Verificación de Configuración

El sistema verifica automáticamente la configuración al iniciar:

```bash
npm run dev
```

Busca en los logs:
- ✅ Servicio de email configurado y listo
- ⚠️ Servicio de email no configurado - usando modo desarrollo

## Pruebas

### Modo Desarrollo
En desarrollo, el sistema muestra el token de recuperación en la consola:

```
Token de recuperación para test@example.com: eyJhbGciOiJIUzI1NiIs...
URL de recuperación: http://localhost:3000/reset-password?token=eyJhbGciOiJIUzI1NiIs...
```

### Modo Producción
En producción, solo se envía el email sin mostrar información sensible.

## Solución de Problemas

### Error: "Authentication failed"
- Verifica que el EMAIL_PASSWORD sea una App Password (no tu contraseña regular)
- Asegúrate de que 2FA esté habilitado en Gmail

### Error: "Connection timeout"
- Verifica la configuración de firewall
- Confirma que el puerto SMTP esté abierto

### Error: "Rate limit exceeded"
- Normal, el sistema está protegiendo contra spam
- Espera el tiempo indicado antes de intentar nuevamente

### Email no llega
- Verifica la carpeta de spam
- Confirma que el dominio/email esté verificado (SendGrid/AWS SES)
- Revisa los logs del servidor para errores

## Ejemplo de Configuración Completa

```env
# Configuración del Servidor
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/medidor
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# URLs
FRONTEND_URL=https://tu-dominio.com
CLIENT_URL=https://tu-dominio.com

# Email - SendGrid para producción
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.tu-api-key-aqui
EMAIL_FROM=noreply@tu-dominio.com
EMAIL_FROM_NAME=Sistema de Seguimiento de Docentes

# Información de la empresa
COMPANY_NAME=Sistema de Seguimiento de Docentes
SUPPORT_EMAIL=soporte@tu-dominio.com
```

¡La configuración está lista para usar! 🎉
