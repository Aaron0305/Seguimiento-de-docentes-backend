# 📧 Configuración de Outlook para Envío de Emails

## Pasos para configurar Outlook/Hotmail:

### 1. Habilitar "Aplicaciones menos seguras" (si es necesario)
- Ve a https://account.microsoft.com/security/
- Busca **Opciones de seguridad adicionales**
- Si aparece, habilita el acceso para aplicaciones menos seguras

### 2. Verificación en dos pasos (Recomendado)
- Ve a https://account.microsoft.com/security/
- Habilita la **Verificación en dos pasos**
- Genera una **contraseña de aplicación** específica

### 3. Actualizar archivo .env
Reemplaza estos valores en tu archivo `.env`:

```bash
# Outlook Configuration
EMAIL_USER=tu-email@outlook.com
EMAIL_PASSWORD=tu-contraseña-o-app-password
EMAIL_FROM=tu-email@outlook.com
```

### 4. Emails compatibles:
- `@outlook.com`
- `@hotmail.com`
- `@live.com`
- `@msn.com`

### 5. Reiniciar el servidor
```bash
npm start
```

## ⚠️ Importante:
- Si tienes verificación en dos pasos, usa una **contraseña de aplicación**
- Si no tienes verificación en dos pasos, usa tu **contraseña normal**
- Asegúrate de que tu cuenta permita el acceso SMTP

## ✅ Verificación:
Si todo está bien configurado, verás en los logs del servidor:
```
✅ Transportador Outlook configurado correctamente
✅ Servicio de email configurado y listo
```

## 🔧 Alternativa SMTP manual:
Si hay problemas, puedes usar configuración SMTP manual:
```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASSWORD=tu-contraseña
```
