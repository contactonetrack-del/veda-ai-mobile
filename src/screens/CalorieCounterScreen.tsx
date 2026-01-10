/**
 * Calorie Counter Screen - Indian Food Database
 * Track daily calories with common Indian foods
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    TextInput,
    FlatList,
    Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'react-native';

// Indian Food Database with nutritional info
const FOOD_DATABASE = [
    { id: '1', name: 'Roti', nameHi: 'रोटी', serving: '1 pc (30g)', calories: 72, protein: 2.1, carbs: 15, fat: 0.4, category: 'bread' },
    { id: '2', name: 'Rice', nameHi: 'चावल', serving: '1 cup (150g)', calories: 206, protein: 4.3, carbs: 45, fat: 0.4, category: 'grain' },
    { id: '3', name: 'Dal', nameHi: 'दाल', serving: '1 bowl (150ml)', calories: 150, protein: 9, carbs: 20, fat: 5, category: 'protein' },
    { id: '4', name: 'Sabzi', nameHi: 'सब्ज़ी', serving: '1 bowl (100g)', calories: 80, protein: 2, carbs: 10, fat: 4, category: 'vegetable' },
    { id: '5', name: 'Poha', nameHi: 'पोहा', serving: '1 plate (150g)', calories: 250, protein: 5, carbs: 45, fat: 6, category: 'breakfast' },
    { id: '6', name: 'Paratha', nameHi: 'पराठा', serving: '1 pc (50g)', calories: 160, protein: 4, carbs: 25, fat: 5, category: 'bread' },
    { id: '7', name: 'Idli', nameHi: 'इडली', serving: '2 pcs (60g)', calories: 78, protein: 2, carbs: 15, fat: 0.5, category: 'breakfast' },
    { id: '8', name: 'Dosa', nameHi: 'डोसा', serving: '1 pc (100g)', calories: 168, protein: 4, carbs: 28, fat: 4, category: 'breakfast' },
    { id: '9', name: 'Curd', nameHi: 'दही', serving: '1 bowl (100g)', calories: 60, protein: 3, carbs: 5, fat: 3, category: 'dairy' },
    { id: '10', name: 'Banana', nameHi: 'केला', serving: '1 medium (120g)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: 'fruit' },
    { id: '11', name: 'Chai', nameHi: 'चाय', serving: '1 cup (150ml)', calories: 50, protein: 1, carbs: 8, fat: 2, category: 'beverage' },
    { id: '12', name: 'Paneer', nameHi: 'पनीर', serving: '100g', calories: 265, protein: 18, carbs: 4, fat: 20, category: 'protein' },
    { id: '13', name: 'Egg', nameHi: 'अंडा', serving: '1 boiled', calories: 78, protein: 6, carbs: 0.5, fat: 5, category: 'protein' },
    { id: '14', name: 'Chapati', nameHi: 'चपाती', serving: '1 pc (40g)', calories: 104, protein: 3, carbs: 20, fat: 1, category: 'bread' },
    { id: '15', name: 'Upma', nameHi: 'उपमा', serving: '1 plate (150g)', calories: 220, protein: 5, carbs: 35, fat: 7, category: 'breakfast' },
];

// Quick add foods (most common)
const QUICK_ADD_FOODS = ['1', '2', '3', '4', '11']; // Roti, Rice, Dal, Sabzi, Chai

interface MealEntry {
    id: string;
    foodId: string;
    foodName: string;
    calories: number;
    quantity: number;
    meal: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
    timestamp: Date;
}

interface CalorieCounterScreenProps {
    navigation: any;
}

export default function CalorieCounterScreen({ navigation }: CalorieCounterScreenProps) {
    const { colors, isDark } = useTheme();
    const [dailyGoal] = useState(2000);
    const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch');
    const [showSearch, setShowSearch] = useState(false);

    const totalCalories = todaysMeals.reduce((sum, entry) => sum + entry.calories * entry.quantity, 0);
    const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

    const filteredFoods = FOOD_DATABASE.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.nameHi.includes(searchQuery)
    );

    function addFood(food: typeof FOOD_DATABASE[0], quantity: number = 1) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const entry: MealEntry = {
            id: Date.now().toString(),
            foodId: food.id,
            foodName: food.name,
            calories: food.calories,
            quantity,
            meal: selectedMeal,
            timestamp: new Date(),
        };
        setTodaysMeals([...todaysMeals, entry]);
        setShowSearch(false);
        setSearchQuery('');
    }

    function removeEntry(entryId: string) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTodaysMeals(todaysMeals.filter(e => e.id !== entryId));
    }

    function getMealCalories(meal: string) {
        return todaysMeals
            .filter(e => e.meal === meal)
            .reduce((sum, e) => sum + e.calories * e.quantity, 0);
    }

    const progressColor = progress < 50 ? '#10B981' : progress < 80 ? '#F59E0B' : '#EF4444';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
            {/* Header */}
            <LinearGradient colors={[colors.card, colors.background]} style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Calorie Counter</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Progress Card */}
                <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.progressRing}>
                        <View style={[styles.progressCircle, { borderColor: progressColor, backgroundColor: colors.inputBg }]}>
                            <Text style={[styles.calorieCount, { color: colors.text }]}>{totalCalories}</Text>
                            <Text style={[styles.calorieLabel, { color: colors.subtext }]}>kcal</Text>
                        </View>
                    </View>
                    <View style={styles.progressInfo}>
                        <Text style={[styles.goalText, { color: colors.subtext }]}>Daily Goal: {dailyGoal} kcal</Text>
                        <View style={[styles.progressBar, { backgroundColor: colors.inputBg }]}>
                            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progressColor }]} />
                        </View>
                        <Text style={[styles.remainingText, { color: colors.subtext }]}>
                            {dailyGoal - totalCalories > 0
                                ? `${dailyGoal - totalCalories} kcal remaining`
                                : `${totalCalories - dailyGoal} kcal over!`}
                        </Text>
                    </View>
                </View>

                {/* Meal Selector */}
                <View style={styles.mealSelector}>
                    {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map(meal => (
                        <TouchableOpacity
                            key={meal}
                            style={[
                                styles.mealTab,
                                { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                selectedMeal === meal && styles.mealTabActive
                            ]}
                            onPress={() => { Haptics.selectionAsync(); setSelectedMeal(meal); }}
                        >
                            <MaterialCommunityIcons
                                name={meal === 'breakfast' ? 'coffee' : meal === 'lunch' ? 'food' : meal === 'dinner' ? 'food-variant' : 'cookie'}
                                size={18}
                                color={selectedMeal === meal ? colors.primary : colors.subtext}
                            />
                            <Text style={[styles.mealTabText, { color: colors.subtext }, selectedMeal === meal && styles.mealTabTextActive]}>
                                {meal.charAt(0).toUpperCase() + meal.slice(1)}
                            </Text>
                            <Text style={[styles.mealCalories, { color: colors.subtext }]}>{getMealCalories(meal)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Add */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Add</Text>
                    <View style={styles.quickAddGrid}>
                        {QUICK_ADD_FOODS.map(id => {
                            const food = FOOD_DATABASE.find(f => f.id === id)!;
                            return (
                                <TouchableOpacity
                                    key={id}
                                    style={[styles.quickAddButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                                    onPress={() => addFood(food)}
                                >
                                    <Text style={styles.quickAddEmoji}>
                                        {food.category === 'bread' ? '🫓' : food.category === 'grain' ? '🍚' :
                                            food.category === 'protein' ? '🥘' : food.category === 'vegetable' ? '🥗' : '☕'}
                                    </Text>
                                    <Text style={[styles.quickAddName, { color: colors.text }]}>{food.name}</Text>
                                    <Text style={[styles.quickAddCal, { color: colors.subtext }]}>{food.calories} kcal</Text>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity
                            style={[styles.quickAddButton, styles.searchButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
                            onPress={() => setShowSearch(true)}
                        >
                            <Ionicons name="search" size={24} color={colors.primary} />
                            <Text style={[styles.quickAddName, { color: colors.text }]}>Search</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Modal */}
                {showSearch && (
                    <View style={[styles.searchSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.searchHeader}>
                            <TextInput
                                style={[styles.searchInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                                placeholder="Search food..."
                                placeholderTextColor={colors.subtext}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
                                <Ionicons name="close" size={24} color={colors.subtext} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={filteredFoods}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.foodItem, { borderBottomColor: colors.cardBorder }]} onPress={() => addFood(item)}>
                                    <View>
                                        <Text style={[styles.foodName, { color: colors.text }]}>{item.name} ({item.nameHi})</Text>
                                        <Text style={[styles.foodServing, { color: colors.subtext }]}>{item.serving}</Text>
                                    </View>
                                    <View style={styles.foodNutrients}>
                                        <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                                        <Text style={[styles.foodMacros, { color: colors.subtext }]}>P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            style={styles.searchResults}
                            nestedScrollEnabled
                        />
                    </View>
                )}

                {/* Today's Log */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Log</Text>
                    {todaysMeals.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.subtext }]}>No meals logged yet. Start adding food!</Text>
                    ) : (
                        todaysMeals.map(entry => (
                            <View key={entry.id} style={[styles.logEntry, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                                <View>
                                    <Text style={[styles.logFood, { color: colors.text }]}>{entry.foodName}</Text>
                                    <Text style={[styles.logMeal, { color: colors.subtext }]}>{entry.meal} • {entry.quantity}x</Text>
                                </View>
                                <View style={styles.logRight}>
                                    <Text style={styles.logCalories}>{entry.calories * entry.quantity} kcal</Text>
                                    <TouchableOpacity onPress={() => removeEntry(entry.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    content: { flex: 1, padding: 16 },
    progressCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
        marginBottom: 20,
    },
    progressRing: { marginRight: 20 },
    progressCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
    },
    calorieCount: { fontSize: 24, fontWeight: '800', color: '#fff' },
    calorieLabel: { fontSize: 12, color: '#94A3B8' },
    progressInfo: { flex: 1, justifyContent: 'center' },
    goalText: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
    progressBar: { height: 8, backgroundColor: '#1E293B', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    remainingText: { fontSize: 13, color: '#64748B', marginTop: 8 },
    mealSelector: { flexDirection: 'row', marginBottom: 20 },
    mealTab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#0F172A',
        marginHorizontal: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    mealTabActive: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    mealTabText: { fontSize: 11, color: '#64748B', marginTop: 4 },
    mealTabTextActive: { color: '#10B981' },
    mealCalories: { fontSize: 10, color: '#475569', marginTop: 2 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
    quickAddGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    quickAddButton: {
        width: '30%',
        backgroundColor: '#0F172A',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    searchButton: { borderColor: '#10B981', borderStyle: 'dashed' },
    quickAddEmoji: { fontSize: 24, marginBottom: 4 },
    quickAddName: { fontSize: 12, color: '#fff', fontWeight: '600' },
    quickAddCal: { fontSize: 10, color: '#64748B', marginTop: 2 },
    searchSection: { backgroundColor: '#0F172A', borderRadius: 12, padding: 12, marginBottom: 20 },
    searchHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    searchInput: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        marginRight: 12,
    },
    searchResults: { maxHeight: 200 },
    foodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    foodName: { fontSize: 14, color: '#fff', fontWeight: '600' },
    foodServing: { fontSize: 12, color: '#64748B', marginTop: 2 },
    foodNutrients: { alignItems: 'flex-end' },
    foodCalories: { fontSize: 14, color: '#10B981', fontWeight: '700' },
    foodMacros: { fontSize: 10, color: '#64748B', marginTop: 2 },
    emptyText: { color: '#64748B', textAlign: 'center', padding: 20 },
    logEntry: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    logFood: { fontSize: 14, color: '#fff', fontWeight: '600' },
    logMeal: { fontSize: 12, color: '#64748B', marginTop: 2, textTransform: 'capitalize' },
    logRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logCalories: { fontSize: 14, color: '#10B981', fontWeight: '700' },
});
