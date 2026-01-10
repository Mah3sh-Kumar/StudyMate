# StudyMate

**AI-Powered Study Assistant**

StudyMate is a modern React Native application that leverages artificial intelligence to enhance the learning experience. Built with Expo and powered by OpenAI, StudyMate provides intelligent tools for content summarization, quiz generation, flashcard creation, and learning progress tracking.

---

## Features

### AI-Powered Tools
- **AI Summarizer** - Transform lengthy notes into concise, actionable summaries
- **AI Quiz Generator** - Create comprehensive multiple-choice quizzes from study materials
- **AI Flashcard Creator** - Automatically generate interactive flashcards from content
- **AI Chat Assistant** - Interactive chatbot for study help and explanations

### Study Management
- **Study Planner** - Generate personalized study schedules based on learning goals
- **Hands-Free Mode** - Voice-controlled interface for hands-free study sessions
- **Time Tracker** - Monitor study sessions with detailed analytics and progress visualization

### Collaboration
- **Study Groups** - Create and join study groups, share materials, and collaborate with peers
- **Progress Analytics** - Comprehensive insights into study habits and performance metrics

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Package Manager (npm, yarn, or pnpm)
- Expo CLI (installed globally or via npx)
- Development Environment:
  - iOS Simulator (macOS) or Android Emulator
  - Or a physical device with Expo Go app

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd StudyMate
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure OpenAI API**
   - Open `config/api-config.js`
   - Add your OpenAI API key (obtain from [OpenAI Platform](https://platform.openai.com/api-keys))
   - Configure model preferences as needed

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Launch the application**
   - Press `i` to open iOS simulator
   - Press `a` to open Android emulator
   - Scan the QR code with Expo Go app on your mobile device

---

## Configuration

### OpenAI API Setup

1. Visit the [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key in your account dashboard
3. Open `config/api-config.js` and add your API key
4. Configure model preferences and feature flags as needed
5. Restart the development server

### Database Setup (Optional)

For full functionality including user authentication, data persistence, and collaborative features:

- **Recommended**: [Supabase](https://supabase.com) (free tier available)
- **Alternative**: Firebase, PlanetScale, or other PostgreSQL-compatible databases
- See `SETUP_DATABASE.md` for detailed setup instructions

---

## Project Structure

```
StudyMate/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.js       # Home screen
│   │   ├── plan.js        # Study Planner
│   │   ├── summarizer.js  # AI Summarizer
│   │   ├── quiz.js        # Quiz Generator
│   │   ├── flashcards.js  # Flashcard Creator
│   │   ├── chat.js        # AI Chat Assistant
│   │   ├── handsfree.js   # Voice Control
│   │   ├── groups.js      # Study Groups
│   │   ├── tracker.js     # Time Tracker
│   │   └── _layout.tsx    # Tab navigation layout
│   ├── auth/              # Authentication screens
│   └── +not-found.tsx     # 404 screen
├── api/                   # API integration functions
│   └── api.js            # OpenAI API functions
├── config/                # Configuration files
│   └── api-config.js     # API keys and configuration
├── components/            # Reusable components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
│   ├── database.js       # Database service functions
│   └── supabase.js       # Supabase client configuration
├── app.json              # Expo app configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` or `pnpm start` | Start Expo development server |
| `npm run android` | Launch on Android device/emulator |
| `npm run ios` | Launch on iOS simulator |
| `npm run web` | Run in web browser |
| `npm run lint` | Run ESLint to check code quality |

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React Native with Expo |
| **Navigation** | Expo Router |
| **AI Integration** | OpenAI GPT-4o, GPT-4o-mini, GPT-3.5-turbo |
| **State Management** | React Hooks & Context API |
| **Styling** | React Native StyleSheet API |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |

---

## Performance & Optimization

- **Code Splitting** - Lazy loading for improved initial load times
- **State Management** - Efficient React Hooks and Context API usage
- **API Optimization** - Retry logic with exponential backoff and rate limiting
- **Responsive Design** - Optimized layouts for all device sizes
- **Database Optimization** - Efficient queries with proper indexing
- **Caching** - Strategic caching to reduce API calls and improve performance

---

## Security

- **API Security** - Secure API key management and validation
- **Data Protection** - Encrypted communication and secure data storage
- **Input Validation** - Comprehensive input sanitization and validation
- **Authentication** - JWT-based authentication with secure token management
- **Authorization** - Row Level Security (RLS) for database access control
- **Error Handling** - Secure error handling without exposing sensitive information
- **Rate Limiting** - Protection against API abuse and excessive requests
- **Security Best Practices** - See `SECURITY.md` for detailed security implementation and recommendations

---

## Development Status

| Feature | Status |
|---------|--------|
| Core UI Components | ✅ Complete |
| AI Integration Framework | ✅ Complete |
| Tab Navigation | ✅ Complete |
| Basic Functionality | ✅ Complete |
| Database Integration | ✅ Implemented |
| Authentication System | ✅ Implemented |
| Settings Page | ✅ Implemented |
| Advanced Features | 🔄 In Progress |
| Testing Suite | 🔄 Planned |

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

---

## Troubleshooting

### Common Issues

**API Errors**
- Verify your OpenAI API key is correctly configured in `config/api-config.js`
- Check your API quota and billing status on OpenAI Platform
- Ensure you have internet connectivity

**Build Errors**
- Clear cache: `npx expo start -c`
- Delete `node_modules` and reinstall dependencies
- Check Node.js version compatibility (v16+)

**Database Connection Issues**
- Verify Supabase credentials in configuration
- Check network connectivity
- Review `SETUP_DATABASE.md` for setup instructions

For additional help, please open an issue on GitHub.

---

## License

This project is licensed under the MIT License.

---

## Roadmap

- [ ] Enhanced dark mode with theme customization
- [ ] Offline mode with local data synchronization
- [ ] Push notifications for study reminders and group updates
- [ ] Advanced analytics dashboard with detailed insights
- [ ] Integration with popular learning management systems
- [ ] Multi-language support (i18n)
- [ ] Collaborative real-time study sessions
- [ ] Gamification features and achievement system
