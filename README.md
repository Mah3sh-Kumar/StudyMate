# 🎓 StudyMate - AI-Powered Study Assistant

StudyMate is a comprehensive React Native mobile application that combines AI technology with smart study tools to enhance your learning experience.

## ✨ Features

### 🤖 Core AI Tools
- **AI Summarizer**: Instantly condenses notes into key points
- **AI Quiz Generator**: Creates multiple-choice quizzes from study materials
- **AI Flashcard Creator**: Automatically generates flashcards from notes
- **AI Chat Assistant**: Interactive chatbot for study help and explanations

### 🧠 Smart Features
- **AI Study Planner**: Personalized study schedules based on your goals
- **Hands-Free Mode**: Voice-controlled study interface
- **Study Time Tracker**: Monitor and visualize your study progress

### 👥 Collaboration & Tracking
- **Study Groups**: Connect with classmates, share notes, and collaborate
- **Progress Analytics**: Track your study habits and performance

### 🎨 User Experience
- **Modern UI**: Clean, intuitive, and mobile-friendly design
- **Responsive Design**: Optimized for all screen sizes
- **Easy Navigation**: Tab-based interface for quick access

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd studymate
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure OpenAI API**
   - Copy `config/api-config.js` to `config/api-config.js`
   - Add your OpenAI API key to the configuration file
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## ⚙️ Configuration

### OpenAI API Setup
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Update `config/api-config.js` with your key
4. Restart the app

### Database Setup (Optional)
For full functionality, consider setting up a database:
- **Recommended**: Supabase (free tier available)
- See `database-setup.md` for detailed setup instructions

## 📱 Current Project Structure

```
studymate/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.js       # Home screen - Overview of all features
│   │   ├── plan.js        # AI Study Planner - Create study schedules
│   │   ├── summarizer.js  # AI Summarizer - Generate summaries from text
│   │   ├── quiz.js        # AI Quiz Generator - Create quizzes from materials
│   │   ├── flashcards.js  # AI Flashcard Creator - Generate flashcards
│   │   ├── chat.js        # AI Chat Assistant - Interactive AI help
│   │   ├── handsfree.js   # Voice Control - Hands-free AI interaction
│   │   ├── groups.js      # Study Groups - Manage study groups
│   │   ├── tracker.js     # Study Time Tracker - Monitor study sessions
│   │   └── _layout.tsx    # Tab navigation layout
│   └── screens/           # Additional screens (if any)
├── api/                   # API integration functions
│   └── api.js            # OpenAI API functions for AI features
├── config/                # Configuration files
│   └── api-config.js     # API keys and app configuration
├── hooks/                 # Custom React hooks
├── node_modules/          # Dependencies
├── .expo/                 # Expo configuration
├── .git/                  # Git repository
├── app.json              # Expo app configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── expo-env.d.ts         # Expo type definitions
├── README.md             # This file
├── SETUP.md              # Quick setup guide
└── database-setup.md     # Database integration guide
```

## 🗄️ Database Integration Requirements

### 📊 Database Schema

#### 1. **Users Table** (`users`)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);
```

#### 2. **Study Groups Table** (`study_groups`)
```sql
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  max_members INTEGER DEFAULT 50,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  tags TEXT[]
);
```

#### 3. **Group Members Table** (`group_members`)
```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
```

#### 4. **Study Sessions Table** (`study_sessions`)
```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. **Flashcard Decks Table** (`flashcard_decks`)
```sql
CREATE TABLE flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  total_cards INTEGER DEFAULT 0
);
```

#### 6. **Flashcards Table** (`flashcards`)
```sql
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  last_reviewed TIMESTAMP,
  review_count INTEGER DEFAULT 0
);
```

