<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nexus Code v3 - Advanced Code Editor

Nexus Code v3 es un editor de código avanzado construido con React, TypeScript y Tailwind CSS. Este proyecto implementa funcionalidades similares a VS Code en un entorno web moderno y responsivo.

## ✨ Características Principales

### 🗂️ Sistema de Archivos Avanzado
- **Persistencia de datos**: Los archivos y cambios se guardan automáticamente en localStorage
- **Drag & Drop**: Arrastra y suelta archivos y carpetas para reorganizarlos
- **Validación de nombres**: Previene nombres de archivo inválidos
- **Duplicación**: Duplica archivos y carpetas con un clic
- **Operaciones múltiples**: Crear, renombrar, eliminar archivos y carpetas

### 🔍 Búsqueda y Reemplazo Potente
- **Búsqueda por nombre**: Encuentra archivos rápidamente
- **Búsqueda por contenido**: Busca texto dentro de los archivos
- **Expresiones regulares**: Soporte completo para búsquedas con regex
- **Reemplazo inteligente**: Reemplaza texto en archivos individuales o en todo el proyecto
- **Resaltado de resultados**: Visualiza las coincidencias encontradas

### 📝 Editor de Código Avanzado
- **Resaltado de sintaxis**: Soporte para múltiples lenguajes de programación
- **Autocompletado**: Sugerencias inteligentes mientras escribes
- **Multi-cursor**: Edita en múltiples ubicaciones simultáneamente
- **Code folding**: Oculta y muestra bloques de código
- **Navegación por líneas**: Atajos de teclado para edición eficiente
- **Sincronización de scroll**: Navegación fluida entre archivos

### 🎯 Control de Versiones (Git)
- **Estado de archivos**: Visualiza archivos modificados, añadidos y sin seguimiento
- **Staging**: Prepara archivos para commit
- **Diferencias**: Compara cambios entre versiones
- **Mensajes de commit**: Escribe y gestiona commits
- **Descartar cambios**: Revierte modificaciones no deseadas

### 🐛 Depuración Integrada
- **Sesiones de debug**: Ejecuta y pausa código
- **Breakpoints**: Establece puntos de parada
- **Variables**: Inspecciona el estado de las variables
- **Call stack**: Navega por la pila de llamadas
- **Consola de debug**: Salida detallada del proceso de depuración

### 🔌 Sistema de Extensiones
- **Catálogo de extensiones**: Explora extensiones disponibles
- **Instalación/desinstalación**: Gestiona extensiones fácilmente
- **Categorías**: Organiza extensiones por tipo
- **Búsqueda**: Encuentra extensiones específicas
- **Actualizaciones**: Mantén las extensiones al día

### 💻 Terminal Integrada
- **Comandos nativos**: ls, cd, pwd, cat, find, grep
- **Navegación por directorios**: Cambia entre carpetas del proyecto
- **Historial de comandos**: Accede a comandos anteriores
- **Autocompletado**: Sugerencias de comandos
- **Integración con archivos**: Los comandos interactúan con el sistema de archivos

### 🎨 Interfaz Moderna
- **Tema claro/oscuro**: Cambia entre temas según tu preferencia
- **Diseño responsivo**: Funciona en dispositivos de todos los tamaños
- **Accesibilidad**: Navegación por teclado y lectores de pantalla
- **Personalización**: Colores y estilos personalizables

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clona el repositorio
git clone <repository-url>
cd nexus-code-v3

# Instala las dependencias
npm install

# Ejecuta en modo desarrollo
npm run dev

# Construye para producción
npm run build
```

### Uso Básico
1. **Abrir archivos**: Haz clic en archivos en el explorador para editarlos
2. **Crear archivos**: Usa el botón "+" o clic derecho → "New File"
3. **Guardar cambios**: Ctrl+S (Cmd+S en Mac) o el archivo se guarda automáticamente
4. **Buscar**: Ctrl+Shift+F para abrir la búsqueda global
5. **Terminal**: Ctrl+` para abrir/cerrar la terminal integrada

