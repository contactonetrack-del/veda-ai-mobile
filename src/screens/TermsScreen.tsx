/**
 * Terms of Service Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from '../components/common/GlassView';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export default function TermsScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('terms_of_service')}</Text>
            </View>



            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                showsVerticalScrollIndicator={false}
            >
                <GlassView style={styles.card} intensity={20}>
                    <Text style={[styles.lastUpdated, { color: colors.subtext }]}>Last Updated: Jan 10, 2026</Text>

                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        By accessing or using VEDA AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.
                    </Text>

                    <Text style={[styles.heading, { color: colors.text }]}>1. Acceptance of Terms</Text>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        By creating an account, you agree to comply with all applicable laws and regulations.
                    </Text>

                    <Text style={[styles.heading, { color: colors.text }]}>2. Medical Disclaimer</Text>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        VEDA AI provides wellness information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
                    </Text>

                    <Text style={[styles.heading, { color: colors.text }]}>3. User Accounts</Text>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
                    </Text>
                </GlassView>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
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
    card: {
        padding: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
});
