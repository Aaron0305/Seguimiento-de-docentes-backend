;---------------------------------------------------------
; Práctica: Operaciones básicas sobre archivos de disco
; Lenguaje: MASM (Microsoft Macro Assembler)
; Versión: 6.11 con Buffer de Video Directo
; Mejoras: Colores aplicados directamente al buffer de video
;---------------------------------------------------------
.model small

.stack 100h  ; Aumentamos el tamaño del stack para mayor seguridad

.data
    ; Constantes del sistema
    MAX_FILENAME_LEN equ 30
    MAX_BUFFER_LEN  equ 100
    
    ; Variables para archivos
    nombreBuffer    db MAX_FILENAME_LEN, ?, MAX_FILENAME_LEN dup(0)
    nombreArchivo   db MAX_FILENAME_LEN dup(0)
    manejadorArchivo dw ?
    bufferEntrada   db MAX_BUFFER_LEN, ?, MAX_BUFFER_LEN dup('$')
    bufferLectura   db MAX_BUFFER_LEN dup('$')
    
    ; Variables para buffer de video
    VIDEO_SEGMENT   equ 0B800h
    SCREEN_WIDTH    equ 80
    SCREEN_HEIGHT   equ 25
    
    ; Colores definidos según el PDF
    COLOR_NEGRO     equ 00h
    COLOR_AZUL      equ 01h
    COLOR_VERDE     equ 02h
    COLOR_CIAN      equ 03h
    COLOR_ROJO      equ 04h
    COLOR_MAGENTA   equ 05h
    COLOR_MARRON    equ 06h
    COLOR_GRIS      equ 07h
    COLOR_GRIS_OSC  equ 08h
    COLOR_AZUL_CL   equ 09h
    COLOR_VERDE_CL  equ 0Ah
    COLOR_CIAN_CL   equ 0Bh
    COLOR_ROJO_CL   equ 0Ch
    COLOR_MAGENTA_CL equ 0Dh
    COLOR_AMARILLO  equ 0Eh
    COLOR_BLANCO    equ 0Fh
    
    ; Atributos combinados (fondo << 4 | texto)
    ATTR_TITULO     equ 1Fh  ; Blanco sobre azul
    ATTR_MENU       equ 2Eh  ; Amarillo sobre verde
    ATTR_NORMAL     equ 07h  ; Gris sobre negro
    ATTR_INPUT      equ 4Eh  ; Amarillo sobre rojo
    ATTR_ERROR      equ 4Fh  ; Blanco sobre rojo
    ATTR_EXITO      equ 2Fh  ; Blanco sobre verde
    ATTR_MARCO      equ 5Fh  ; Blanco sobre magenta
    
    ; Mensajes del sistema
    msgInicio      db '===============================================================================', 13, 10
                   db '                        PROGRAMA DE MANEJO DE ARCHIVOS                       ', 13, 10
                   db '                             Version 6.11 GUI                               ', 13, 10
                   db '===============================================================================', 13, 10, '$'
    
    msgNombre      db 13, 10, 'Ingrese nombre para el archivo (sin .txt): ', '$'
    msgEscribir    db 13, 10, 'Escribe texto para guardar:', 13, 10, '> ', '$'
    msgCreado      db 13, 10, 'Archivo creado con exito!', 13, 10, '$'
    msgError       db 13, 10, 'Error en la operacion!', 13, 10, '$'
    
    ; Menú principal
    msgMenuPrinc   db 13, 10, 13, 10
                   db '        ============================================================', 13, 10
                   db '                            MENU PRINCIPAL                         ', 13, 10
                   db '        ============================================================', 13, 10
                   db '                                                                    ', 13, 10
                   db '            [1] >> Crear nuevo archivo                             ', 13, 10
                   db '                                                                    ', 13, 10
                   db '            [2] >> Editar archivo existente                        ', 13, 10
                   db '                                                                    ', 13, 10
                   db '            [3] >> Ver archivos disponibles                        ', 13, 10
                   db '                                                                    ', 13, 10
                   db '            [4] >> Salir del programa                              ', 13, 10
                   db '                                                                    ', 13, 10
                   db '            [5] >> Borrar archivo                                  ', 13, 10
                   db '                                                                    ', 13, 10
                   db '        ============================================================', 13, 10
                   db '                          Seleccione opcion: ', '$'
    
    msgContenido   db 13, 10, 'Contenido actual:', 13, 10, '$'
    msgModificar   db 13, 10, 'Nuevo contenido:', 13, 10, '> ', '$'
    saltoLinea     db 13, 10, '$'
    
    ; Variables para búsqueda de archivos
    DTA         db 43 dup(0)
    archivosEncontrados db 0
    patronBusqueda db "*.txt", 0
    
    msgListaArchivos db 13, 10, '==============================================================', 13, 10
                     db '                   ARCHIVOS DISPONIBLES                      ', 13, 10
                     db '==============================================================', 13, 10, '$'
    
    msgSelArchivo   db 13, 10, 'Seleccione numero de archivo: ', '$'
    msgNoArchivos   db '              No hay archivos .txt disponibles               ', 13, 10
                    db '==============================================================', 13, 10, '$'
    
    msgListado    db 13, 10, '==============================================================', 13, 10
                  db '                  ARCHIVOS TXT DISPONIBLES                   ', 13, 10
                  db '==============================================================', 13, 10, '$'
    
    msgCantidad   db '==============================================================', 13, 10
                  db ' Total de archivos encontrados: ', '$'
    
    msgRegresar   db 13, 10, '==============================================================', 13, 10
                  db '        Presione cualquier tecla para regresar...', '$'
    
    contador      db 0
    rutaBusqueda  db '*.txt', 0
    DTA_actual    db 43 dup(0)
    
    msgVerSel     db 13, 10, 'Seleccione el archivo que desea visualizar: ', '$'
    msgVerCont    db 13, 10, '==============================================================', 13, 10
                  db '                  CONTENIDO DEL ARCHIVO                      ', 13, 10
                  db '==============================================================', 13, 10, '$'
      msgBorrarArchivo db 13, 10, 'Seleccione el archivo que desea borrar: ', '$'
    msgBorradoOk     db 13, 10, 'Archivo borrado exitosamente.', 13, 10, '$'
    msgBorradoFail   db 13, 10, 'No se pudo borrar el archivo.', 13, 10, '$'
    
    ; Mensajes de error del sistema
    ERROR_NO_EXISTE     equ 02h
    ERROR_ACCESO_DENEGADO equ 05h
    ERROR_YA_EXISTE     equ 50h
    
    msgErrorNoExiste    db 'Error: El archivo no existe', 13, 10, '$'
    msgErrorAcceso      db 'Error: Acceso denegado', 13, 10, '$'
    msgExisteArchivo    db 'Error: El archivo ya existe', 13, 10, '$'
    msgErrorAccesoDenegado db 'Error: No se puede acceder al archivo', 13, 10, '$'
    
    ; Separadores y elementos gráficos
    separador     db '==============================================================', 13, 10, '$'
    cierreMarco   db '==============================================================', 13, 10, '$'
    lineaArchivo  db ' ', '$'
    finLineaArch  db ' ', 13, 10, '$'

    ; Macros útiles
    PRINT_CHAR MACRO char
        push ax
        push dx
        mov ah, 02h
        mov dl, char
        int 21h
        pop dx
        pop ax
    ENDM

    PRINT_STRING MACRO string
        push ax
        push dx
        mov ah, 09h
        lea dx, string
        int 21h
        pop dx
        pop ax
    ENDM

    CHECK_ERROR MACRO
        jnc @@no_error
        push ax
        call MOSTRAR_ERROR
        pop ax
        stc
        @@no_error:
    ENDM

