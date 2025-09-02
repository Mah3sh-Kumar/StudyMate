
# File Descriptions

This file provides a brief overview of the purpose of each file in the StudyMate project.

## `app` directory

### `app/_layout.tsx`
This is the root layout of the app. It wraps the entire application with the `AuthProvider` and `ThemeProviderCustom` to provide authentication and theme context to all components.

### `app/(tabs)/_layout.tsx`
This file defines the layout for the tab navigator. It sets up the tab bar, including the icons and styles, and ensures that only authenticated users can access the main tabs.

### `app/(tabs)/chat.js`
This screen provides an AI-powered chat interface where users can ask study-related questions and get instant answers. It includes features like fallback responses, message copying, and chat clearing.

### `app/(tabs)/flashcards.js`
This screen allows users to create, manage, and study flashcards. It includes features for creating decks, adding cards manually or with AI, flipping cards, and tracking progress.

### `app/(tabs)/groups.js`
This screen enables users to create and join study groups. It features tabs for "My Groups" and "Available Groups", group search, and the ability to create, join, leave, and delete groups.

### `app/(tabs)/handsfree.js`
This screen provides a hands-free, voice-controlled study assistant. Users can speak their questions and get AI-powered responses, making it ideal for studying on the go.

### `app/(tabs)/index.js`
This is the home screen of the app. It provides a dashboard with quick access to all the main features of the application, such as AI Chat, Quizzes, Flashcards, and more.

### `app/(tabs)/plan.js`
This screen features an AI-powered study planner. Users can input their subjects and goals, and the app will generate a personalized study schedule.

### `app/(tabs)/quiz.js`
This screen allows users to generate quizzes from their study materials. It uses AI to create questions and provides a quiz interface with options, results, and scoring.

### `app/(tabs)/settings.js`
This screen allows users to manage their profile, preferences, and account settings. It includes options for changing the theme, updating profile information, and signing out.

### `app/(tabs)/summarizer.js`
This screen provides an AI-powered text summarizer. Users can paste their notes or any text, and the app will generate a concise summary.

### `app/(tabs)/tracker.js`
This screen helps users track their study sessions. It includes a timer, session history, and statistics to monitor study habits and progress over time.

### `app/+not-found.tsx`
This screen is displayed when a user tries to navigate to a route that does not exist. It provides a link to go back to the home screen.

### `app/auth/login.js`
This screen provides a login form for users to authenticate with their email and password. It includes a link to the sign-up screen and a "forgot password" feature.

### `app/auth/signup.js`
This screen provides a sign-up form for new users to create an account. It collects the user's full name, username, email, and password.

## `components` directory

### `components/AuthGuard.js`
This component protects routes that require authentication. It checks if a user is logged in and redirects them to the login screen if they are not.

### `components/EnhancedTabIcons.js`
This file provides a set of enhanced, professionally styled tab bar icons for the main navigation.

### `components/TabIcons.js`
This file provides a set of simple and modern tab bar icons for the main navigation.

## `contexts` directory

### `contexts/AuthContext.js`
This file provides an authentication context to the entire application. It manages the user's authentication state, including sign-up, sign-in, sign-out, and profile updates.

### `contexts/ThemeContext.js`
This file provides a theme context to the entire application. It allows users to switch between light and dark themes and persists the preference using AsyncStorage.

## `hooks` directory

### `hooks/useColorScheme.ts`
This hook provides access to the user's preferred color scheme (light or dark).

### `hooks/useColorScheme.web.ts`
This is the web-specific implementation of the `useColorScheme` hook.

### `hooks/useThemeColor.ts`
This hook provides access to the theme colors. It returns the appropriate color for the current theme (light or dark).

## `lib` directory

### `lib/database.js`
This file contains all the database service functions for interacting with the Supabase backend. It includes services for managing users, flashcards, study groups, and study sessions.

### `lib/initDatabase.js`
This script initializes the Supabase database with the required tables, indexes, and row-level security policies.

### `lib/supabase.js`
This file initializes and configures the Supabase client, which is used to interact with the Supabase backend.

### `lib/testBackend.js`
This file contains functions for testing the backend connectivity and basic operations.
