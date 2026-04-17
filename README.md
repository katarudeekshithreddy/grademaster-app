# GradeMaster 🎓
### High-Precision Statistical Grading & Analytics System

GradeMaster is an executive-grade desktop application built to streamline the complex process of statistical grading in academic environments. Designed with a **premium Obsidian Glass aesthetic**, it combines robust data engineering with real-time interactive analytics.

![GradeMaster Preview](public/icon.png)

## 🚀 Key Features

- **Obsidian Glass UI**: A state-of-the-art interactive dashboard with glassmorphism effects and dynamic animations.
- **Smart Data Ingestion**: Seamlessly import course templates, student marks, and team mapping direct from Excel.
- **Integrated Team Analytics**: Automatically maps team-based projects and presentations to individual students using a dedicated mapping engine.
- **Outlier Management Engine**: Choose between three sophisticated statistical strategies:
  - **Ignore**: Keep data raw.
  - **Remove**: Filter out anomalies to recalculate pure statistics.
  - **Cap (Mean ± 2σ)**: Limit extreme values while retaining all student data (Best Practical Choice).
- **Interactive Cutoff System**: Drag-and-drop grade boundaries (A, B, C, D) directly on a high-precision histogram to see real-time shifts in grade distribution.
- **Dual-Mode Scoring**: Toggle between **Weighted Percentages (%)** and **Original Raw Points** in both the UI and Excel exports.
- **Cross-Platform Standalone**: Single-file executables for Windows, macOS, and Linux.

## 🛠️ Technical Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8 |
| **Desktop Shell** | Electron 41 |
| **Styling** | Vanilla CSS (CSS Variables + Glassmorphism) |
| **Charts** | Recharts (High-Precision Mapping) |
| **Data Engine** | SheetJS (Excel Pipeline) |
| **Automation** | GitHub Actions (CI/CD Cross-Platform) |

## 🧠 Data Structures & Logic

- **Custom MaxHeap**: Used for efficient $O(n \log n)$ ranking of students and teams.
- **HashMap Lookups**: $O(1)$ mapping of Student IDs to Team Marks and Team Identifiers.
- **Z-Score Normalization**: Statistical calculation of relative performance using $\mu$ (mean) and $\sigma$ (standard deviation).
- **Validation Pipeline**: A multi-stage processing engine that catches duplicate assignments, missing fields, and type mismatches before they hit the analytics engine.

## 📦 How to Run

### For Faculty (Standard Users)
Download the standalone executable for your OS from the [Releases](https://github.com/katarudeekshithreddy/grademaster-app/releases) page. No installation required.

### For Developers
1. **Clone the repo**:
   ```bash
   git clone https://github.com/katarudeekshithreddy/grademaster-app.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run in development mode**:
   ```bash
   npm run electron:dev
   ```
4. **Build production binaries**:
   ```bash
   npm run electron:build
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Developed by **Team_Debuggers** © 2026*