.code
main proc
    ; Inicialización
    mov ax, @data
    mov ds, ax
    mov es, ax
    
    ; Limpiar pantalla con fondo azul
    call LIMPIAR_PANTALLA_COLOR
    
    ; Mostrar título con colores
    call ESCRIBIR_TITULO
    
    ; Pedir nombre del archivo
    mov dx, offset msgNombre
    call ESCRIBIR_TEXTO_COLOR
    
    mov ah, 0Ah
    lea dx, nombreBuffer
    int 21h
    
    ; Procesar nombre
    call PROCESAR_NOMBRE
    
    ; Crear y escribir archivo inicial
    call CREAR_ARCHIVO
    jc ERROR_SALIR
    call ESCRIBIR_ARCHIVO
    jc ERROR_SALIR
    call CERRAR_ARCHIVO

MENU:
    ; Limpiar pantalla y mostrar menú principal
    call LIMPIAR_PANTALLA_COLOR
    call ESCRIBIR_TITULO
    call ESCRIBIR_MENU
    
    ; Leer opción
    mov ah, 01h
    int 21h
    
    cmp al, '1'
    je CREAR_NUEVO
    cmp al, '2'
    je EDITAR_EXISTENTE
    cmp al, '3'
    je VER_ARCHIVOS
    cmp al, '4'
    je SALIR
    cmp al, '5'
    je BORRAR_ARCHIVO
    jmp MENU

