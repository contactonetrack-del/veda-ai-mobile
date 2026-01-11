/**
 * Chat Screen - Ultra Premium with Language Support
 * Features: Zone-wise Indian language selector
 */

import React, { useState, useRef, useEffect } from 'react';
import { SourcesCitation, AgentBadge } from '../components/SourcesCitation';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
    Modal,
    ScrollView,
    Keyboard,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SpeechService from '../services/SpeechService';
import VoiceInputService from '../services/VoiceInputService';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import VoiceSettingsModal, { VoiceSettings, DEFAULT_VOICE_SETTINGS } from '../components/VoiceSettingsModal';


interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: any[];
    agentUsed?: string;
    intent?: string;
    verified?: boolean;
    confidence?: number;
}

// Language display names - English with native in parentheses
const LANGUAGE_NAMES: Record<LanguageCode, string> = {
    en: 'English',
    hi: 'Hindi (हिंदी)',
    bho: 'Bhojpuri (भोजपुरी)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    kn: 'Kannada (ಕನ್ನಡ)',
    ml: 'Malayalam (മലയാളം)',
    bn: 'Bengali (বাংলা)',
    or: 'Odia (ଓଡ଼ିଆ)',
    mr: 'Marathi (मराठी)',
    gu: 'Gujarati (ગુજરાતી)',
};

