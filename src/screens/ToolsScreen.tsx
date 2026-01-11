/**
 * Tools Screen - Health Metrics Calculator
 * Features: BMI, BMR, TDEE, Target Calories, Ideal Weight, Personalized Tips
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

// Activity Levels
const ACTIVITY_LEVELS = [
    { value: 1.2, label: 'Sedentary', desc: 'No exercise' },
    { value: 1.375, label: 'Light', desc: '1-3 days/week' },
    { value: 1.55, label: 'Moderate', desc: '3-5 days/week' },
    { value: 1.725, label: 'Active', desc: '6-7 days/week' },
    { value: 1.9, label: 'Very Active', desc: 'Physical job' },
];

// Goals
const GOALS = [
    { value: -500, label: 'Lose Weight', color: '#3B82F6' },
    { value: 0, label: 'Maintain', color: '#10B981' },
    { value: 500, label: 'Gain Weight', color: '#F59E0B' },
];

export default function ToolsScreen() {
    const navigation = useNavigation<any>();
    const { t } = useLanguage();
    const { colors, isDark } = useTheme();

    // Inputs
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [activity, setActivity] = useState(1.55);
    const [goal, setGoal] = useState(0);

    // Results
    const [results, setResults] = useState<any>(null);

    function calculateAll() {
        const h = parseFloat(height);
        const w = parseFloat(weight);
        const a = parseInt(age);

        if (!h || !w || !a || h <= 0 || w <= 0 || a <= 0) {
            Alert.alert('Missing Info', 'Please enter valid height, weight, and age.');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const heightM = h / 100;

        // 1. BMI
        const bmi = w / (heightM * heightM);
        let bmiCategory = { label: 'Normal', color: '#10B981', advice: 'Keep it up!' };
        if (bmi < 18.5) bmiCategory = { label: 'Underweight', color: '#3B82F6', advice: 'Eat more nutrient-dense foods.' };
        else if (bmi >= 25 && bmi < 30) bmiCategory = { label: 'Overweight', color: '#F59E0B', advice: 'Focus on fiber and cardio.' };
        else if (bmi >= 30) bmiCategory = { label: 'Obese', color: '#EF4444', advice: 'Consult a health expert.' };

        // 2. BMR (Mifflin-St Jeor)
        let bmr = (10 * w) + (6.25 * h) - (5 * a) + (gender === 'male' ? 5 : -161);

        // 3. TDEE
        const tdee = bmr * activity;

        // 4. Target Calories
        const targetCalories = tdee + goal;

        // 5. Ideal Weight
        const minW = 18.5 * heightM * heightM;
        const maxW = 24.9 * heightM * heightM;

        // 6. Water & Protein
        const water = w * 0.033;
        const proteinMin = w * 0.8;
        const proteinMax = w * 1.2;

        setResults({
            bmi: bmi.toFixed(1),
            bmiCategory,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories: Math.round(targetCalories),
            idealWeight: `${minW.toFixed(1)} - ${maxW.toFixed(1)}`,
            water: water.toFixed(1),
            protein: `${Math.round(proteinMin)} - ${Math.round(proteinMax)}`,
        });
    }

    function reset() {
        Haptics.selectionAsync();
        setHeight('');
        setWeight('');
        setAge('');
        setGender('male');
        setResults(null);
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            {/* Header */}
            <LinearGradient colors={[colors.card, colors.background]} style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <MaterialCommunityIcons name="toolbox" size={24} color={colors.primary} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('health_tools')}</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Quick Links (Top) */}
                <View style={styles.quickLinks}>
                    <TouchableOpacity
                        style={[styles.linkCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                        onPress={() => navigation.navigate('CalorieCounter')}
                    >
                        <MaterialCommunityIcons name="fire" size={24} color="#F59E0B" />
                        <Text style={[styles.linkText, { color: colors.text }]}>{t('calorie_counter')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.linkCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                        onPress={() => navigation.navigate('InsuranceEstimator')}
                    >
                        <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
                        <Text style={[styles.linkText, { color: colors.text }]}>Insurance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.linkCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                        onPress={() => navigation.navigate('SnapThali')}
                    >
                        <Ionicons name="camera" size={24} color="#8B5CF6" />
                        <Text style={[styles.linkText, { color: colors.text }]}>Snap Thali</Text>
                    </TouchableOpacity>
                </View>

                {/* Calculator */}
                <View style={[styles.calculatorSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.calcHeader}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.calcIcon}>
                            <Ionicons name="calculator" size={20} color="#fff" />
                        </LinearGradient>
                        <Text style={[styles.calcTitle, { color: colors.text }]}>Health Metrics Calculator</Text>
                    </View>

                    {/* Inputs Grid */}
                    <View style={styles.inputGrid}>
                        {/* Height & Weight */}
                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Text style={[styles.label, { color: colors.subtext }]}>{t('height_cm')}</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={height}
                                    onChangeText={setHeight}
                                    placeholder="170"
                                    placeholderTextColor={colors.subtext}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Text style={[styles.label, { color: colors.subtext }]}>{t('weight_kg')}</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={weight}
                                    onChangeText={setWeight}
                                    placeholder="70"
                                    placeholderTextColor={colors.subtext}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Age & Gender */}
                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Text style={[styles.label, { color: colors.subtext }]}>Age</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={age}
                                    onChangeText={setAge}
                                    placeholder="25"
                                    placeholderTextColor={colors.subtext}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.genderToggle}>
                                <TouchableOpacity
                                    style={[
                                        styles.genderBtn,
                                        { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                        gender === 'male' && { backgroundColor: '#10B981', borderColor: '#10B981' }
                                    ]}
                                    onPress={() => setGender('male')}
                                >
                                    <Ionicons name="male" size={18} color={gender === 'male' ? '#fff' : colors.subtext} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.genderBtn,
                                        { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                        gender === 'female' && { backgroundColor: '#10B981', borderColor: '#10B981' }
                                    ]}
                                    onPress={() => setGender('female')}
                                >
                                    <Ionicons name="female" size={18} color={gender === 'female' ? '#fff' : colors.subtext} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Activity Level */}
                        <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Activity Level</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                            {ACTIVITY_LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level.value}
                                    style={[
                                        styles.selectionChip,
                                        activity === level.value ? { backgroundColor: colors.primary } : { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }
                                    ]}
                                    onPress={() => setActivity(level.value)}
                                >
                                    <Text style={[styles.chipText, { color: activity === level.value ? '#fff' : colors.subtext }]}>{level.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Goal */}
                        <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Your Goal</Text>
                        <View style={styles.goalContainer}>
                            {GOALS.map((g) => (
                                <TouchableOpacity
                                    key={g.value}
                                    style={[
                                        styles.goalChip,
                                        goal === g.value ? { backgroundColor: g.color, borderColor: g.color } : { borderColor: colors.inputBorder }
                                    ]}
                                    onPress={() => setGoal(g.value)}
                                >
                                    <Text style={[styles.goalText, { color: goal === g.value ? '#fff' : colors.subtext }]}>{g.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.calcBtn} onPress={calculateAll}>
                                <LinearGradient colors={['#10B981', '#059669']} style={styles.gradientBtn}>
                                    <Text style={styles.btnText}>Calculate Metrics</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
                                <Text style={{ color: colors.subtext }}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Results Section */}
                {results && (
                    <View style={styles.resultsContainer}>
                        {/* Main Stats */}
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]}>
                                <Text style={[styles.statLabel, { color: colors.subtext }]}>BMI</Text>
                                <Text style={[styles.statValue, { color: results.bmiCategory.color }]}>{results.bmi}</Text>
                                <Text style={[styles.statSub, { color: results.bmiCategory.color }]}>{results.bmiCategory.label}</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]}>
                                <Text style={[styles.statLabel, { color: colors.subtext }]}>Target</Text>
                                <Text style={[styles.statValue, { color: '#F59E0B' }]}>{results.targetCalories}</Text>
                                <Text style={[styles.statSub, { color: colors.subtext }]}>kcal/day</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]}>
                                <Text style={[styles.statLabel, { color: colors.subtext }]}>BMI</Text>
                                <Text style={[styles.statValue, { color: results.bmiCategory.color }]}>{results.bmi}</Text>
                                <Text style={[styles.statSub, { color: results.bmiCategory.color }]}>{results.bmiCategory.label}</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]}>
                                <Text style={[styles.statLabel, { color: colors.subtext }]}>Target</Text>
                                <Text style={[styles.statValue, { color: '#F59E0B' }]}>{results.targetCalories}</Text>
                                <Text style={[styles.statSub, { color: colors.subtext }]}>kcal/day</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]}>
                                <Text style={[styles.statLabel, { color: colors.subtext }]}>BMR</Text>
                                <Text style={[styles.statValue, { color: '#3B82F6' }]}>{results.bmr}</Text>
                                <Text style={[styles.statSub, { color: colors.subtext }]}>Resting Burn</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]}>
                                <Text style={[styles.statLabel, { color: colors.subtext }]}>TDEE</Text>
                                <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{results.tdee}</Text>
                                <Text style={[styles.statSub, { color: colors.subtext }]}>Daily Burn</Text>
                            </View>
                        </View>

                        {/* Details */}
                        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={styles.detailRow}>
                                <Ionicons name="body" size={20} color={colors.primary} />
                                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Ideal Weight:</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{results.idealWeight} kg</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="water" size={20} color="#3B82F6" />
                                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Water Intake:</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{results.water} L</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <MaterialCommunityIcons name="food-steak" size={20} color="#F59E0B" />
                                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Protein:</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{results.protein} g</Text>
                            </View>
                        </View>
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
    headerTitle: { fontSize: 20, fontWeight: '700', marginLeft: 12 },
    content: { padding: 16 },

    // Quick Links
    quickLinks: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    linkCard: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, marginHorizontal: 4 },
    linkText: { fontSize: 12, fontWeight: '600', marginTop: 8 },

    // Calculator
    calculatorSection: { borderRadius: 16, padding: 16, borderWidth: 1 },
    calcHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    calcIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    calcTitle: { fontSize: 16, fontWeight: '700' },

    inputGrid: { gap: 12 },
    row: { flexDirection: 'row', gap: 12 },
    inputWrapper: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1 },
    label: { fontSize: 12, marginBottom: 4 },
    input: { fontSize: 16, fontWeight: '600' },

    genderToggle: { flexDirection: 'row', gap: 8, flex: 1, alignItems: 'center' },
    genderBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    genderActive: { backgroundColor: '#10B981', borderColor: '#10B981' },

    sectionLabel: { fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 4 },
    selectorScroll: { flexDirection: 'row', marginBottom: 8 },
    selectionChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
    chipText: { fontSize: 13, fontWeight: '600' },

    goalContainer: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
    goalChip: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    goalText: { fontSize: 12, fontWeight: '700' },

    actions: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
    calcBtn: { flex: 1 },
    gradientBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '700' },
    resetBtn: { padding: 14 },

    // Results
    resultsContainer: { marginTop: 20 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
    statLabel: { fontSize: 12, fontWeight: '600' },
    statValue: { fontSize: 24, fontWeight: '800', marginVertical: 4 },
    statSub: { fontSize: 11 },

    detailsCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailLabel: { flex: 1, marginLeft: 10, fontSize: 14 },
    detailValue: { fontWeight: '700', fontSize: 16 },
});