CREAR_NUEVO:
    call LIMPIAR_PANTALLA_COLOR
    call ESCRIBIR_TITULO
    
    ; Pedir nombre del archivo
    mov dx, offset msgNombre
    call ESCRIBIR_TEXTO_COLOR

    mov ah, 0Ah
    lea dx, nombreBuffer
    int 21h

    ; Procesar nombre
    call PROCESAR_NOMBRE

    ; Verificar si ya existe el archivo
    mov ah, 43h
    mov al, 00h
    lea dx, nombreArchivo
    int 21h
    jnc ARCHIVO_YA_EXISTE

    ; Crear y escribir archivo inicial
    call CREAR_ARCHIVO
    jc ERROR_SALIR
    call ESCRIBIR_ARCHIVO
    jc ERROR_SALIR    
    call CERRAR_ARCHIVO
    call PAUSA
    jmp MENU

ARCHIVO_YA_EXISTE:
    mov dx, offset msgExisteArchivo
    call ESCRIBIR_TEXTO_COLOR
    call PAUSA
    jmp MENU

EDITAR_EXISTENTE:
    call LIMPIAR_PANTALLA_COLOR
    call ESCRIBIR_TITULO
    call LISTAR_ARCHIVOS
    jc MENU_CON_PAUSA
    call SELECCIONAR_ARCHIVO_EDITAR
    call PAUSA
    jmp MENU

VER_ARCHIVOS:
    call LIMPIAR_PANTALLA_COLOR
    call ESCRIBIR_TITULO
    call LISTAR_ARCHIVOS
    jc MENU_CON_PAUSA
    call SELECCIONAR_ARCHIVO_VER
    call PAUSA
    jmp MENU

BORRAR_ARCHIVO:
    call LIMPIAR_PANTALLA_COLOR
    call ESCRIBIR_TITULO
    call LISTAR_ARCHIVOS
    jc MENU_CON_PAUSA
    call SELECCIONAR_ARCHIVO_BORRAR
    call PAUSA
    jmp MENU

MENU_CON_PAUSA:
    call PAUSA
    jmp MENU

ERROR_SALIR:
    mov dx, offset msgError
    call ESCRIBIR_TEXTO_COLOR
    call PAUSA
    
SALIR:
    call LIMPIAR_PANTALLA_COLOR
    call ESCRIBIR_TITULO
    mov ah, 4Ch
    int 21h
main endp

;-----------------------------------------------------
; Rutinas de manejo directo del buffer de video
;-----------------------------------------------------

;-----------------------------------------------------
; Procedimiento mejorado para mostrar errores
MOSTRAR_ERROR PROC
    push ax
    push dx
    
    cmp ax, ERROR_NO_EXISTE
    je @@archivo_no_existe
    cmp ax, ERROR_ACCESO_DENEGADO
    je @@acceso_denegado
    cmp ax, ERROR_YA_EXISTE
    je @@archivo_existe
    jmp @@error_generico

@@archivo_no_existe:
    lea dx, msgErrorNoExiste
    jmp @@mostrar
@@acceso_denegado:
    lea dx, msgErrorAcceso
    jmp @@mostrar
@@archivo_existe:
    lea dx, msgExisteArchivo
    jmp @@mostrar
@@error_generico:
    lea dx, msgError
@@mostrar:
    call ESCRIBIR_TEXTO_COLOR
    pop dx
    pop ax
    ret
MOSTRAR_ERROR ENDP

