# 🚀 Quick Setup Guide

## ⚡ Get StudyMate Running in 5 Minutes

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Configure OpenAI API (Required for AI Features)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy your API key
4. Open `config/api-config.js`
5. Replace `'YOUR_OPENAI_API_KEY_HERE'` with your actual API key

### 3. Start the App
```bash
npx expo start
```

### 4. Run on Device
- **iOS**: Press `i` in terminal
- **Android**: Press `a` in terminal  
- **Phone**: Scan QR code with Expo Go app

## 🔑 What You Need

- **OpenAI API Key**: For AI features (summarizer, quiz generator, chat, flashcards)
- **Expo Go App**: Free app from App Store/Play Store for testing
- **Internet Connection**: Required for AI features

## 🎯 Test the Features

### ✅ Working Features (No Setup Required)
- **Study Planner**: Create and manage study plans
- **Study Groups**: Create/join groups, manage members
- **Study Tracker**: Track study sessions and time
- **Basic UI**: All screens and navigation

### 🤖 AI Features (Require API Key)
- **AI Summarizer**: Generate summaries from text
- **AI Quiz Generator**: Create quizzes from study materials  
- **AI Flashcard Creator**: Generate flashcards automatically
- **AI Chat Assistant**: Ask questions and get AI responses
- **Voice Control**: Hands-free AI interaction

## 🚨 Common Issues & Solutions

### "AI features not working"
- Check your OpenAI API key in `config/api-config.js`
- Ensure you have internet connection
- Check console for error messages

### "App won't start"
- Run `pnpm install` to install dependencies
- Clear Expo cache: `npx expo start --clear`
- Check Node.js version (v16+ required)

### "Can't connect to device"
- Make sure phone and computer are on same WiFi
- Try using USB connection
- Check firewall settings

## 📱 App Structure

```
🏠 Home - Overview of all features
📅 Planner - AI Study Planner  
📄 Summarizer - AI Text Summarization
❓ Quiz - AI Quiz Generation
🃏 Cards - AI Flashcard Creation
💬 AI Chat - AI Study Assistant
🎤 Voice - Hands-Free AI Control
👥 Groups - Study Group Management
📊 Tracker - Study Time Tracking
```

## 🔧 Customization

### Change AI Model
Edit `config/api-config.js`:
```javascript
MODEL: 'gpt-4', // Change from gpt-3.5-turbo-1106
```

### Adjust AI Parameters
```javascript
MAX_TOKENS: 2000, // Increase for longer responses
TEMPERATURE: 0.5, // Lower = more focused, Higher = more creative
```

### Enable/Disable Features
```javascript
FEATURES: {
  ENABLE_AI_FEATURES: true, // Set to false to disable AI
  ENABLE_VOICE_CONTROL: true,
  ENABLE_STUDY_GROUPS: true
}
```

## 🎉 You're Ready!

Your StudyMate app should now be fully functional with:
- ✅ All 8 main screens working
- ✅ AI-powered features (with API key)
- ✅ Interactive study tools
- ✅ Modern, responsive UI
- ✅ Tab navigation

**Start studying smarter today! 📚✨**
