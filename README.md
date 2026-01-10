
<div align="center">

# 📚 StudyMate

### AI-Powered Study Assistant

**Supercharge Your Learning with Intelligent Tools**

A modern, cross-platform mobile application that leverages AI to deliver intelligent content summarization, quiz generation, flashcards, and personalized learning schedules.

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Usage](#-usage)
  - [Import Study Material](#import-study-material)
  - [Study Mode](#study-mode)
  - [Hands-Free Voice Commands](#hands-free-voice-commands)
- [Tech Stack](#-tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [AI](#ai)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
  - [API Key Invalid](#api-key-invalid)
  - [Android Emulator Crash](#android-emulator-crash)
  - [Supabase Data Not Saving](#supabase-data-not-saving)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**StudyMate** is an intelligent educational companion designed to transform passive study into active learning.

By combining advanced AI models with a mobile-first interface, StudyMate enables students to understand faster, revise smarter, and retain knowledge more effectively.

Key capabilities include:

- **Intelligent Processing** – AI-powered summarization and content analysis
- **Cloud Synchronization** – Secure multi-device data persistence via Supabase
- **Adaptive Learning** – Personalized schedules, quizzes, and progress tracking

---

## ✨ Features

### 🧠 AI-Powered Tools

- **Smart Summarizer**Convert long notes, PDFs, and textbooks into concise, exam-oriented summaries.
- **Quiz Generator**Automatically generate structured multiple-choice quizzes from study material.
- **Flashcard Creator**Create interactive flashcards optimized for active recall and spaced repetition.
- **AI Chat Assistant**
  Context-aware conversational assistant for instant explanations and doubt solving.

---

### ⚡ Productivity & Study Management

- **Study Planner**Auto-generate personalized study schedules based on goals and deadlines.
- **Hands-Free Mode**Voice-controlled studying using speech-to-text and text-to-speech.
- **Time Tracker**
  Focus timers (Pomodoro) with analytics on productivity and consistency.

---

### 👥 Collaboration & Analytics

- **Study Groups**Share quizzes, flashcards, and notes with peers in real time.
- **Performance Metrics**Visual insights into quiz scores, topic mastery, and study streaks.
- **Leaderboards**
  Gamified learning to increase motivation and consistency.

---

## 🏗 Architecture

```
    ┌─────────────────────────────────────────────────────────────┐
    │                        StudyMate System                     │
    └─────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Client Layer   │     │   Cloud Layer    │     │     AI Layer     │
│                  │     │                  │     │                  │
│   Mobile App     │◄────┤    Supabase      │◄────┤     OpenAI       │
│ (React Native)   │HTTPS│                  │ API │                  │
│                  │     │ - PostgreSQL     │     │ - GPT Models     │
│ - Study Tools    │     │ - Auth           │     │ - Embeddings     │
│ - UI / UX        │     │ - Storage        │     │ - Completion     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### System Components

#### Client Layer (Mobile)

- React Native with Expo for cross-platform support
- Local caching for offline study
- Voice module for hands-free interaction

#### Cloud Layer (Backend)

- Supabase Authentication (JWT-based)
- PostgreSQL database for structured data
- Realtime sync for collaborative features

#### AI Layer

- OpenAI API for summarization, quizzes, chat, and embeddings

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed:

- Node.js v16 or higher
- npm or yarn
- Expo CLI
  ```bash
  npm install -g expo-cli
  ```
- OpenAI API Key
- Supabase Account

### Installation

```bash
git clone https://github.com/yourusername/StudyMate.git
cd StudyMate
npm install
# or
yarn install
```

### Configuration

Create `config/api-config.js` (or use `.env`):

```javascript
export const API_CONFIG = {
  openaiApiKey: "YOUR_OPENAI_API_KEY",
  supabaseUrl: "YOUR_SUPABASE_URL",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
  modelPreference: "gpt-4o"
};
```

### Supabase Database Setup

Create the following tables:

- `profiles` – User profile data
- `study_materials` – Uploaded notes and documents
- `quizzes` – Generated quiz data
- `flashcards` – Flashcard decks and cards

(Refer to `sql/00_complete_setup.sql` for the complete schema)

### Running the Application

```bash
npx expo start
```

- iOS Simulator: Press `i`
- Android Emulator: Press `a`
- Physical Device: Scan the QR code using Expo Go

## 📱 Usage

### Import Study Material

1. Open Home tab
2. Tap "Add Material"
3. Paste text or upload a document
4. Choose "Generate Summary", "Create Quiz", or "Generate Flashcards"

### Study Mode

1. Navigate to Library
2. Select a flashcard deck
3. Swipe:
   - Right → Known
   - Left → Learning

### Hands-Free Voice Commands

- "Read summary"
- "Next card"
- "Quiz me on Chapter 1"

## 🛠 Tech Stack

### Frontend

- React Native (Expo)
- Expo Router
- Reanimated
- React Context / Zustand

### Backend

- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Realtime & Storage

### AI

- OpenAI GPT-4o
- OpenAI GPT-3.5-Turbo

## 📁 Project Structure

```
StudyMate/
├── assets/                 # Images, fonts, static files
├── config/                 # API keys and environment configs
├── app/                    # Main app screens and routing
├── components/             # Reusable UI components
├── contexts/               # Global state management
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and database setup
├── sql/                    # Database schema and setup scripts
├── api/                    # API integration files
├── constants/              # Constant values
├── App.js
├── app.json
├── package.json
└── README.md
```

## 🔧 Troubleshooting

### API Key Invalid

- Verify API key format
- Remove extra spaces
- Ensure OpenAI billing is active

### Android Emulator Crash

```bash
npx expo start -c
```

- Ensure Google Play Services are installed.

### Supabase Data Not Saving

- Check Row Level Security (RLS) policies
- Ensure user authentication before database writes

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
See the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Made with ❤️ for smarter learning

⭐ Star this repository if you find it useful

</div>