;-----------------------------------------------------
; LIMPIAR_PANTALLA_COLOR
; Limpia toda la pantalla con un color de fondo
;-----------------------------------------------------
LIMPIAR_PANTALLA_COLOR PROC
    push ax
    push bx
    push cx
    push dx
    push di
    push es

    mov ax, VIDEO_SEGMENT
    mov es, ax
    xor di, di
    mov ah, ATTR_NORMAL
    mov al, ' '
    mov cx, SCREEN_WIDTH * SCREEN_HEIGHT
    rep stosw

    pop es
    pop di
    pop dx
    pop cx
    pop bx
    pop ax
    ret
LIMPIAR_PANTALLA_COLOR ENDP

;-----------------------------------------------------
; ESCRIBIR_CARACTER_COLOR
; Escribe un carácter en una posición específica con color
; Entrada: AL = carácter, AH = atributo, DL = columna, DH = fila
;-----------------------------------------------------
ESCRIBIR_CARACTER_COLOR proc
    push ax
    push bx
    push cx
    push dx
    push di
    push es
    
    ; Calcular offset: (fila * 80 + columna) * 2
    mov cl, dl          ; Guardar columna
    mov al, dh          ; AL = fila
    mov bl, 80
    mul bl              ; AX = fila * 80
    mov bl, cl          ; BL = columna
    mov bh, 0
    add ax, bx          ; AX = fila * 80 + columna
    shl ax, 1           ; AX = (fila * 80 + columna) * 2
    mov di, ax
    
    ; Establecer segmento de video
    mov ax, VIDEO_SEGMENT
    mov es, ax
    
    ; Escribir carácter y atributo
    pop ax              ; Recuperar carácter y atributo
    push ax
    stosw               ; Almacena AX en ES:DI
    
    pop es
    pop di
    pop dx
    pop cx
    pop bx
    pop ax
    ret
ESCRIBIR_CARACTER_COLOR endp

;-----------------------------------------------------
; ESCRIBIR_CADENA_EN_POSICION
; Escribe una cadena en una posición específica con color
; Entrada: SI = puntero a cadena, AH = atributo, DL = columna, DH = fila
;-----------------------------------------------------
ESCRIBIR_CADENA_EN_POSICION proc
    push ax
    push bx
    push cx
    push dx
    push di
    push si
    push es
    
    ; Calcular offset inicial
    mov al, dh          ; AL = fila
    mov bl, 80
    mul bl              ; AX = fila * 80
    mov bl, dl          ; BL = columna
    mov bh, 0
    add ax, bx          ; AX = fila * 80 + columna
    shl ax, 1           ; AX = (fila * 80 + columna) * 2
    mov di, ax
    
    ; Establecer segmento de video
    mov ax, VIDEO_SEGMENT
    mov es, ax
    
    ; Obtener atributo
    pop ax              ; Recuperar registros para obtener atributo
    push ax
    mov bl, ah          ; BL = atributo
    
ESCRIBIR_CADENA_LOOP:
    lodsb               ; Cargar carácter de DS:SI en AL
    cmp al, '$'         ; ¿Fin de cadena?
    je FIN_ESCRIBIR_CADENA
    cmp al, 13          ; ¿Retorno de carro?
    je SIGUIENTE_LINEA
    cmp al, 10          ; ¿Nueva línea?
    je CONTINUAR_ESCRIBIR
    
    ; Escribir carácter con atributo
    mov ah, bl          ; AH = atributo
    stosw               ; Almacena AX en ES:DI e incrementa DI
    jmp ESCRIBIR_CADENA_LOOP

SIGUIENTE_LINEA:
    ; Calcular inicio de siguiente línea
    mov ax, di
    shr ax, 1           ; Convertir offset de bytes a caracteres
    mov dx, 80
    div dl              ; AL = fila actual, AH = columna actual
    inc al              ; Siguiente fila
    mov ah, 0           ; Columna 0
    mov bl, 80
    mul bl              ; AX = nueva_fila * 80
    shl ax, 1           ; Convertir a offset de bytes
    mov di, ax
    jmp ESCRIBIR_CADENA_LOOP

CONTINUAR_ESCRIBIR:
    jmp ESCRIBIR_CADENA_LOOP

FIN_ESCRIBIR_CADENA:
    pop es
    pop si
    pop di
    pop dx
    pop cx
    pop bx
    pop ax
    ret
