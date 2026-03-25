# 🧘 Zen Notes

**Zen Notes** is a minimalist, transparent sticky note widget designed to keep your focus sharp and your desktop clean. Built with React, Vite, and Electron, it blends seamlessly into your workspace while providing powerful task management features.



## ✨ Features

- **🪟 Transparent & Frameless**: A sleek, modern design that feels like part of your desktop.
- **🖱️ Draggable & Resizable**: Position and scale the widget exactly where you need it.
- **✅ Task Management**: Easily add, complete, and delete tasks with a single click.
- **↕️ Smart Reordering**: Drag-and-drop your tasks to prioritize your workflow.
- **🚩 Priority System**: Quickly toggle task urgency (Low, Medium, High).
- **📉 Mini Mode**: Collapse the widget into a tiny, unobtrusive state when you need extra space.
- **🎨 Custom Themes**: Switch between **Classic**, **Dark**, and **Pastel** modes to match your mood.
- **💡 Daily Motivation**: Integrated motivational quotes (Malayalam) to keep you inspired.
- **💾 Auto-Persistence**: Automatically saves your tasks, theme, position, and window size.
- **🎉 Celebrate Wins**: Interactive confetti effects when you finish a task!

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/remilsalim/zen-notes.git
   cd zen-notes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application (Development Mode):
   ```bash
   npm run electron
   ```

### Building for Distribution

To create a portable executable or installer:
```bash
npm run dist
```
The output will be found in the `dist` folder.

## ⌨️ Keyboard Shortcuts

- `Ctrl + N`: Focus the "Add Task" input.
- `Esc`: Toggle Mini Mode.
- `Ctrl + D`: Clear all completed tasks.

## 🛠️ Technology Stack

- **Frontend**: React + Vite
- **Desktop Wrapper**: Electron
- **Styling**: Vanilla CSS
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit
- **Animations**: canvas-confetti, react-draggable

---

## 📖 About Zen Notes

Zen Notes was born out of a desire for a distraction-free, "zen" environment for daily tasks. Most sticky note apps are either too heavy or look outdated. This project aims to provide a premium, lightweight alternative that respects your desktop real estate while adding a touch of personality with motivational quotes and smooth animations.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Created with ❤️ by [remilsalim](https://github.com/remilsalim)
