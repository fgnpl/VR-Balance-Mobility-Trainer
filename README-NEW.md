# VR Balance & Mobility Trainer

A comprehensive VR training application for athletes to improve balance, mobility, and reaction time through immersive drills.

**Built with:** Wonderland Engine | **Target Platform:** Meta Quest 2 | **Status:** ✅ Production Ready

---

## 🎯 Overview

This VR application provides three training drills designed to enhance athletic performance:

1. **⚡ Target Striking** - Improve reaction time and hand-eye coordination
2. **🏃 Beam Walk** - Enhance balance and stability  
3. **⚾ Ball Catching** - Develop reflexes and catching skills

All drills track detailed performance metrics and provide comprehensive post-session reports.

---

## ✨ Features

- ✅ **3 Complete Training Drills** with configurable difficulty
- ✅ **3 Environment Options** (Football Field, Tennis Court, Gym Floor)
- ✅ **Comprehensive Data Tracking** (reaction times, accuracy, balance duration)
- ✅ **Session Reporting** with detailed statistics
- ✅ **VR & Desktop Support** (works with controllers or keyboard/mouse)
- ✅ **Interactive 3D UI** with distance-based button system
- ✅ **Extensible Architecture** - easy to add new drills

---

## 🎮 Training Drills

### Target Striking ⚡
Hit colored spheres as quickly as possible to train reaction time.
- **Tracks:** Reaction time, accuracy (in color mode)
- **Difficulty:** Adjustable spawn rate and color-coding
- **Best For:** Hand-eye coordination, reflexes

### Beam Walk 🏃  
Walk along a virtual beam while maintaining balance.
- **Tracks:** Balance duration, number of runs
- **Difficulty:** Adjustable beam width and reset sensitivity
- **Best For:** Balance, stability, core strength

### Ball Catching ⚾
Catch or deflect balls flying towards you.
- **Tracks:** Catches, deflects, misses, success rate
- **Difficulty:** Adjustable speed, spawn rate, positions
- **Best For:** Hand-eye coordination, reflexes, catching skills

---

## 📊 Performance Tracking

All sessions are automatically tracked with detailed metrics:

**Target Drill:**
- Average, fastest, and slowest reaction times
- Total hits and accuracy percentage

**Beam Walk:**
- Best balance duration
- Average balance time across runs
- Total runs completed

**Ball Catching:**
- Balls caught vs deflected vs missed
- Overall success rate percentage

View comprehensive reports anytime via the "Show Report" button.

---

## 🚀 Quick Start

### Requirements
- Wonderland Engine (latest version)
- Meta Quest 2 (or desktop browser for testing)
- Node.js (for dependencies)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fgnpl/VR-Balance-Mobility-Trainer.git
   cd VR-Balance-Mobility-Trainer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Open in Wonderland Engine:**
   - Launch Wonderland Engine Editor
   - Open project folder
   - Project loads automatically

4. **Build & Test:**
   - Desktop: Use built-in preview
   - Quest 2: Package as Android APK and sideload

### Setup in Editor

See **[QUICK-REFERENCE.MD](QUICK-REFERENCE.MD)** for detailed setup instructions.

**Quick Setup:**
1. Create "Manager" object with `data-manager` and `game-selector` components
2. Link all drill managers and environments in GameSelector properties
3. Create buttons with appropriate `button-*` components
4. Link prefabs (target sphere, ball) to drill managers

---

## 📚 Documentation

- **[PROJECT-STATUS.MD](PROJECT-STATUS.MD)** - Current status, completed features, what's next
- **[DEVELOPER-GUIDE.MD](DEVELOPER-GUIDE.MD)** - Architecture, component docs, adding new drills
- **[QUICK-REFERENCE.MD](QUICK-REFERENCE.MD)** - Quick lookup for properties, code snippets
- **[PROJECT-DOC.MD](PROJECT-DOC.MD)** - Original project documentation and midterm report
- **[PROJECT-PLAN.MD](PROJECT-PLAN.MD)** - Development plan and technical rules

---

## 🎮 Controls

### VR (Meta Quest 2)
- **Controllers:** Move close to buttons to press
- **Movement:** Use thumbsticks or roomscale
- **Interaction:** Hit targets/balls with controller collision

### Desktop
- **WASD:** Move player
- **Mouse:** Look around  
- **Interaction:** Walk close to buttons to "press" them

---

## 🏗️ Architecture

```
Manager (Central Controller)
├── DataManager - Session storage
└── GameSelector - Drill orchestration
    ├── Target Striking Drill
    ├── Beam Walk Drill  
    └── Ball Catching Drill

3D UI Buttons
├── Start Drills (Target, Beam, Ball)
├── Stop Drills
├── Show Report
└── Switch Environments
```

All components follow a modular design for easy extension. See [DEVELOPER-GUIDE.MD](DEVELOPER-GUIDE.MD) for details.

---

## 🛠️ Technologies

- **Engine:** [Wonderland Engine](https://wonderlandengine.com/) (JavaScript-based WebXR)
- **Math Library:** gl-matrix v3.4.3
- **Target Platform:** Meta Quest 2
- **Web Support:** Modern browsers with WebXR

---

## 👥 Team

- **Anastasia Gaynullina** - Gameplay Designer (Target striking, Ball catching, Data tracking)
- **Ayberk Cimen** - Gameplay Designer (Beam walk, Color-coded reactions)
- **Aigerim Amirgali** - UI/UX Designer (Assets, Environments, User interface)

---

## 📈 Project Status

**Current Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** November 29, 2025

**Completed:**
- ✅ All 3 training drills fully functional
- ✅ Complete data tracking and reporting system
- ✅ Environment switching (3 environments)
- ✅ VR and desktop support
- ✅ Comprehensive documentation

**Optional Future Enhancements:**
- 🔲 Visual progress charts/graphs
- 🔲 Audio feedback system
- 🔲 Haptic feedback integration
- 🔲 Difficulty levels
- 🔲 Session history persistence
- 🔲 Leaderboards

See [PROJECT-STATUS.MD](PROJECT-STATUS.MD) for detailed status.

---

## 🐛 Known Issues

1. **Hardware Limitation:** Meta Quest 2 only tracks head and hands (no full body)
2. **Desktop Mode:** Less immersive than VR but fully functional
3. **Ball Physics:** Simplified (no gravity simulation currently)

---

## 📝 License

This project was developed as part of an academic program.

---

## 🙏 Acknowledgments

- 3D Assets from [Sketchfab](https://sketchfab.com/)
- Audio from [Pixabay](https://pixabay.com/)
- Built with [Wonderland Engine](https://wonderlandengine.com/)

---

## 📞 Support

For questions or issues:
1. Check [DEVELOPER-GUIDE.MD](DEVELOPER-GUIDE.MD) for troubleshooting
2. Review [QUICK-REFERENCE.MD](QUICK-REFERENCE.MD) for common tasks
3. Open an issue on GitHub

---

**Ready to train? Load up the project and start improving your athletic performance! 🏃‍♂️⚡🎯**