ESCRIBIR_CADENA_EN_POSICION endp

;-----------------------------------------------------
; ESCRIBIR_TITULO
; Escribe el título del programa con colores especiales
;-----------------------------------------------------
ESCRIBIR_TITULO proc
    push ax
    push dx
    push si
    
    mov si, offset msgInicio
    mov ah, ATTR_TITULO     ; Blanco sobre azul
    mov dl, 0               ; Columna 0
    mov dh, 0               ; Fila 0
    call ESCRIBIR_CADENA_EN_POSICION
    
    pop si
    pop dx
    pop ax
    ret
ESCRIBIR_TITULO endp

;-----------------------------------------------------
; ESCRIBIR_MENU
; Escribe el menú principal con colores
;-----------------------------------------------------
ESCRIBIR_MENU proc
    push ax
    push dx
    push si
    
    mov si, offset msgMenuPrinc
    mov ah, ATTR_MENU       ; Amarillo sobre verde
    mov dl, 0               ; Columna 0
    mov dh, 5               ; Fila 5
    call ESCRIBIR_CADENA_EN_POSICION
    
    pop si
    pop dx
    pop ax
    ret
ESCRIBIR_MENU endp

;-----------------------------------------------------
; ESCRIBIR_TEXTO_COLOR
; Escribe texto con color específico usando INT 21h
; Entrada: DX = puntero al texto, BL = atributo
;-----------------------------------------------------
ESCRIBIR_TEXTO_COLOR proc
    push ax
    push bx
    
    ; Cambiar atributo de color usando BIOS
    mov ah, 09h
    mov cx, 1
    int 10h
    
    ; Escribir texto usando DOS
    mov ah, 09h
    int 21h
    
    pop bx
    pop ax
    ret
ESCRIBIR_TEXTO_COLOR endp

;-----------------------------------------------------
; PAUSA
; Pausa hasta que se presione una tecla
;-----------------------------------------------------
PAUSA proc
    push ax
    push dx
    push si
    
    mov si, offset msgRegresar
    mov ah, ATTR_NORMAL
    mov dl, 0
    mov dh, 23
    call ESCRIBIR_CADENA_EN_POSICION
    
    mov ah, 01h
    int 21h
    
    pop si
    pop dx
    pop ax
    ret
PAUSA endp

;-----------------------------------------------------
; Rutinas de archivo (mantienen funcionalidad original)
;-----------------------------------------------------
CREAR_ARCHIVO proc
    ; Mostrar mensaje con color de éxito
    mov si, offset msgCreado
    mov ah, ATTR_EXITO
    mov dl, 0
    mov dh, 20
    call ESCRIBIR_CADENA_EN_POSICION
    
    ; Crear archivo
    mov ah, 3Ch
    mov cx, 0
    lea dx, nombreArchivo
    int 21h
    jc FIN_CREAR
    
    mov manejadorArchivo, ax
    clc
    
FIN_CREAR:
    ret
CREAR_ARCHIVO endp

ESCRIBIR_ARCHIVO proc
    ; Mostrar mensaje para usuario con color normal
    mov si, offset msgEscribir
    mov ah, ATTR_INPUT
    mov dl, 0
    mov dh, 15
    call ESCRIBIR_CADENA_EN_POSICION
    
    ; Capturar entrada desde teclado
    mov ah, 0Ah
    lea dx, bufferEntrada
    int 21h
    
    ; Escribir en archivo
    mov ah, 40h
    mov bx, manejadorArchivo
    mov si, offset bufferEntrada + 1
    mov cl, [si]
    mov ch, 0
    mov dx, offset bufferEntrada + 2
    int 21h
    jc FIN_ESCRIBIR
    
    clc
    
FIN_ESCRIBIR:
    ret
ESCRIBIR_ARCHIVO endp

