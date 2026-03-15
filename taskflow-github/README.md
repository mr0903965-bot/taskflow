# ✦ TaskFlow

App de gestión de tareas personal — construida con React + Vite.

## 🚀 Iniciar el proyecto

```bash
npm install
npm run dev
```

## 🏗️ Construir para producción

```bash
npm run build
npm run preview
```

## 📁 Estructura

```
taskflow-github/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── CalendarView.jsx
│   │   ├── DueBadge.jsx
│   │   ├── EditModal.jsx
│   │   ├── StatsView.jsx
│   │   ├── TaskForm.jsx
│   │   ├── TaskItem.jsx
│   │   └── Toast.jsx
│   ├── data/
│   │   ├── constants.js
│   │   └── languages.js
│   ├── hooks/
│   │   ├── useTasks.js
│   │   └── useToast.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## ✨ Funciones

- ✅ Tareas con prioridades, fechas límite y etiquetas
- ☑️ Subtareas con barra de progreso
- ✏️ Edición de tareas
- 📅 Vista de calendario
- 📊 Vista de estadísticas
- 🌍 6 idiomas (ES, EN, FR, DE, PT, JA)
- 🌙 Modo oscuro / claro
- 🔊 Sonidos con Web Audio API
- 🔔 Notificaciones del sistema
- 💾 Guardado automático en localStorage

## 🌐 Publicar gratis

### Netlify (sin cuenta)
1. Ejecuta `npm run build`
2. Arrastra la carpeta `dist/` a [netlify.com/drop](https://app.netlify.com/drop)

### GitHub Pages
1. Sube el proyecto a un repositorio en GitHub
2. Ve a **Settings → Pages → GitHub Actions**
3. Usa el workflow de Vite que GitHub sugiere automáticamente

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| React 18 | UI y lógica |
| Vite 5 | Bundler y dev server |
| Web Audio API | Sonidos generados en el navegador |
| localStorage | Persistencia de datos |
| Notifications API | Alertas del sistema |
| Google Fonts | Tipografías |

## 📄 Licencia

MIT — úsalo libremente.
