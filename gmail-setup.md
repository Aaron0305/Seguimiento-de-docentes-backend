# 📧 Configuración de Gmail para Envío de Emails

## Pasos para configurar Gmail:

### 1. Habilitar verificación en 2 pasos
- Ve a https://myaccount.google.com/
- Selecciona **Seguridad**
- Activa la **Verificación en 2 pasos**

### 2. Generar contraseña de aplicación
- En la misma página de seguridad
- Busca **Contraseñas de aplicaciones**
- Selecciona **Aplicación personalizada**
- Nombra la aplicación: "Sistema Seguimiento Docentes"
- **Guarda la contraseña de 16 caracteres**

### 3. Actualizar archivo .env
Reemplaza estos valores en tu archivo `.env`:

```bash
# Gmail Configuration
GMAIL_USER=tu-email@gmail.com
GMAIL_PASS=contraseña-de-16-caracteres-sin-espacios
```

### 4. Reiniciar el servidor
```bash
npm start
```

## ⚠️ Importante:
- Usa la **contraseña de aplicación**, NO tu contraseña normal de Gmail
- La contraseña de aplicación son 16 caracteres sin espacios
- Asegúrate de que la verificación en 2 pasos esté activada

## ✅ Verificación:
Si todo está bien configurado, verás en los logs del servidor:
```
✅ Transportador Gmail configurado correctamente
✅ Servicio de email configurado y listo
```