LEER_ARCHIVO proc
    ; Abrir archivo en modo lectura
    mov ah, 3Dh
    mov al, 0
    lea dx, nombreArchivo
    int 21h
    jc FIN_LEER
    
    mov manejadorArchivo, ax
    
    ; Mostrar mensaje con marco colorido
    mov si, offset msgVerCont
    mov ah, ATTR_MARCO
    mov dl, 0
    mov dh, 10
    call ESCRIBIR_CADENA_EN_POSICION
    
    ; Leer archivo
    mov ah, 3Fh
    mov bx, manejadorArchivo
    lea dx, bufferLectura
    mov cx, 99
    int 21h
    jc FIN_LEER
    
    ; Añadir terminador de cadena
    mov si, offset bufferLectura
    add si, ax
    mov byte ptr [si], '$'
    
    ; Mostrar contenido con color normal
    mov si, offset bufferLectura
    mov ah, ATTR_NORMAL
    mov dl, 0
    mov dh, 13
    call ESCRIBIR_CADENA_EN_POSICION
    
    clc
    
FIN_LEER:
    ret
LEER_ARCHIVO endp

CERRAR_ARCHIVO proc
    mov ah, 3Eh
    mov bx, manejadorArchivo
    int 21h
    ret
CERRAR_ARCHIVO endp

PROCESAR_NOMBRE proc
    mov si, offset nombreBuffer + 1
    mov cl, [si]
    mov ch, 0
    mov si, offset nombreBuffer + 2
    mov di, offset nombreArchivo
    rep movsb
    mov byte ptr [di], '.'
    mov byte ptr [di+1], 't'
    mov byte ptr [di+2], 'x'
    mov byte ptr [di+3], 't'
    mov byte ptr [di+4], 0
    ret
PROCESAR_NOMBRE endp

MODIFICAR_ARCHIVO proc
    call LEER_ARCHIVO
    jc FIN_MOD
    
    mov si, offset msgModificar
    mov ah, ATTR_INPUT
    mov dl, 0
    mov dh, 16
    call ESCRIBIR_CADENA_EN_POSICION
    
    mov ah, 3Ch
    mov cx, 0
    lea dx, nombreArchivo
    int 21h
    jc FIN_MOD
    
    mov manejadorArchivo, ax
    call ESCRIBIR_ARCHIVO
    
FIN_MOD:
    call CERRAR_ARCHIVO
    ret
MODIFICAR_ARCHIVO endp

LISTAR_ARCHIVOS proc
    mov ah, 1Ah
    lea dx, DTA_actual
    int 21h
    mov contador, 0
    mov ah, 4Eh
    lea dx, rutaBusqueda
    xor cx, cx
    int 21h
    jc NO_HAY_ARCHIVOS_LISTA
    
    ; Mostrar título de lista con color especial
    mov si, offset msgListaArchivos
    mov ah, ATTR_TITULO
    mov dl, 0
    mov dh, 6
    call ESCRIBIR_CADENA_EN_POSICION
    
    mov dh, 9  ; Empezar listado en fila 9
    
MOSTRAR_ARCHIVO_LISTA:
    inc contador
    
    ; Escribir número de archivo con color de menú
    mov al, contador
    add al, '0'
    mov ah, ATTR_MENU
    mov dl, 5
    call ESCRIBIR_CARACTER_COLOR
    
    ; Escribir ')' y espacio
    mov al, ')'
    mov dl, 6
    call ESCRIBIR_CARACTER_COLOR
    
    mov al, ' '
    mov dl, 7
    call ESCRIBIR_CARACTER_COLOR
    
    ; Escribir nombre del archivo con color normal
    mov si, offset DTA_actual + 1Eh
    mov ah, ATTR_NORMAL
    mov dl, 8
    call ESCRIBIR_CADENA_EN_POSICION
    
    inc dh  ; Siguiente fila
    
    mov ah, 4Fh
    int 21h
    jnc MOSTRAR_ARCHIVO_LISTA
    
    clc
    ret
    
NO_HAY_ARCHIVOS_LISTA:
    mov si, offset msgNoArchivos
    mov ah, ATTR_ERROR
    mov dl, 0
    mov dh, 8
    call ESCRIBIR_CADENA_EN_POSICION
    stc
    ret
LISTAR_ARCHIVOS endp

SELECCIONAR_ARCHIVO_EDITAR proc
    mov si, offset msgSelArchivo
    mov ah, ATTR_INPUT
    mov dl, 0
    mov dh, 18
    call ESCRIBIR_CADENA_EN_POSICION
    
    mov ah, 01h
    int 21h
    sub al, '1'
    mov bl, al
    mov ah, 1Ah
    lea dx, DTA_actual
    int 21h
    mov ah, 4Eh
    lea dx, rutaBusqueda
    xor cx, cx
    int 21h
    jc FIN_SEL_EDIT