### Atajos de Teclado
- `Ctrl+S`: Guardar archivo
- `Ctrl+Shift+P`: Paleta de comandos
- `Ctrl+Shift+F`: Búsqueda global
- `Ctrl+``: Terminal
- `Ctrl+D`: Duplicar línea
- `Ctrl+K`: Eliminar línea
- `Ctrl+L`: Seleccionar línea
- `Escape`: Cerrar menús/diálogos

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
nexus-code-v3/
├── components/          # Componentes React reutilizables
│   ├── CodeEditor.tsx   # Editor de código principal
│   ├── FileExplorer.tsx # Explorador de archivos
│   ├── SearchView.tsx   # Vista de búsqueda
│   ├── GitView.tsx      # Vista de control de versiones
│   ├── DebugView.tsx    # Vista de depuración
│   ├── ExtensionsView.tsx # Vista de extensiones
│   ├── icons.tsx        # Iconos SVG personalizados
│   └── Menus.tsx        # Menús contextuales
├── hooks/               # Hooks personalizados de React
│   ├── useFileSystem.ts # Lógica del sistema de archivos
│   ├── useTerminal.ts   # Lógica de la terminal
│   └── useOpenFiles.ts  # Gestión de archivos abiertos
├── types.ts             # Definiciones de tipos TypeScript
├── data.ts              # Datos iniciales y mock
├── App.tsx              # Componente principal de la aplicación
└── index.tsx            # Punto de entrada
```

### Hooks Personalizados
- **useFileSystem**: Maneja toda la lógica del sistema de archivos
- **useTerminal**: Gestiona la terminal integrada y comandos
- **useOpenFiles**: Controla archivos abiertos y navegación

### Componentes Principales
- **CodeEditor**: Editor de código con funcionalidades avanzadas
- **FileExplorer**: Explorador de archivos con drag & drop
- **SearchView**: Búsqueda y reemplazo de archivos
- **GitView**: Control de versiones y gestión de cambios
- **DebugView**: Herramientas de depuración
- **ExtensionsView**: Gestión de extensiones

## 🔧 Tecnologías Utilizadas

- **React 19**: Framework de interfaz de usuario
- **TypeScript**: Tipado estático para JavaScript
- **Tailwind CSS**: Framework de CSS utilitario
- **Vite**: Herramienta de construcción rápida
- **React Syntax Highlighter**: Resaltado de sintaxis
- **LocalStorage**: Persistencia de datos del lado del cliente

## 🎯 Funcionalidades Implementadas

### ✅ Completadas
- [x] Sistema de archivos con persistencia
- [x] Drag & drop de archivos y carpetas
- [x] Búsqueda avanzada por nombre y contenido
- [x] Reemplazo de texto con regex
- [x] Editor de código con autocompletado
- [x] Control de versiones (Git)
- [x] Terminal integrada funcional
- [x] Sistema de extensiones
- [x] Depuración integrada
- [x] Temas claro/oscuro
- [x] Validación de nombres de archivo
- [x] Duplicación de archivos
- [x] Navegación por pestañas
- [x] Menús contextuales
- [x] Paleta de comandos

### 🚧 En Desarrollo
- [ ] Integración con Git real
- [ ] Extensiones ejecutables
- [ ] Debugger real para JavaScript/TypeScript
- [ ] Colaboración en tiempo real
- [ ] Sincronización con servicios en la nube

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Inspirado en Visual Studio Code
- Iconos de Lucide y Feather Icons
- Comunidad de React y TypeScript
- Contribuidores del proyecto

## 📞 Soporte

Si tienes preguntas o problemas:
- Abre un issue en GitHub
- Revisa la documentación
- Contacta al equipo de desarrollo

---

**Nexus Code v3** - Construyendo el futuro del desarrollo web, una línea de código a la vez. 🚀
