/**
 * About Screen
 * Displays app version and company info
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

export default function AboutScreen() {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const navigation = useNavigation();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('about_veda')}</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.logoBackground}
                    >
                        <Ionicons name="leaf" size={60} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.appName, { color: colors.text }]}>VEDA AI</Text>
                    <Text style={[styles.version, { color: colors.subtext }]}>v1.0.0 (Beta)</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.description, { color: colors.text }]}>
                        VEDA AI is your premium AI wellness companion, designed to bring the ancient wisdom of Indian wellness into the modern era.
                    </Text>
                    <Text style={[styles.description, { color: colors.text, marginTop: 12 }]}>
                        • Nutrition Guidance based on Indian diets
                        {'\n'}• Yoga & Pranayama Asanas
                        {'\n'}• Ayurvedic Holistic Healing
                        {'\n'}• Health Insurance Simplification
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.sectionHeader, { color: colors.subtext }]}>DEVELOPED BY</Text>
                    <Text style={[styles.developerName, { color: colors.text }]}>FitBlaze Technologies</Text>
                    <Text style={[styles.developerInfo, { color: colors.subtext }]}>Made with ❤️ in India</Text>
                </View>
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
    logoContainer: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
    logoBackground: {
        width: 100,
        height: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    appName: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
    version: { fontSize: 14, marginTop: 4 },
    card: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    description: { fontSize: 15, lineHeight: 24 },
    sectionHeader: { fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
    developerName: { fontSize: 16, fontWeight: '700' },
    developerInfo: { fontSize: 14, marginTop: 4 },
});