BUSCAR_SEL_EDIT:
    or bl, bl
    jz ENCONTRADO_SEL_EDIT
    dec bl
    mov ah, 4Fh
    int 21h
    jnc BUSCAR_SEL_EDIT
    jmp FIN_SEL_EDIT
ENCONTRADO_SEL_EDIT:
    lea si, [DTA_actual + 1Eh]
    lea di, nombreArchivo
    mov cx, 13
COPIAR_SEL_EDIT:
    mov al, [si]
    mov [di], al
    inc si
    inc di
    or al, al
    loopnz COPIAR_SEL_EDIT
    call MODIFICAR_ARCHIVO
FIN_SEL_EDIT:
    ret
SELECCIONAR_ARCHIVO_EDITAR endp

SELECCIONAR_ARCHIVO_VER proc
    mov si, offset msgVerSel
    mov ah, ATTR_INPUT
    mov dl, 0
    mov dh, 18
    call ESCRIBIR_CADENA_EN_POSICION
    
    mov ah, 01h
    int 21h
    sub al, '1'
    mov bl, al
    mov ah, 1Ah
    lea dx, DTA_actual
    int 21h
    mov ah, 4Eh
    lea dx, rutaBusqueda
    xor cx, cx
    int 21h
    jc FIN_SEL_VER
BUSCAR_SEL_VER:
    or bl, bl
    jz ENCONTRADO_SEL_VER
    dec bl
    mov ah, 4Fh
    int 21h
    jnc BUSCAR_SEL_VER
    jmp FIN_SEL_VER
ENCONTRADO_SEL_VER:
    lea si, [DTA_actual + 1Eh]
    lea di, nombreArchivo
    mov cx, 13
COPIAR_SEL_VER:
    mov al, [si]
    mov [di], al
    inc si
    inc di
    or al, al
    loopnz COPIAR_SEL_VER
    call LEER_ARCHIVO
FIN_SEL_VER:
    ret
SELECCIONAR_ARCHIVO_VER endp

SELECCIONAR_ARCHIVO_BORRAR proc
    push ax
    push bx
    push cx
    push dx
    push si
    push di

    mov si, offset msgBorrarArchivo
    mov ah, ATTR_INPUT
    mov dl, 0
    mov dh, 18
    call ESCRIBIR_CADENA_EN_POSICION
    
    mov ah, 01h
    int 21h
    sub al, '0'
    cmp al, 9
    ja BORRADO_FAIL
    mov bl, al

    mov ah, 1Ah
    lea dx, DTA_actual
    int 21h
    
    mov ah, 4Eh
    xor cx, cx
    lea dx, rutaBusqueda
    int 21h
    jc BORRADO_FAIL

    or bl, bl
    jz ENCONTRADO_SEL_BORRAR
BUSCAR_SEL_BORRAR:
    dec bl
    mov ah, 4Fh
    int 21h
    jc BORRADO_FAIL
    or bl, bl
    jnz BUSCAR_SEL_BORRAR

ENCONTRADO_SEL_BORRAR:
    mov si, offset DTA_actual + 1Eh
    mov di, offset nombreArchivo
    mov cx, 12
COPIAR_SEL_BORRAR:
    mov al, [si]
    mov [di], al
    inc si
    inc di
    test al, al
    loopnz COPIAR_SEL_BORRAR
    
    mov ah, 41h
    mov dx, offset nombreArchivo
    int 21h
    jc BORRADO_FAIL
    
    mov si, offset msgBorradoOk
    mov ah, ATTR_EXITO
    mov dl, 0
    mov dh, 20
    call ESCRIBIR_CADENA_EN_POSICION
    jmp FIN_SEL_BORRAR

BORRADO_FAIL:
    mov si, offset msgBorradoFail
    mov ah, ATTR_ERROR
    mov dl, 0
    mov dh, 20
    call ESCRIBIR_CADENA_EN_POSICION

FIN_SEL_BORRAR:
    pop di
    pop si
    pop dx
    pop cx
    pop bx
    pop ax
    ret
SELECCIONAR_ARCHIVO_BORRAR endp

end main  