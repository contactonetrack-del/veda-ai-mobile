/**
 * Health Protection Screen
 * Calculate health insurance premiums with IRDAI focus
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Logic Data
const COVERAGE_OPTIONS: any = {
    basic: {
        name: 'Essential',
        amount: '₹3 Lakh',
        value: 300000,
        multiplier: 1.0,
        color: '#3B82F6',
        benefits: ['Hospitalization', 'Day Care', 'Pre-hospitalization (30 days)']
    },
    standard: {
        name: 'Smart',
        amount: '₹5 Lakh',
        value: 500000,
        multiplier: 1.5,
        color: '#10B981',
        benefits: ['All Essential +', 'Maternity Cover', 'OPD Benefits']
    },
    premium: {
        name: 'Supreme',
        amount: '₹10 Lakh',
        value: 1000000,
        multiplier: 2.2,
        color: '#F59E0B',
        benefits: ['All Smart +', 'Air Ambulance', 'Worldwide Cover']
    },
};

const AGE_RATES: any = {
    '18-25': 120,
    '26-35': 180,
    '36-45': 280,
    '46-55': 450,
    '56-65': 700,
    '66+': 1100,
};

const INSURANCE_TERMS = [
    { term: 'Sum Insured', desc: 'Max claim amount per year' },
    { term: 'Cashless', desc: 'Direct payment to hospital' },
    { term: 'Waiting Period', desc: 'Time before specific coverage starts' },
    { term: 'Co-pay', desc: 'Your share of the claim (10-20%)' },
];

export default function InsuranceEstimatorScreen() {
    const navigation = useNavigation<any>();
    const { t } = useLanguage();
    const { colors, isDark } = useTheme();

    // State
    const [age, setAge] = useState('');
    const [coverage, setCoverage] = useState('standard');
    const [familySize, setFamilySize] = useState(1);
    const [hasPreExisting, setHasPreExisting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showTerms, setShowTerms] = useState(false);

    function calculatePremium() {
        const ageNum = parseInt(age);
        if (!age || ageNum < 18 || ageNum > 100) {
            Alert.alert('Invalid Age', 'Please enter age between 18 and 100.');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Bracket
        let bracket = '66+';
        if (ageNum <= 25) bracket = '18-25';
        else if (ageNum <= 35) bracket = '26-35';
        else if (ageNum <= 45) bracket = '36-45';
        else if (ageNum <= 55) bracket = '46-55';
        else if (ageNum <= 65) bracket = '56-65';

        const baseRate = AGE_RATES[bracket];
        const option = COVERAGE_OPTIONS[coverage];
        const lakhs = option.value / 100000;

        // Calc
        let annual = baseRate * lakhs * option.multiplier;
        annual = annual * (1 + (familySize - 1) * 0.6); // Family Logic
        if (hasPreExisting) annual = annual * 1.15; // 15% loading

        annual = Math.round(annual / 100) * 100;
        const monthly = Math.round(annual / 12);
        const savings = Math.round(annual * 0.08);

        setResult({
            monthly,
            yearly: annual,
            savings,
            planName: option.name,
            coverageAmount: option.amount,
            color: option.color,
            benefits: option.benefits,
        });
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            {/* Header */}
            <LinearGradient colors={[colors.card, colors.background]} style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Ionicons name="shield-checkmark" size={24} color="#3B82F6" style={{ marginRight: 8 }} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Health Protection</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statChip, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF', borderColor: '#3B82F6' }]}>
                        <Text style={[styles.statText, { color: '#3B82F6' }]}>4000+ Hospitals</Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: '#10B981' }]}>
                        <Text style={[styles.statText, { color: '#10B981' }]}>98% Claim Ratio</Text>
                    </View>
                </View>

                {/* Calculator Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Start Your Estimate</Text>

                    {/* Age */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.subtext }]}>Eldest Member's Age</Text>
                        <TextInput
                            style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                            value={age}
                            onChangeText={setAge}
                            placeholder="e.g. 35"
                            placeholderTextColor={colors.subtext}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Family Size */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.subtext }]}>Family Members (Self + Spouse + Kids)</Text>
                        <View style={styles.stepperContainer}>
                            <TouchableOpacity
                                style={[styles.stepperBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                                onPress={() => setFamilySize(Math.max(1, familySize - 1))}
                            >
                                <Text style={[styles.stepperText, { color: colors.text }]}>-</Text>
                            </TouchableOpacity>
                            <Text style={[styles.stepperValue, { color: colors.text }]}>{familySize}</Text>
                            <TouchableOpacity
                                style={[styles.stepperBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                                onPress={() => setFamilySize(Math.min(6, familySize + 1))}
                            >
                                <Text style={[styles.stepperText, { color: colors.text }]}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Pre-existing Toggle */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.subtext }]}>Pre-existing Conditions?</Text>
                        <View style={styles.toggleRow}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, !hasPreExisting && styles.toggleActiveNo]}
                                onPress={() => setHasPreExisting(false)}
                            >
                                <Text style={[styles.toggleText, !hasPreExisting && { color: '#fff' }]}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, hasPreExisting && styles.toggleActiveYes]}
                                onPress={() => setHasPreExisting(true)}
                            >
                                <Text style={[styles.toggleText, hasPreExisting && { color: '#fff' }]}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>Diabetes, BP, Heart Conditions, etc.</Text>
                    </View>

                    {/* Coverage Selection */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.subtext }]}>Select Coverage</Text>
                        <View style={styles.coverageRow}>
                            {Object.entries(COVERAGE_OPTIONS).map(([key, opt]: any) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.coverageCard,
                                        coverage === key ? { borderColor: opt.color, backgroundColor: opt.color + '15' } : { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }
                                    ]}
                                    onPress={() => setCoverage(key)}
                                >
                                    <Text style={[styles.coverageName, { color: opt.color }]}>{opt.name}</Text>
                                    <Text style={[styles.coverageAmount, { color: colors.text }]}>{opt.amount}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity onPress={calculatePremium} activeOpacity={0.8}>
                        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.calcBtn}>
                            <MaterialCommunityIcons name="calculator" size={20} color="#fff" />
                            <Text style={styles.btnText}>Calculate Premium</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Results Area */}
                {result && (
                    <View style={[styles.resultContainer, { borderColor: result.color, backgroundColor: isDark ? '#1E293B' : '#F0F9FF' }]}>
                        <View style={styles.resultHeader}>
                            <Text style={[styles.planBadge, { backgroundColor: result.color }]}>{result.planName}</Text>
                            <Text style={[styles.coverageBadge, { color: result.color }]}>{result.coverageAmount} Cover</Text>
                        </View>

                        <View style={styles.premiumBox}>
                            <Text style={[styles.premiumLabel, { color: colors.subtext }]}>Estimated Annual Premium</Text>
                            <Text style={[styles.premiumValue, { color: colors.text }]}>₹{result.yearly.toLocaleString('en-IN')}</Text>
                            <Text style={[styles.premiumMonthly, { color: colors.primary }]}>~ ₹{result.monthly.toLocaleString('en-IN')}/mo</Text>
                        </View>

                        <View style={styles.benefitsList}>
                            <Text style={[styles.benefitTitle, { color: colors.text }]}>Plan Highlights:</Text>
                            {result.benefits.map((b: string, i: number) => (
                                <View key={i} style={styles.benefitRow}>
                                    <Ionicons name="checkmark-circle" size={16} color={result.color} />
                                    <Text style={[styles.benefitText, { color: colors.subtext }]}>{b}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.disclaimer}>* Indicative only. Verify with insurer.</Text>
                    </View>
                )}

                {/* Tips Section */}
                <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.tipHeader, { color: colors.text }]}>💡 Smart Tips</Text>
                    <Text style={[styles.tipText, { color: colors.subtext }]}>• Buy early to save up to 50%</Text>
                    <Text style={[styles.tipText, { color: colors.subtext }]}>• Family Floater is cost-effective</Text>
                    <Text style={[styles.tipText, { color: colors.subtext }]}>• Check for Room Rent limits</Text>
                </View>

                {/* Glossary (Accordion) */}
                <TouchableOpacity
                    style={[styles.termsHeader, { backgroundColor: colors.card }]}
                    onPress={() => setShowTerms(!showTerms)}
                >
                    <Text style={[styles.termsTitle, { color: colors.text }]}>Insurance Terms</Text>
                    <Ionicons name={showTerms ? "chevron-up" : "chevron-down"} size={20} color={colors.subtext} />
                </TouchableOpacity>

                {showTerms && (
                    <View style={[styles.termsBody, { backgroundColor: colors.card }]}>
                        {INSURANCE_TERMS.map((item, i) => (
                            <View key={i} style={styles.termItem}>
                                <Text style={[styles.termName, { color: colors.primary }]}>{item.term}</Text>
                                <Text style={[styles.termDesc, { color: colors.subtext }]}>{item.desc}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    backBtn: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    content: { padding: 16 },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    statText: { fontSize: 12, fontWeight: '600' },

    card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },

    formGroup: { marginBottom: 16 },
    label: { fontSize: 13, marginBottom: 8, fontWeight: '500' },
    input: { padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 16 },

    stepperContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepperBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    stepperText: { fontSize: 24, fontWeight: '300' },
    stepperValue: { fontSize: 18, fontWeight: '700' },

    toggleRow: { flexDirection: 'row', gap: 12 },
    toggleBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#334155', alignItems: 'center' },
    toggleActiveNo: { backgroundColor: '#10B981' },
    toggleActiveYes: { backgroundColor: '#EF4444' },
    toggleText: { color: '#94A3B8', fontWeight: '600' },
    hint: { fontSize: 11, color: '#64748B', marginTop: 6, fontStyle: 'italic' },

    coverageRow: { flexDirection: 'row', gap: 8 },
    coverageCard: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    coverageName: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
    coverageAmount: { fontSize: 11 },

    calcBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8, marginTop: 10 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    resultContainer: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 20 },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    planBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, color: '#fff', fontWeight: '700', fontSize: 12, overflow: 'hidden' },
    coverageBadge: { fontWeight: '700', fontSize: 14 },
    premiumBox: { alignItems: 'center', marginBottom: 20 },
    premiumLabel: { fontSize: 12, marginBottom: 4 },
    premiumValue: { fontSize: 32, fontWeight: '800' },
    premiumMonthly: { fontSize: 14, fontWeight: '600' },
    benefitsList: { gap: 8 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    benefitTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
    benefitText: { fontSize: 13 },
    disclaimer: { fontSize: 10, color: '#64748B', marginTop: 16, textAlign: 'center' },

    tipsCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    tipHeader: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    tipText: { fontSize: 13, marginBottom: 4 },

    termsHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 2 },
    termsTitle: { fontWeight: '600' },
    termsBody: { padding: 16, borderRadius: 12, marginTop: 4 },
    termItem: { marginBottom: 12 },
    termName: { fontWeight: '700', fontSize: 13 },
    termDesc: { fontSize: 12 },
});
