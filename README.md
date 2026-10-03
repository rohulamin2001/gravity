# 🖼️ PixelRename Studio

A fast, beautiful, and 100% private client-side image renaming and format conversion utility built with React and Vite.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)
![Security](https://img.shields.io/badge/Processing-100%25%20In--Browser-brightgreen.svg)

---

## ✨ Features

- 🔒 **100% Private & In-Browser**: Files never leave your device. All renaming, canvas format conversion, and zip archiving execute entirely client-side.
- ⚡ **Instant Drag-and-Drop**: Upload single or multiple images effortlessly via drag-and-drop or file picker (supports JPG, PNG, WebP, SVG, GIF, AVIF).
- ✏️ **Dedicated Filename Input**: View and edit the image name in a dedicated input box with a locked extension badge.
- 🚀 **Quick SEO Presets**: One-click format pills for:
  - `kebab-case` (SEO friendly slugs)
  - `snake_case`
  - `camelCase`
  - `lowercase`
  - `+ date` (appends current timestamp `YYYY-MM-DD`)
  - `reset` (reverts back to original name)
- 🔄 **NextGen Image Format Converter**: Convert images on the fly to **WebP**, **PNG**, or **JPG** with HTML5 Canvas.
- 📦 **Batch Sequence Renamer**: Rename multiple images at once with smart patterns (e.g. `banner-[01]` or `photo-[n]`).
- 🗂️ **Batch ZIP Downloader**: Download all renamed and converted files in one single click as a `.zip` archive.
- 🌓 **Sleek Glassmorphic UI**: High-contrast Dark and Light mode support with smooth transitions.
- 🎉 **Confetti Celebrations**: Visual feedback on single and batch downloads.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Tailored Design System, CSS Variables, Glassmorphism)
- **Icons**: Lucide React
- **Dropzone**: `react-dropzone`
- **Archiving**: `jszip`
- **Effects**: `canvas-confetti`

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```

---

## 📄 License
MIT
