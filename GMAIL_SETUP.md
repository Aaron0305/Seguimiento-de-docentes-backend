# Configuración de Gmail para Recuperación de Contraseña

## Pasos para configurar Gmail como proveedor de email

### 1. Preparar tu cuenta de Gmail

1. **Accede a tu cuenta de Gmail** que vas a usar para enviar los correos
2. **Activa la verificación en 2 pasos** (2FA) en tu cuenta de Google:
   - Ve a [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Busca "Verificación en 2 pasos" y actívala
   - Sigue las instrucciones para configurar SMS, app autenticadora, etc.

### 2. Generar contraseña de aplicación

1. **Ve a configuración de seguridad**:
   - [https://myaccount.google.com/security](https://myaccount.google.com/security)
   
2. **Busca "Contraseñas de aplicaciones"**:
   - Debe aparecer después de activar 2FA
   - Click en "Contraseñas de aplicaciones"
   
3. **Genera una nueva contraseña**:
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe: "Sistema Seguimiento Docentes"
   - Click en "Generar"
   
4. **Guarda la contraseña generada**:
   - Será una contraseña de 16 caracteres como: `abcd efgh ijkl mnop`
   - **IMPORTANTE**: Guarda esta contraseña, no la podrás ver después

### 3. Configurar el archivo .env

Edita el archivo `.env` y reemplaza los siguientes valores:

```env
# Configuración de Email - Gmail
EMAIL_PROVIDER=gmail
EMAIL_FROM=TU_EMAIL@gmail.com
EMAIL_FROM_NAME=Sistema de Seguimiento de Docentes - TESJO

# Gmail Configuration  
EMAIL_USER=TU_EMAIL@gmail.com
EMAIL_PASSWORD=TU_CONTRASEÑA_DE_APLICACION_DE_16_CARACTERES
```

**Ejemplo**:
```env
EMAIL_FROM=juan.perez@gmail.com
EMAIL_USER=juan.perez@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### 4. Probar la configuración

1. **Reinicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Prueba el flujo de recuperación**:
   - Ve a la página de login
   - Click en "¿Olvidaste tu contraseña?"
   - Ingresa un email registrado en el sistema
   - Verifica que llegue el correo a la bandeja de entrada

### 5. Solución de problemas

**Si no llega el correo**:
1. Verifica que la contraseña de aplicación sea correcta
2. Revisa la carpeta de spam
3. Verifica que el email esté registrado en el sistema
4. Revisa los logs del servidor en la consola

**Si aparece error de autenticación**:
1. Verifica que la verificación en 2 pasos esté activada
2. Regenera la contraseña de aplicación
3. Asegúrate de copiar la contraseña sin espacios extra

**Para más información**:
- [Configurar contraseñas de aplicaciones - Google](https://support.google.com/accounts/answer/185833)
- [Verificación en 2 pasos - Google](https://support.google.com/accounts/answer/185839)

## Configuración alternativa: Outlook/Office365

Si prefieres usar tu cuenta institucional de Outlook, revisa el archivo `OUTLOOK_SETUP.md` para instrucciones específicas.
