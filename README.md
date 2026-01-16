# VEDA AI Mobile App 📱

The ultra-premium mobile experience for VEDA AI, built with Expo and React Native. This application delivers a fluid, intuitive, and visually stunning interface for wellness guidance.

---

## ✨ Key Features

### 🎨 Premium UI/UX

- **Glassmorphism Design**: Modern, translucent UI elements using `expo-blur`
- **Fluid Animations**: 60FPS animations powered by `react-native-reanimated`
- **Gesture-Based Navigation**: Intuitive swipe gestures for sidebars and actions
- **Confetti Celebration**: Custom particle effects for verified achievements
- **Animated Onboarding**: Pulsing glow effects and floating icon badges

### 💬 Advanced Chat Interface

- **Smart Quick Replies**: Context-aware suggestions generated dynamically
- **Rich Text Input**: Integrated Markdown toolbar (Bold, Italic, Code, List, Quote)
- **Voice Interaction**: Real-time waveform visualization with customizable voice settings
- **Code Syntax Highlighting**: Full-featured code blocks with copy functionality
- **Message Reactions**: Interactive emoji reactions and quick actions (Copy, Reply, Regenerate)
- **Swipe Gestures**: Swipe-to-reply and swipe-to-delete on messages
- **Streaming Responses**: Animated cursor during AI response streaming

### 🗂️ Smart Organization

- **Chat Folders**: Organize chats into Work, Personal, Ideas, and custom folders
- **Grouped History**: Chats organized by Today, Yesterday, This Week, Older
- **Search & Filter**: Real-time search across chat titles and previews
- **Swipe-to-Delete**: Quick chat deletion with confirmation

### 📊 Personalization & Insights

- **Usage Statistics**: Animated weekly activity bar chart with varied heights
- **Privacy Settings**: Granular control over data and notifications
- **Theme Engine**: System/Light/Dark/High Contrast mode cycling
- **Accessibility Panel**: Reduce Motion, Screen Reader, High Contrast support

### 🔐 Authentication

- **Biometric Login**: FaceID/TouchID support
- **Password Security**: Strength indicator with real-time feedback
- **Guest Mode**: Try the app without creating an account
- **Form Validation**: Inline validation with error messages

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native (Expo SDK 50+) |
| Language | TypeScript |
| State Management | React Hooks + Context API |
| Navigation | React Navigation 7 |
| Animations | React Native Reanimated 3 |
| Gestures | React Native Gesture Handler |
| Storage | AsyncStorage |
| Haptics | Expo Haptics |
| Voice | Expo Speech |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`) or EAS CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/veda-ai-mobile.git
cd veda-ai-mobile

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Running the App

```bash
# Start Expo development server
npx expo start

# Run on Android Emulator
npm run android

# Run on iOS Simulator
npm run ios

# Run on physical device
# Scan QR code with Expo Go app
```

### Building for Production

```bash
# Build Android APK (preview)
eas build --platform android --profile preview

# Build Android AAB (production)
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile preview
```

---

## 📂 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── chat/             # Chat-specific (MessageBubble, TypingIndicator, CodeBlock)
│   ├── settings/         # Settings cards (UsageStats, SettingsRow)
│   └── common/           # Shared components (AnimatedButton, Toast, SkeletonLoader)
├── config/               # Design system tokens
│   ├── colors.ts         # Color palette (dark/light/highContrast themes)
│   ├── typography.ts     # Font scales and presets
│   ├── spacing.ts        # Spacing scale and border radius
│   └── animations.ts     # Animation configs and presets
├── context/              # Global state providers
│   ├── AuthContext.tsx   # Authentication state
│   ├── ThemeContext.tsx  # Theme management
│   └── LanguageContext.tsx # i18n support
├── screens/              # Application screens
│   ├── ChatScreen.tsx    # Main chat interface
│   ├── AuthScreen.tsx    # Login/Signup
│   ├── SettingsScreen.tsx # User settings
│   └── OnboardingScreen.tsx # First-time user flow
├── services/             # Business logic
│   ├── api.ts            # Backend API client
│   ├── SpeechService.ts  # Text-to-speech
│   ├── VoiceInputService.ts # Voice recognition
│   └── SuggestionService.ts # Quick reply generation
└── navigation/           # Navigation configuration
    └── RootNavigator.tsx
```

---

## 🌍 Supported Languages

VEDA AI supports 25+ languages including:

| Zone | Languages |
|------|-----------|
| Global | English |
| North India | Hindi, Bhojpuri (Beta), Punjabi, Urdu, Nepali, Kashmiri, Dogri, Maithili |
| South India | Tamil, Telugu, Kannada, Malayalam |
| East India | Bengali, Odia, Assamese, Manipuri, Bodo |
| West India | Marathi, Gujarati, Konkani |
| Tribal | Gondi, Chhattisgarhi, Santali |

---

## ♿ Accessibility

The app is built with WCAG 2.2 AA compliance:

- ✅ Full Screen Reader support with `accessibilityLabel` and `accessibilityRole`
- ✅ Focus management for modals and sidebars
- ✅ Minimum 44x44dp touch targets
- ✅ High Contrast mode with 21:1 contrast ratio
- ✅ Reduce Motion option for animation sensitivity
- ✅ Proper color contrast ratios in all themes

---

## 🔧 Environment Variables

Create a `.env` file with:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

---

## 📱 Screens Overview

| Screen | Description |
|--------|-------------|
| Onboarding | 3-slide animated intro with swipeable pagination |
| Auth | Login/Signup with biometric support and password strength |
| Chat | Main AI conversation interface with rich features |
| Settings | Profile, theme, voice, accessibility, and privacy settings |
| Memory | View and manage AI's memory of your conversations |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please follow the coding standards:

- Use TypeScript for all new files
- Use design system tokens from `config/`
- Add `accessibilityLabel` to all interactive elements
- Test on both iOS and Android

---

## 📄 License

This project is proprietary software. All rights reserved.

---

*Built with ❤️ for wellness and mindfulness*