export default function ChatScreen({ onLogout }: { onLogout: () => void }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [guestCount, setGuestCount] = useState(0);
    const { language: selectedLanguage, setLanguage, t } = useLanguage();
    const { colors, isDark } = useTheme();
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const keyboardPadding = useRef(new Animated.Value(0)).current;
    const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'auto' | 'fast' | 'planning' | 'study' | 'research' | 'analyze' | 'wellness' | 'search' | 'protection'>('auto'); // Agent Mode
    const [showModeModal, setShowModeModal] = useState(false);
    const [conversationStyle, setConversationStyle] = useState<'auto' | 'fast' | 'planning'>('auto'); // Conversation Style
    const [showStyleModal, setShowStyleModal] = useState(false);


    const isGuest = user?.id === 'guest';
    const guestLimit = 5;
    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);

    // Welcome messages for all supported languages - Gender aware
    const getWelcomeMessage = (lang: LanguageCode, gender: 'male' | 'female'): string => {
        const messages: Record<LanguageCode, { male: string; female: string }> = {
            en: {
                male: `**Namaste!** I'm **VEDA AI**, your premium wellness companion.\n\nI can help with:\n\n• 🥗 **Nutrition** — Indian Diet & Macros\n• 🧘 **Yoga** — Asanas & Pranayama\n• 🌿 **Ayurveda** — Holistic Healing\n• 🛡️ **Insurance** — Policy Guidance\n\n*Ask me anything!*`,
                female: `**Namaste!** I'm **VEDA AI**, your premium wellness companion.\n\nI can help with:\n\n• 🥗 **Nutrition** — Indian Diet & Macros\n• 🧘 **Yoga** — Asanas & Pranayama\n• 🌿 **Ayurveda** — Holistic Healing\n• 🛡️ **Insurance** — Policy Guidance\n\n*Ask me anything!*`,
            },
            hi: {
                male: `**नमस्ते!** मैं **VEDA AI** हूं, आपका प्रीमियम वेलनेस साथी।\n\nमैं इनमें मदद कर सकता हूं:\n\n• 🥗 **पोषण** — भारतीय आहार\n• 🧘 **योग** — आसन और प्राणायाम\n• 🌿 **आयुर्वेद** — समग्र उपचार\n• 🛡️ **बीमा** — पॉलिसी मार्गदर्शन\n\n*कुछ भी पूछें!*`,
                female: `**नमस्ते!** मैं **VEDA AI** हूं, आपकी प्रीमियम वेलनेस साथी।\n\nमैं इनमें मदद कर सकती हूं:\n\n• 🥗 **पोषण** — भारतीय आहार\n• 🧘 **योग** — आसन और प्राणायाम\n• 🌿 **आयुर्वेद** — समग्र उपचार\n• 🛡️ **बीमा** — पॉलिसी मार्गदर्शन\n\n*कुछ भी पूछें!*`,
            },
            bho: {
                male: `**प्रणाम!** हम **VEDA AI** बानी, रउआ के वेलनेस साथी।\n\nहम एह में मदद कर सकेनी:\n\n• 🥗 **खाना-पीना** — लिट्टी-चोखा, सत्तू\n• 🧘 **योग** — आसन आ प्राणायाम\n• 🌿 **आयुर्वेद** — घरेलू नुस्खा\n• 🛡️ **बीमा** — पॉलिसी के जानकारी\n\n*कुछो पूछीं!*`,
                female: `**प्रणाम!** हम **VEDA AI** बानी, रउआ के वेलनेस साथिन।\n\nहम एह में मदद कर सकेनी:\n\n• 🥗 **खाना-पीना** — लिट्टी-चोखा, सत्तू\n• 🧘 **योग** — आसन आ प्राणायाम\n• 🌿 **आयुर्वेद** — घरेलू नुस्खा\n• 🛡️ **बीमा** — पॉलिसी के जानकारी\n\n*कुछो पूछीं!*`,
            },
            ta: {
                male: `**வணக்கம்!** நான் **VEDA AI**, உங்கள் ஆரோக்கிய உதவியாளர்.\n\nநான் உதவ முடியும்:\n\n• 🥗 **உணவு** — இந்திய உணவு\n• 🧘 **யோகா** — ஆசனங்கள்\n• 🌿 **ஆயுர்வேதம்** — இயற்கை மருத்துவம்\n• 🛡️ **காப்பீடு** — வழிகாட்டுதல்\n\n*எதையும் கேளுங்கள்!*`,
                female: `**வணக்கம்!** நான் **VEDA AI**, உங்கள் ஆரோக்கிய உதவியாளர்.\n\nநான் உதவ முடியும்:\n\n• 🥗 **உணவு** — இந்திய உணவு\n• 🧘 **யோகா** — ஆசனங்கள்\n• 🌿 **ஆயுர்வேதம்** — இயற்கை மருத்துவம்\n• 🛡️ **காப்பீடு** — வழிகாட்டுதல்\n\n*எதையும் கேளுங்கள்!*`,
            },
            te: {
                male: `**నమస్కారం!** నేను **VEDA AI**, మీ ఆరోగ్య సహాయకుడు.\n\nనేను సహాయం చేయగలను:\n\n• 🥗 **పోషణ** — భారతీయ ఆహారం\n• 🧘 **యోగా** — ఆసనాలు\n• 🌿 **ఆయుర్వేదం** — సహజ వైద్యం\n• 🛡️ **బీమా** — మార్గదర్శకత్వం\n\n*ఏదైనా అడగండి!*`,
                female: `**నమస్కారం!** నేను **VEDA AI**, మీ ఆరోగ్య సహాయకురాలు.\n\nనేను సహాయం చేయగలను:\n\n• 🥗 **పోషణ** — భారతీయ ఆహారం\n• 🧘 **యోగా** — ఆసనాలు\n• 🌿 **ఆయుర్వేదం** — సహజ వైద్యం\n• 🛡️ **బీమా** — మార్గదర్శకత్వం\n\n*ఏదైనా అడగండి!*`,
            },
            kn: {
                male: `**ನಮಸ್ಕಾರ!** ನಾನು **VEDA AI**, ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ.\n\nನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n\n• 🥗 **ಪೋಷಣೆ** — ಭಾರತೀಯ ಆಹಾರ\n• 🧘 **ಯೋಗ** — ಆಸನಗಳು\n• 🌿 **ಆಯುರ್ವೇದ** — ನೈಸರ್ಗಿಕ ಚಿಕಿತ್ಸೆ\n• 🛡️ **ವಿಮೆ** — ಮಾರ್ಗದರ್ಶನ\n\n*ಏನನ್ನಾದರೂ ಕೇಳಿ!*`,
                female: `**ನಮಸ್ಕಾರ!** ನಾನು **VEDA AI**, ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕಿ.\n\nನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n\n• 🥗 **ಪೋಷಣೆ** — ಭಾರತೀಯ ಆಹಾರ\n• 🧘 **ಯೋಗ** — ಆಸನಗಳು\n• 🌿 **ಆಯುರ್ವೇದ** — ನೈಸರ್ಗಿಕ ಚಿಕಿತ್ಸೆ\n• 🛡️ **ವಿಮೆ** — ಮಾರ್ಗದರ್ಶನ\n\n*ಏನನ್ನಾದರೂ ಕೇಳಿ!*`,
            },
            ml: {
                male: `**നമസ്കാരം!** ഞാൻ **VEDA AI**, നിങ്ങളുടെ ആരോഗ്യ സഹായി.\n\nഎനിക്ക് സഹായിക്കാം:\n\n• 🥗 **പോഷണം** — ഇന്ത്യൻ ഭക്ഷണം\n• 🧘 **യോഗ** — ആസനങ്ങൾ\n• 🌿 **ആയുർവേദം** — പ്രകൃതി ചികിത്സ\n• 🛡️ **ഇൻഷുറൻസ്** — മാർഗ്ഗനിർദ്ദേശം\n\n*എന്തും ചോദിക്കൂ!*`,
                female: `**നമസ്കാരം!** ഞാൻ **VEDA AI**, നിങ്ങളുടെ ആരോഗ്യ സഹായി.\n\nഎനിക്ക് സഹായിക്കാം:\n\n• 🥗 **പോഷണം** — ഇന്ത്യൻ ഭക്ഷണം\n• 🧘 **യോഗ** — ആസനങ്ങൾ\n• 🌿 **ആയുർവേദം** — പ്രകൃതി ചികിത്സ\n• 🛡️ **ഇൻഷുറൻസ്** — മാർഗ്ഗനിർദ്ദേശം\n\n*എന്തും ചോദിക്കൂ!*`,
            },
            bn: {
                male: `**নমস্কার!** আমি **VEDA AI**, আপনার স্বাস্থ্য সহায়ক।\n\nআমি সাহায্য করতে পারি:\n\n• 🥗 **পুষ্টি** — ভারতীয় খাবার\n• 🧘 **যোগ** — আসন ও প্রাণায়াম\n• 🌿 **আয়ুর্বেদ** — প্রাকৃতিক চিকিৎসা\n• 🛡️ **বীমা** — নির্দেশনা\n\n*যেকোনো কিছু জিজ্ঞাসা করুন!*`,
                female: `**নমস্কার!** আমি **VEDA AI**, আপনার স্বাস্থ্য সহায়িকা।\n\nআমি সাহায্য করতে পারি:\n\n• 🥗 **পুষ্টি** — ভারতীয় খাবার\n• 🧘 **যোগ** — আসন ও প্রাণায়াম\n• 🌿 **আয়ুর্বেদ** — প্রাকৃতিক চিকিৎসা\n• 🛡️ **বীমা** — নির্দেশনা\n\n*যেকোনো কিছু জিজ্ঞাসা করুন!*`,
            },
            or: {
                male: `**ନମସ୍କାର!** ମୁଁ **VEDA AI**, ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ।\n\nମୁଁ ସାହାଯ୍ୟ କରିପାରିବି:\n\n• 🥗 **ପୋଷଣ** — ଭାରତୀୟ ଖାଦ୍ୟ\n• 🧘 **ଯୋଗ** — ଆସନ\n• 🌿 **ଆୟୁର୍ବେଦ** — ପ୍ରାକୃତିକ ଚିକିତ୍ସା\n• 🛡️ **ବୀମା** — ମାର୍ଗଦର୍ଶନ\n\n*କିଛି ପଚାରନ୍ତୁ!*`,
                female: `**ନମସ୍କାର!** ମୁଁ **VEDA AI**, ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟିକା।\n\nମୁଁ ସାହାଯ୍ୟ କରିପାରିବି:\n\n• 🥗 **ପୋଷଣ** — ଭାରତୀୟ ଖାଦ୍ୟ\n• 🧘 **ଯୋଗ** — ଆସନ\n• 🌿 **ଆୟୁର୍ବେଦ** — ପ୍ରାକୃତିକ ଚିକିତ୍ସା\n• 🛡️ **ବୀମା** — ମାର୍ଗଦର୍ଶନ\n\n*କିଛି ପଚାରନ୍ତୁ!*`,
            },
            mr: {
                male: `**नमस्कार!** मी **VEDA AI**, तुमचा आरोग्य सहाय्यक.\n\nमी मदत करू शकतो:\n\n• 🥗 **पोषण** — भारतीय आहार\n• 🧘 **योग** — आसने आणि प्राणायाम\n• 🌿 **आयुर्वेद** — नैसर्गिक उपचार\n• 🛡️ **विमा** — मार्गदर्शन\n\n*काहीही विचारा!*`,
                female: `**नमस्कार!** मी **VEDA AI**, तुमची आरोग्य सहाय्यक.\n\nमी मदत करू शकते:\n\n• 🥗 **पोषण** — भारतीय आहार\n• 🧘 **योग** — आसने आणि प्राणायाम\n• 🌿 **आयुर्वेद** — नैसर्गिक उपचार\n• 🛡️ **विमा** — मार्गदर्शन\n\n*काहीही विचारा!*`,
            },
            gu: {
                male: `**નમસ્તે!** હું **VEDA AI**, તમારો આરોગ્ય સહાયક.\n\nહું મદદ કરી શકું:\n\n• 🥗 **પોષણ** — ભારતીય આહાર\n• 🧘 **યોગ** — આસનો\n• 🌿 **આયુર્વેદ** — કુદરતી ઉપચાર\n• 🛡️ **વીમો** — માર્ગદર્શન\n\n*કંઈપણ પૂછો!*`,
                female: `**નમસ્તે!** હું **VEDA AI**, તમારી આરોગ્ય સહાયક.\n\nહું મદદ કરી શકું:\n\n• 🥗 **પોષણ** — ભારતીય આહાર\n• 🧘 **યોગ** — આસનો\n• 🌿 **આયુર્વેદ** — કુદરતી ઉપચાર\n• 🛡️ **વીમો** — માર્ગદર્શન\n\n*કંઈપણ પૂછો!*`,
            },
        };
        return messages[lang]?.[gender] || messages.en[gender];
    };


    useEffect(() => {
        const welcomeMsg: Message = {
            id: '0',
            role: 'assistant',
            content: getWelcomeMessage(selectedLanguage, voiceSettings.gender),
            timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
    }, [selectedLanguage, voiceSettings.gender]);

    // Load saved preferences from AsyncStorage
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const savedSettings = await AsyncStorage.getItem('voiceSettings');
                if (savedSettings) {
                    setVoiceSettings(JSON.parse(savedSettings));
                } else {
                    // Fallback to old gender setting
                    const savedGender = await AsyncStorage.getItem('voiceGender');
                    if (savedGender) {
                        setVoiceSettings(prev => ({ ...prev, gender: savedGender as 'male' | 'female' }));
                    }
                }
            } catch (error) {
                console.log('Error loading preferences:', error);
            }
        };
        loadPreferences();
    }, []);

    // Save voice settings when they change
    useEffect(() => {
        AsyncStorage.setItem('voiceSettings', JSON.stringify(voiceSettings)).catch(console.log);
    }, [voiceSettings]);

    // Handle keyboard events for Android
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
        });

        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    async function handleSend() {
        if (!input.trim()) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (isGuest && guestCount >= guestLimit) {
            const limitMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: selectedLanguage === 'hi'
                    ? "आपने अतिथि सीमा पार कर ली है। जारी रखने के लिए **साइन अप** करें!"
                    : "You've reached the guest limit. **Sign up** to continue!",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, limitMsg]);
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Stop any current speech when sending new message
        if (currentlySpeaking) {
            SpeechService.stop();
            setCurrentlySpeaking(null);
        }


        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            let content = '';
            let sources = [];
            let agentUsed = '';
            let intent = '';
            let verified = false;
            let confidence = 0.0;

            if (isGuest) {
                content = await api.sendGuestMessage(input, selectedLanguage);
                setGuestCount(prev => prev + 1);
            } else {
                const response = await api.sendOrchestratedMessage(input, user?.id, selectedMode, conversationStyle, selectedLanguage);
                content = response.response;
                sources = response.sources;
                agentUsed = response.agentUsed;
                intent = response.intent;
                verified = response.verified;
                confidence = response.confidence;
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content,
                timestamp: new Date(),
                sources,
                agentUsed,
                intent,
                verified,
                confidence
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I apologize for the inconvenience. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    }

    // Voice input handler
    const handleVoiceInput = async () => {
        if (isRecording) {
            // Stop recording and transcribe
            setIsRecording(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            const audioUri = await VoiceInputService.stopRecording();
            if (audioUri) {
                // Show loading state while transcribing
                setInput('Transcribing...');
                try {
                    const transcribedText = await VoiceInputService.transcribeAudio(audioUri, selectedLanguage);
                    if (transcribedText) {
                        setInput(transcribedText);
                    } else {
                        setInput('');
                    }
                } catch (error) {
                    console.error('Transcription error:', error);
                    setInput('');
                }
            }
        } else {
            // Start recording
            const started = await VoiceInputService.startRecording();
            if (started) {
                setIsRecording(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        }
    };

    function formatTime(date: Date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function handleLanguageSelect(code: LanguageCode) {
        Haptics.selectionAsync();
        setLanguage(code);
        setShowLanguageModal(false);
    }

    function renderMessage({ item }: { item: Message }) {
        const isUser = item.role === 'user';

        if (isUser) {
            return (
                <View style={styles.userMessageContainer}>
                    <View style={styles.userCard}>
                        <LinearGradient
                            colors={['#1D4ED8', '#1E40AF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.userHeader}
                        >
                            <Text style={styles.userTimestamp}>{formatTime(item.timestamp)}</Text>
                            <Text style={styles.userName}>You</Text>
                            <View style={styles.userIconContainer}>
                                <Ionicons name="person" size={12} color="#fff" />
                            </View>
                        </LinearGradient>
                        <View style={styles.userContent}>
                            <Text style={styles.userMessageText}>{item.content}</Text>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.aiMessageContainer}>
                <View style={[styles.aiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={[styles.aiHeader, { backgroundColor: colors.inputBg, borderBottomColor: colors.cardBorder }]}>
                        <View style={[styles.aiIconContainer, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.2)' }]}>
                            <MaterialCommunityIcons name="meditation" size={14} color={colors.primary} />
                        </View>
                        <Text style={[styles.aiName, { color: colors.text }]}>VEDA AI</Text>
                        {item.agentUsed && (
                            <AgentBadge agent={item.agentUsed} intent={item.intent} />
                        )}
                        <View style={{ flex: 1 }} />
                        <Text style={[styles.aiTimestamp, { color: colors.subtext }]}>{formatTime(item.timestamp)}</Text>
                    </View>
                    <View style={[styles.aiContent, { backgroundColor: colors.card }]}>
                        <Markdown style={isDark ? markdownStyles : markdownStylesLight}>
                            {item.content}
                        </Markdown>
                        {item.sources && item.sources.length > 0 && (
                            <SourcesCitation
                                sources={item.sources}
                                verified={item.verified}
                                confidence={item.confidence}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.voiceButton}
                            onPress={async () => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                if (currentlySpeaking === item.id) {
                                    await SpeechService.stop();
                                    setCurrentlySpeaking(null);
                                } else {
                                    setCurrentlySpeaking(item.id);
                                    // Strip markdown for speech
                                    const cleanText = item.content.replace(/[*#_`]/g, '');
                                    await SpeechService.speak(
                                        cleanText,
                                        selectedLanguage,
                                        voiceSettings.gender,
                                        voiceSettings.rate,
                                        voiceSettings.pitch,
                                        () => {
                                            setCurrentlySpeaking(null);
                                        }
                                    );
                                }
                            }}
                        >
                            <Ionicons
                                name={currentlySpeaking === item.id ? "stop-circle" : "volume-high-outline"}
                                size={18}
                                color={currentlySpeaking === item.id ? "#10B981" : "#94A3B8"}
                            />
                            {currentlySpeaking === item.id && (
                                <Text style={styles.speakingText}>Speaking...</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        );
    }

    // Dynamic markdown styles based on theme
    const markdownStylesLight = {
        body: { color: '#1E293B', fontSize: 15, lineHeight: 24 },
        strong: { fontWeight: '700' as const, color: '#0F172A' },
        em: { fontStyle: 'italic' as const, color: '#475569' },
        heading1: { fontSize: 18, fontWeight: 'bold' as const, color: '#0F172A', marginBottom: 10 },
        heading2: { fontSize: 16, fontWeight: 'bold' as const, color: '#0F172A', marginBottom: 8 },
        list_item: { flexDirection: 'row' as const, marginBottom: 6 },
        bullet_list: { marginLeft: 6 },
        bullet_list_icon: { marginRight: 10, color: '#10B981', fontSize: 14 },
        paragraph: { marginBottom: 10 },
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }, Platform.OS === 'android' && { paddingBottom: keyboardHeight > 0 ? keyboardHeight - 60 : 0 }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <LinearGradient colors={[colors.card, colors.background]} style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerLogoWrapper}>
                            <LinearGradient colors={['#10B981', '#059669']} style={styles.headerLogo}>
                                <MaterialCommunityIcons name="meditation" size={22} color="#fff" />
                            </LinearGradient>
                        </View>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>VEDA AI</Text>
                            <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
                                {isGuest ? `Guest • ${guestLimit - guestCount} left` : 'Premium Member'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerRight}>
                        {/* Voice Settings Trigger */}
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.selectionAsync();
                                setShowVoiceSettings(true);
                            }}
                            style={[
                                styles.genderButton,
                                {
                                    backgroundColor: colors.inputBg,
                                    borderColor: colors.inputBorder,
                                    width: 36, // Ensure circular
                                    height: 36,
                                    padding: 0,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }
                            ]}
                        >
                            <Ionicons
                                name={voiceSettings.gender === 'female' ? "woman" : "man"}
                                size={18}
                                color={voiceSettings.gender === 'female' ? "#EC4899" : "#3B82F6"}
                            />
                            <View style={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                backgroundColor: colors.card,
                                borderRadius: 6,
                            }}>
                                <Ionicons name="settings-sharp" size={10} color={colors.subtext} />
                            </View>
                        </TouchableOpacity>

                        {/* Language Selector */}
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.selectionAsync();
                                setShowLanguageModal(true);
                            }}
                            style={[styles.languageButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                        >
                            <Text style={[styles.languageButtonText, { color: colors.text }]}>
                                {SUPPORTED_LANGUAGES[selectedLanguage].name.slice(0, 3)}
                            </Text>
                            <Ionicons name="language" size={16} color={colors.subtext} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onLogout} style={[styles.logoutButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                            <Ionicons name="power-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    showsVerticalScrollIndicator={false}
                />

                {/* Typing */}
                {loading && (
                    <View style={styles.typingContainer}>
                        <View style={styles.typingBubble}>
                            <ActivityIndicator size="small" color="#10B981" />
                            <Text style={styles.typingText}>Thinking...</Text>
                        </View>
                    </View>
                )}

                {/* Phase 5: Mode Selection Dropdown Trigger */}
                <TouchableOpacity
                    style={[styles.modeDropdownTrigger, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                    onPress={() => { Haptics.selectionAsync(); setShowModeModal(true); }}
                >
                    <Ionicons
                        name={{
                            'auto': 'sparkles-outline',
                            'fast': 'flash-outline',
                            'planning': 'bulb-outline',
                            'study': 'school-outline',
                            'research': 'globe-outline',
                            'analyze': 'bar-chart-outline',
                            'wellness': 'heart-outline',
                            'search': 'search-outline',
                            'protection': 'shield-outline'
                        }[selectedMode] as any}
                        size={16}
                        color={colors.primary}
                    />
                    <Text style={[styles.modeDropdownText, { color: colors.text }]}>
                        {{
                            'auto': 'Auto',
                            'fast': 'Fast',
                            'planning': 'Planning',
                            'study': 'Study',
                            'research': 'Research',
                            'analyze': 'Analyze',
                            'wellness': 'Wellness',
                            'search': 'Search',
                            'protection': 'Protection'
                        }[selectedMode]}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={colors.subtext} />
                </TouchableOpacity>

                {/* Input */}
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            value={input}
                            onChangeText={setInput}
                            placeholder={t('type_message')}
                            placeholderTextColor={colors.subtext}
                            multiline
                            maxLength={1000}
                            editable={!isRecording}
                        />
                    </View>

                    {/* Microphone Button */}
                    <TouchableOpacity
                        style={[
                            styles.micButtonWrapper,
                            isRecording && styles.micButtonRecording
                        ]}
                        onPress={handleVoiceInput}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isRecording ? "stop-circle" : "mic-outline"}
                            size={22}
                            color={isRecording ? "#fff" : "#10B981"}
                        />
                    </TouchableOpacity>

                    {/* Send Button */}
                    <TouchableOpacity
                        style={styles.sendButtonWrapper}
                        onPress={handleSend}
                        disabled={loading || !input.trim() || isRecording}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={input.trim() && !isRecording ? ['#3B82F6', '#1D4ED8'] : ['#1E293B', '#1E293B']}
                            style={[styles.sendButton, (!input.trim() || isRecording) && styles.sendButtonDisabled]}
                        >
                            <Ionicons name="arrow-up" size={20} color={input.trim() && !isRecording ? '#fff' : '#475569'} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Language Modal */}
            <Modal
                visible={showLanguageModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('select_language')}</Text>
                            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                <Ionicons name="close" size={24} color={colors.subtext} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.languageList}>
                            {Object.entries(LANGUAGE_NAMES).map(([code, name]) => {
                                const isSelected = selectedLanguage === code;
                                return (
                                    <TouchableOpacity
                                        key={code}
                                        style={[
                                            styles.languageItem,
                                            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                            isSelected && styles.languageItemSelected
                                        ]}
                                        onPress={() => handleLanguageSelect(code as LanguageCode)}
                                    >
                                        <Text style={[
                                            styles.languageItemText,
                                            { color: colors.text },
                                            isSelected && styles.languageItemTextSelected
                                        ]}>
                                            {name}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Phase 5: Mode Selection Modal */}
            <Modal
                visible={showModeModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Mode</Text>
                            <TouchableOpacity onPress={() => setShowModeModal(false)}>
                                <Ionicons name="close" size={24} color={colors.subtext} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.languageList}>
                            {[
                                { id: 'auto' as const, label: 'Auto', icon: 'sparkles-outline' as const, desc: 'Let AI decide the best approach' },
                                { id: 'fast' as const, label: 'Fast', icon: 'flash-outline' as const, desc: 'Quick responses, speed-first' },
                                { id: 'planning' as const, label: 'Planning', icon: 'bulb-outline' as const, desc: 'Brainstorming & structured thinking' },
                                { id: 'study' as const, label: 'Study', icon: 'school-outline' as const, desc: 'Critical thinking & clarity' },
                                { id: 'research' as const, label: 'Research', icon: 'globe-outline' as const, desc: 'Deep analysis with web sources' },
                                { id: 'analyze' as const, label: 'Analyze', icon: 'bar-chart-outline' as const, desc: 'Math & data calculations' },
                                { id: 'wellness' as const, label: 'Wellness', icon: 'heart-outline' as const, desc: 'Yoga, Ayurveda & Diet' },
                                { id: 'search' as const, label: 'Search', icon: 'search-outline' as const, desc: 'Live web search' },
                                { id: 'protection' as const, label: 'Protection', icon: 'shield-outline' as const, desc: 'Insurance guidance' }
                            ].map((mode) => {
                                const isSelected = selectedMode === mode.id;
                                return (
                                    <TouchableOpacity
                                        key={mode.id}
                                        style={[
                                            styles.modeModalItem,
                                            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                            isSelected && styles.modeModalItemSelected
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setSelectedMode(mode.id);
                                            setShowModeModal(false);
                                        }}
                                    >
                                        <Ionicons name={mode.icon} size={22} color={isSelected ? '#10B981' : colors.subtext} />
                                        <View style={styles.modeModalItemText}>
                                            <Text style={[styles.modeModalItemLabel, { color: isSelected ? '#10B981' : colors.text }]}>
                                                {mode.label}
                                            </Text>
                                            <Text style={[styles.modeModalItemDesc, { color: colors.subtext }]}>
                                                {mode.desc}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Voice Settings Modal */}
            <VoiceSettingsModal
                visible={showVoiceSettings}
                onClose={() => setShowVoiceSettings(false)}
                currentSettings={voiceSettings}
                onSave={setVoiceSettings}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    keyboardContainer: { flex: 1 },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingTop: 48, // Manual status bar padding
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        backgroundColor: '#0F172A',
        zIndex: 10,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerLogoWrapper: {
        marginRight: 12,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    headerLogo: {
        width: 38,
        height: 38,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#F8FAFC' },
    headerSubtitle: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    genderButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    languageButtonText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600', marginRight: 4 },
    logoutButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Messages
    messageList: { paddingHorizontal: 12, paddingVertical: 16, paddingBottom: 8 },
    userMessageContainer: { alignItems: 'flex-end', marginBottom: 16, paddingLeft: 40 },
    userCard: {
        backgroundColor: '#1E3A8A',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    userTimestamp: { fontSize: 10, color: 'rgba(255,255,255,0.6)', flex: 1 },
    userName: { fontSize: 13, fontWeight: '600', color: '#fff', marginRight: 8 },
    userIconContainer: {
        width: 22,
        height: 22,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userContent: { paddingHorizontal: 14, paddingVertical: 12 },
    userMessageText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
    aiMessageContainer: { marginBottom: 16, paddingRight: 40 },
    aiCard: {
        backgroundColor: '#0F172A',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1E293B',
        overflow: 'hidden',
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    aiIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    aiName: { fontSize: 13, fontWeight: '600', color: '#E2E8F0', flex: 1 },
    aiStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 8 },
    aiTimestamp: { fontSize: 10, color: '#64748B' },
    aiContent: { paddingHorizontal: 14, paddingVertical: 14 },
    // Typing
    typingContainer: { paddingHorizontal: 12, paddingBottom: 8 },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    typingText: { color: '#94A3B8', fontSize: 12, marginLeft: 8 },
    // Input
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#0F172A',
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        alignItems: 'flex-end',
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
        paddingHorizontal: 14,
        marginRight: 10,
    },
    input: { color: '#F8FAFC', fontSize: 15, maxHeight: 100, paddingTop: 10, paddingBottom: 10 },
    micButtonWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 2,
        borderWidth: 1,
        borderColor: '#334155',
    },
    micButtonRecording: {
        backgroundColor: '#DC2626',
        borderColor: '#DC2626',
    },
    sendButtonWrapper: { marginBottom: 2 },
    sendButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    sendButtonDisabled: { borderWidth: 1, borderColor: '#334155' },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#0F172A',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
    languageList: { paddingHorizontal: 16, paddingVertical: 8 },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E293B',
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 8,
    },
    languageItemSelected: {
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    languageItemText: { color: '#E2E8F0', fontSize: 16, fontWeight: '500' },
    languageItemTextSelected: { color: '#10B981', fontWeight: '600' },

    voiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        alignSelf: 'flex-start',
    },
    speakingText: {
        color: '#10B981',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 6,
    },
    // Phase 5: Mode Selection Dropdown
    modeDropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginLeft: 16,
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    modeDropdownText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modeModalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        gap: 12,
    },
    modeModalItemSelected: {
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    modeModalItemText: {
        flex: 1,
        gap: 2,
    },
    modeModalItemLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    modeModalItemDesc: {
        fontSize: 12,
        opacity: 0.8,
    },
});

const markdownStyles = StyleSheet.create({
    body: { color: '#E2E8F0', fontSize: 15, lineHeight: 24 },
    strong: { fontWeight: '700', color: '#F8FAFC' },
    em: { fontStyle: 'italic', color: '#94A3B8' },
    heading1: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 10 },
    heading2: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8 },
    list_item: { flexDirection: 'row', marginBottom: 6 },
    bullet_list: { marginLeft: 6 },
    bullet_list_icon: { marginRight: 10, color: '#10B981', fontSize: 14 },
    paragraph: { marginBottom: 10 },
    link: { color: '#38BDF8' },
});
