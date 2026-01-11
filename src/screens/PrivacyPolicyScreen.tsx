/**
 * Privacy Policy Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('privacy_policy')}</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.lastUpdated, { color: colors.subtext }]}>Last Updated: Jan 10, 2026</Text>

                <Text style={[styles.paragraph, { color: colors.text }]}>
                    Your privacy is important to us. It is One Track's policy to respect your privacy regarding any information we may collect from you across our app, VEDA AI.
                </Text>

                <Text style={[styles.heading, { color: colors.text }]}>1. Information We Collect</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, and wellness preferences.
                </Text>

                <Text style={[styles.heading, { color: colors.text }]}>2. How We Use Information</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    We use the information we collect to provide, maintain, and improve our services, including to personalize your experience and provide AI-driven wellness insights.
                </Text>

                <Text style={[styles.heading, { color: colors.text }]}>3. Data Security</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    We maintain reasonable measures to protect your information from loss, theft, misuse, and unauthorized access.
                </Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { flex: 1, padding: 20 },
    lastUpdated: { fontSize: 12, marginBottom: 20 },
    heading: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 8 },
    paragraph: { fontSize: 15, lineHeight: 24 },
});