#### 7. **Study Materials Table** (`study_materials`)
```sql
CREATE TABLE study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  subject VARCHAR(100),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 8. **AI Generated Content Table** (`ai_generated_content`)
```sql
CREATE TABLE ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'summary', 'quiz', 'flashcards'
  original_text TEXT,
  generated_content JSONB,
  ai_model VARCHAR(100),
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. **Group Messages Table** (`group_messages`)
```sql
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'file', 'image'
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🔐 Authentication Requirements

#### **User Authentication Flow**
1. **Sign Up**: Email, username, password
2. **Sign In**: Email/username + password
3. **Password Reset**: Email-based reset
4. **Email Verification**: Confirm email address
5. **Social Login**: Google, Apple (optional)

#### **Session Management**
- JWT tokens for authentication
- Refresh token rotation
- Automatic logout on token expiry
- Remember me functionality

### ⚙️ Settings Page Requirements

#### **User Profile Settings**
- **Personal Information**
  - Full name
  - Username
  - Email address
  - Profile picture/avatar
  - Bio/description

- **Study Preferences**
  - Default study session duration
  - Preferred subjects
  - Study goals
  - Notification preferences
  - Time zone settings

- **Privacy Settings**
  - Profile visibility (public/private)
  - Study data sharing preferences
  - Group invitation settings
  - Data export options

#### **App Settings**
- **AI Configuration**
  - OpenAI API key management
  - AI model preferences
  - Response length settings
  - Language preferences

- **Interface Settings**
  - Dark/Light mode toggle
  - Font size preferences
  - Color scheme options
  - Accessibility settings

- **Data Management**
  - Export study data
  - Clear app data
  - Backup/restore settings
  - Data retention policies

#### **Security Settings**
- **Account Security**
  - Change password
  - Two-factor authentication
  - Login history
  - Active sessions management

- **Data Privacy**
  - Data usage analytics
  - Third-party integrations
  - Data deletion requests
  - Privacy policy acceptance

### 🚀 Database Integration Steps

1. **Choose Database Provider**
   - **Supabase** (Recommended - Free tier)
   - **Firebase** (Alternative)
   - **PlanetScale** (MySQL alternative)

2. **Set Up Database**
   - Create database instance
   - Run schema creation scripts
   - Set up Row Level Security (RLS)

3. **Configure Authentication**
   - Set up auth providers
   - Configure JWT settings
   - Set up email templates

4. **Install Dependencies**
   ```bash
   pnpm add @supabase/supabase-js
   # or
   pnpm add firebase
   ```

5. **Update Configuration**
   - Add database credentials to `config/api-config.js`
   - Set up environment variables

6. **Implement API Layer**
   - Create database service functions
   - Add error handling
   - Implement caching strategies

## 🔧 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## 🌟 Key Features in Detail

### AI Summarizer
- Upload text or paste notes
- Get instant AI-generated summaries
- Copy summaries to clipboard
- Save summaries for later reference

### AI Quiz Generator
- Input study material
- Generate multiple-choice questions
- Take quizzes and see results
- Review explanations for each answer

### AI Flashcard Creator
- Generate flashcards from study materials
- Interactive card flipping
- Add custom cards manually
- Export flashcard decks

### Study Groups
- Create and join study groups
- Chat with group members
- Share study materials
- Track group activity

### Study Time Tracker
- Start/stop study sessions
- Track time by subject
- View progress statistics
- Export study data

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **AI Integration**: OpenAI GPT API
- **State Management**: React Hooks
- **Styling**: StyleSheet API
- **Database**: Supabase (PostgreSQL) - Recommended

## 📊 Performance & Optimization

- Lazy loading for tab screens
- Efficient state management
- Optimized API calls with fallbacks
- Responsive design for all devices
- Database query optimization
- Caching strategies

## 🔒 Security Features

- API key validation
- Secure API communication
- Input sanitization
- Error handling with fallbacks
- Row Level Security (RLS)
- JWT token authentication
- Password hashing
- Rate limiting

## 🚧 Development Status

- ✅ Core UI components
- ✅ AI integration framework
- ✅ Tab navigation
- ✅ Basic functionality
- 🔄 Database integration (Ready for implementation)
- 🔄 Authentication system (Ready for implementation)
- 🔄 Settings page (Ready for implementation)
- 🔄 Advanced features
- 🔄 Testing suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your API configuration
3. Ensure all dependencies are installed
4. Check Expo documentation for common issues
5. Review database setup guide

## 🔮 Future Enhancements

- Dark mode support
- Offline mode with local storage
- Push notifications for study reminders
- Advanced analytics and insights
- Integration with learning management systems
- Multi-language support
- Advanced study analytics
- Collaborative study sessions
- Gamification features

---

**Happy Studying! 📚✨**
