# VegBazar

**VegBazar** is a modern online vegetable marketplace web application built with **React** and **Vite**. It provides users with a clean, fast, and responsive shopping experience to browse and purchase fresh vegetables and online.

🌐 **Live at:** [Check Out Vegbazar](https://vegbazar.store)

---

## ✨ Features

- 🛒 Browse a wide variety of fresh vegetables items
- 🔍 Search and filter products with ease
- 🛍️ Add items to cart and manage quantities
- 💳 Smooth checkout experience
- 📱 Fully responsive design — works on mobile, tablet & desktop
- ⚡ Blazing fast performance powered by Vite
- 🎨 Clean and modern UI with custom fonts

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [React](https://react.dev/) | Frontend UI library |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| JavaScript (ES6+) | Core language |
| HTML5 & CSS3 | Markup & styling |
| [ESLint](https://eslint.org/) | Code linting |
| Docker, Docker Compose, GitHub Actions, GHCR, Nginx | Production deployment |

---

## 📁 Project Structure

```
VegBazar/
├── Font/                # Custom font files
├── public/              # Static public assets (images, icons, etc.)
├── src/                 # Main source code
│   ├── components/      # Reusable React components
│   ├── pages/           # Page-level components
│   ├── assets/          # Images and other media
│   └── App.jsx          # Root app component
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint configuration
├── netlify.toml         # Netlify deployment settings
├── package.json         # Project dependencies & scripts
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/codax69/VegBazar.git
   cd VegBazar
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## 🌐 Deployment

Production deployment uses separate frontend and backend images in GHCR, deployed to an Ubuntu VPS with Docker Compose and host-level Nginx. Each repository has its own CI/CD workflow. See [DEPLOYMENT.md](./DEPLOYMENT.md) for VPS setup, secrets, environment variables, HTTPS, health checks, and rollback instructions.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project does not currently specify a license. Please contact the author for usage permissions.

---

## 👤 Author

**codax69**  
🔗 [GitHub Profile](https://github.com/codax69)

---

> *Fresh picks, delivered fast — VegBazar brings the bazaar to your browser.* 🌿