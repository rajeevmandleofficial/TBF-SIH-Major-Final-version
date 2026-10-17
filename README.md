# Tunnel Booster Fan (TBF) — Prognostics & SCADA Digital Twin

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=flat&logo=vercel)](https://tbf-sih-major-final-version.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **🏆 v2.0 Successor to our Smart India Hackathon (SIH) 2024 Grand Finale Architecture (Hardware Edition • Built for Delhi Metro Rail Corporation — DMRC)**  
> 🌐 **Live Demo:** [https://tbf-sih-major-final-version.vercel.app/](https://tbf-sih-major-final-version.vercel.app/)

An enterprise-grade Condition-Based Monitoring (CBM) and Prognostic Health Management (PHM) SCADA Digital Twin. Fuses high-frequency vibration spectral analysis, motor winding thermal signatures, and authentic **NASA C-MAPSS FD001** run-to-failure degradation modeling to forecast Remaining Useful Life (RUL) prior to catastrophic mechanical shaft seizure.

---

## ⚡ Architectural Evolution

| Metric / Dimension | v1.0 (March 2025 Prototype) | v2.0 (2026 Production Edition) |
| :--- | :--- | :--- |
| **Origin / Pedigree** | SIH 2024 Grand Finale Hardware Edition | Enterprise Multi-Unit SCADA Digital Twin |
| **Target Organization** | Delhi Metro Rail Corporation (DMRC) | Critical Transit & Underground Municipal Infrastructure |
| **Architecture** | Monolithic Python Django + Local SQLite | Serverless Next.js 14 App Router + Supabase BaaS |
| **Monitored Assets** | Single Duct Sensor Node | 4 Concurrent Booster Fan Shafts (`TBF-01` to `TBF-04`) |
| **Prognostic Engine** | Static Thresholds & Kurtosis Flags | Dual-Engine: NASA C-MAPSS FD001 + Thermal Differential Physics |
| **HMI & Charting** | Server-Rendered HTML Templates | Zero-Latency Pure Vector SVG Trajectory Engine |
| **Operator Controls** | Static Dashboard | On-Demand Fault Injection, Manual Step-Tick Advancer, SOE Alarm Feed |
| **Design System** | Basic Monolithic CSS | Industrial SCADA Engineering Design (Dual Light/Dark Theme Switcher) |

---

## 🚀 Key Features

* **Real-Time Fleet SCADA HMI:** Concurrent telemetry monitoring for 4 tunnel booster fan units across tunnel portals.
* **NASA C-MAPSS FD001 Engine:** Industry benchmark run-to-failure degradation curves accurately modeling bearing wear progression.
* **Physics Digital Twin:** Differential equations simulating thermodynamics, motor winding heat dissipation, and vibration harmonic kurtosis.
* **Zero-Latency Vector SVG Charting:** Dynamically auto-scaling trajectory projection with dual warning (40-day) and critical (15-day) maintenance boundaries.
* **Sequence-of-Events (SOE) Alarms:** Live chronological fault logging with 1-click operator acknowledgment.
* **Deterministic Simulation Controls:** Speed multiplier (`0.5x`, `1x`, `2x`, `5x`), discrete step-tick clock, and 1-click fault injection/overhaul.
* **Dual Industrial Themes:** High-contrast daylight SCADA and nocturnal control-room dark themes.

---

## 🛠️ Technology Stack

* **Frontend Framework:** Next.js 16 (App Router, Turbopack)
* **Language:** TypeScript 5 (Strict Mode)
* **Styling & Design System:** Tailwind CSS v4, Lucide Icons
* **Database & BaaS:** Supabase PostgreSQL with Row-Level Security (RLS)
* **Prognostic Mathematics:** NASA C-MAPSS FD001, Bearing Kurtosis spectral modeling
* **Hosting Target:** Vercel Edge Network

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/rajeevmandleofficial/TBF-SIH-Major-Final-version.git
cd TBF-SIH-Major-Final-version
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment configuration (Optional)
Copy `.env.example` to `.env.local` if integrating with custom Supabase credentials:
```bash
cp .env.example .env.local
```
*(The system features an autonomous zero-latency local simulation engine fallback if external credentials are not set)*.

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) or [http://localhost:8000](http://localhost:8000) in your browser.

---

## ☁️ Deployment & Live Demo

* **Live Demo on Vercel:** [https://tbf-sih-major-final-version.vercel.app/](https://tbf-sih-major-final-version.vercel.app/)

### Deploying Your Own Instance:
1. Push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import this repository (`TBF-SIH-Major-Final-version`).
4. Framework Preset will automatically detect **Next.js**.
5. Click **Deploy**.

---

## 🎓 Academic Attribution

* **Lead Architect:** **Rajeev Mandle**
* **Department:** Department of Computer Science & Engineering
* **Institution:** Bhilai Institute of Technology Durg (BIT Durg)
* **Academic Batch:** Batch 2021 - 2025
* **Problem Statement:** DMRC Underground Tunnel Booster Fan Ventilation & Predictive Health Monitoring

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
