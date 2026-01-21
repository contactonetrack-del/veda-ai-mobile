/**
 * About Screen - Premium Enhanced
 * Displays app version, features, and company info
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { GlassView } from '../components/common/GlassView';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export default function AboutScreen({ navigation }: Props) {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();

    const features: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string; color: string }[] = [
        { icon: 'language-outline', title: '25 Languages', desc: '100% India Coverage', color: '#3B82F6' },
        { icon: 'mic-outline', title: 'Voice AI', desc: 'Speak Naturally', color: '#10B981' },
        { icon: 'people-outline', title: '12 Experts', desc: 'Domain Specialists', color: '#8B5CF6' },
        { icon: 'shield-checkmark-outline', title: 'Privacy First', desc: 'Local Processing', color: '#F59E0B' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* Premium Header */}
            <View style={[styles.header, { borderBottomColor: colors.cardBorder, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.inputBg }]}>
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('about_veda')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Premium Logo Card */}
                <GlassView style={styles.logoCard} intensity={40}>
                    <View style={[styles.logoBackground, { backgroundColor: colors.primary }]}>
                        <MaterialCommunityIcons name="meditation" size={48} color="#fff" />
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>VEDA AI</Text>
                    <View style={styles.versionBadge}>
                        <Text style={[styles.versionText, { color: colors.subtext }]}>v1.0.0</Text>
                        <View style={styles.betaBadge}>
                            <Text style={styles.betaText}>BETA</Text>
                        </View>
                    </View>
                    <Text style={[styles.tagline, { color: colors.subtext }]}>
                        Ancient Wisdom • Modern Intelligence
                    </Text>
                </GlassView>

                {/* Features Grid */}
                <Text style={[styles.sectionTitle, { color: colors.subtext }]}>KEY FEATURES</Text>
                <View style={styles.featuresGrid}>
                    {features.map((feat, idx) => (
                        <GlassView key={idx} style={styles.featureCard} intensity={30}>
                            <View style={[styles.featureIcon, { backgroundColor: `${feat.color}20` }]}>
                                <Ionicons name={feat.icon} size={24} color={feat.color} />
                            </View>
                            <Text style={[styles.featureTitle, { color: colors.text }]}>{feat.title}</Text>
                            <Text style={[styles.featureDesc, { color: colors.subtext }]}>{feat.desc}</Text>
                        </GlassView>
                    ))}
                </View>

                {/* Mission Card */}
                <GlassView style={styles.missionCard} intensity={30}>
                    <Text style={[styles.missionTitle, { color: colors.text }]}>Our Mission</Text>
                    <Text style={[styles.missionText, { color: colors.subtext }]}>
                        To democratize AI wellness guidance for every Indian household, in every language,
                        completely free of cost. Powered by open-source models and community innovation.
                    </Text>
                </GlassView>

                {/* Tech Stack */}
                <GlassView style={styles.techCard} intensity={30}>
                    <Text style={[styles.sectionHeader, { color: colors.subtext }]}>POWERED BY</Text>
                    <View style={styles.techTags}>
                        {['React Native', 'FastAPI', 'Whisper ASR', 'MMS TTS', 'DeepSeek-R1', 'Firebase'].map((tech, i) => (
                            <View key={i} style={[styles.techTag, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' }]}>
                                <Text style={styles.techTagText}>{tech}</Text>
                            </View>
                        ))}
                    </View>
                </GlassView>

                {/* Credits */}
                <GlassView style={styles.creditsCard} intensity={30}>
                    <Text style={[styles.sectionHeader, { color: colors.subtext }]}>COMPANY</Text>
                    <Text style={[styles.developerName, { color: colors.text }]}>One Track</Text>

                    <Text style={[styles.sectionHeader, { color: colors.subtext, marginTop: 16 }]}>DEVELOPED BY</Text>
                    <Text style={[styles.developerName, { color: colors.text }]}>Shiney</Text>

                    <Text style={[styles.developerInfo, { color: colors.subtext, marginTop: 16 }]}>Made with ❤️ in India 🇮🇳</Text>
                </GlassView>

                {/* Footer */}
                <Text style={[styles.footer, { color: colors.subtext }]}>© 2026 VEDA AI. All rights reserved.</Text>
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { flex: 1, padding: 16 },

    // Logo Card
    logoCard: {
        alignItems: 'center',
        padding: 24,
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
    },
    logoBackground: {
        width: 90,
        height: 90,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    appName: { fontSize: 28, fontWeight: '800', letterSpacing: 1 },
    versionBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
    versionText: { fontSize: 14 },
    betaBadge: { backgroundColor: '#3B82F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    betaText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    tagline: { fontSize: 14, marginTop: 12, fontStyle: 'italic' },

    // Features
    sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    featureCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        overflow: 'hidden',
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureTitle: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
    featureDesc: { fontSize: 11, textAlign: 'center', marginTop: 4 },

    // Mission
    missionCard: { padding: 20, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
    missionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
    missionText: { fontSize: 14, lineHeight: 22 },

    // Tech
    techCard: { padding: 20, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
    sectionHeader: { fontSize: 11, fontWeight: '700', marginBottom: 12, letterSpacing: 1 },
    techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    techTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    techTagText: { fontSize: 11, fontWeight: '600', color: '#60A5FA' },

    // Credits
    creditsCard: { padding: 20, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
    developerName: { fontSize: 16, fontWeight: '700' },
    developerInfo: { fontSize: 14, marginTop: 4 },

    // Footer
    footer: { textAlign: 'center', fontSize: 12, paddingVertical: 20 },
});
