/**
 * Snap Your Thali Screen
 * Camera-based food recognition with Gemini Vision AI
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { analyzeThaliImage, VisionAnalysisResult } from '../services/geminiVision';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'react-native';

export default function SnapThaliScreen({ navigation }: { navigation: any }) {
    const { colors, isDark } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<VisionAnalysisResult | null>(null);
    const cameraRef = useRef<any>(null);

    // Loading state
    if (!permission) {
        return <View style={[styles.container, { backgroundColor: colors.background }]} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <MaterialCommunityIcons name="camera-off" size={64} color="#64748B" />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>
                    Allow camera access to photograph your thali for nutritional analysis.
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Enable Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    async function handleCapture() {
        if (cameraRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
            setCapturedImage(photo.uri);
            setResult(null);
        }
    }

    async function handlePickImage() {
        Haptics.selectionAsync();
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 0.5,
        });

        if (!result.canceled && result.assets[0]) {
            setCapturedImage(result.assets[0].uri);
            setResult(null);
        }
    }

    async function handleAnalyze() {
        if (!capturedImage) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setAnalyzing(true);

        try {
            // Get base64 from image
            const response = await fetch(capturedImage);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const analysisResult = await analyzeThaliImage(base64);

                if (analysisResult.success) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setResult(analysisResult);
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    Alert.alert('Analysis Failed', analysisResult.error || 'Could not analyze image');
                }
                setAnalyzing(false);
            };

            reader.readAsDataURL(blob);
        } catch (error: any) {
            setAnalyzing(false);
            Alert.alert('Error', error.message);
        }
    }

    function handleRetake() {
        Haptics.selectionAsync();
        setCapturedImage(null);
        setResult(null);
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
            {/* Header */}
            <LinearGradient colors={[colors.card, colors.background]} style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Snap Your Thali 📷</Text>
                <TouchableOpacity onPress={handlePickImage} style={styles.galleryButton}>
                    <Ionicons name="images" size={22} color={colors.primary} />
                </TouchableOpacity>
            </LinearGradient>

            {capturedImage ? (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Captured Image */}
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                            <Ionicons name="refresh" size={20} color="#fff" />
                            <Text style={styles.retakeButtonText}>Retake</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.analyzeButton}
                            onPress={handleAnalyze}
                            disabled={analyzing}
                        >
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.analyzeGradient}
                            >
                                {analyzing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="brain" size={22} color="#fff" />
                                        <Text style={styles.analyzeButtonText}>Analyze</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Results */}
                    {result && (
                        <View style={styles.resultsContainer}>
                            <Text style={styles.resultsTitle}>🍽️ Nutritional Analysis</Text>

                            {/* Totals */}
                            <View style={styles.totalsCard}>
                                <View style={styles.totalItem}>
                                    <Text style={styles.totalValue}>{result.totalCalories}</Text>
                                    <Text style={styles.totalLabel}>Calories</Text>
                                </View>
                                <View style={styles.totalItem}>
                                    <Text style={styles.totalValue}>{result.totalProtein}g</Text>
                                    <Text style={styles.totalLabel}>Protein</Text>
                                </View>
                                <View style={styles.totalItem}>
                                    <Text style={styles.totalValue}>{result.totalCarbs}g</Text>
                                    <Text style={styles.totalLabel}>Carbs</Text>
                                </View>
                                <View style={styles.totalItem}>
                                    <Text style={styles.totalValue}>{result.totalFat}g</Text>
                                    <Text style={styles.totalLabel}>Fat</Text>
                                </View>
                            </View>

                            {/* Food Items */}
                            <Text style={styles.sectionTitle}>Detected Foods</Text>
                            {result.foods.map((food, index) => (
                                <View key={index} style={styles.foodItem}>
                                    <View style={styles.foodHeader}>
                                        <Text style={styles.foodName}>{food.name}</Text>
                                        <Text style={styles.foodHindi}>{food.nameHindi}</Text>
                                    </View>
                                    <Text style={styles.foodPortion}>{food.portion}</Text>
                                    <View style={styles.foodMacros}>
                                        <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                                        <Text style={styles.foodMacro}>P: {food.protein}g</Text>
                                        <Text style={styles.foodMacro}>C: {food.carbs}g</Text>
                                        <Text style={styles.foodMacro}>F: {food.fat}g</Text>
                                    </View>
                                </View>
                            ))}

                            {/* Health Tips */}
                            {result.healthTips && (
                                <View style={styles.tipsCard}>
                                    <Ionicons name="bulb" size={20} color="#FCD34D" />
                                    <Text style={styles.tipsText}>{result.healthTips}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            ) : (
                /* Camera View */
                <View style={styles.cameraContainer}>
                    <CameraView ref={cameraRef} style={styles.camera} facing="back">
                        <View style={styles.cameraOverlay}>
                            <View style={styles.frameGuide}>
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                            </View>
                            <Text style={styles.guideText}>Position your thali in the frame</Text>
                        </View>
                    </CameraView>

                    <View style={styles.captureContainer}>
                        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    galleryButton: { padding: 8 },
    permissionContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', padding: 32 },
    permissionTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 20 },
    permissionText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 10, lineHeight: 20 },
    permissionButton: { backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
    permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    cameraContainer: { flex: 1 },
    camera: { flex: 1 },
    cameraOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    frameGuide: { width: 280, height: 280, position: 'relative' },
    corner: { position: 'absolute', width: 40, height: 40, borderColor: '#10B981' },
    topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
    topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
    guideText: { color: '#94A3B8', fontSize: 14, marginTop: 20 },
    captureContainer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
    captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
    content: { flex: 1, padding: 16 },
    imageContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
    capturedImage: { width: '100%', height: 280, borderRadius: 16 },
    actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    retakeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', paddingVertical: 14, borderRadius: 12, gap: 8 },
    retakeButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    analyzeButton: { flex: 2, borderRadius: 12, overflow: 'hidden' },
    analyzeGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
    analyzeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    resultsContainer: { marginTop: 8 },
    resultsTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16, textAlign: 'center' },
    totalsCard: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 16, padding: 16, marginBottom: 20 },
    totalItem: { flex: 1, alignItems: 'center' },
    totalValue: { fontSize: 24, fontWeight: '800', color: '#10B981' },
    totalLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: '#F8FAFC', marginBottom: 12 },
    foodItem: { backgroundColor: '#0F172A', borderRadius: 12, padding: 14, marginBottom: 10 },
    foodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    foodName: { fontSize: 15, fontWeight: '600', color: '#fff' },
    foodHindi: { fontSize: 14, color: '#94A3B8' },
    foodPortion: { fontSize: 12, color: '#64748B', marginTop: 4 },
    foodMacros: { flexDirection: 'row', marginTop: 10, gap: 12 },
    foodCalories: { fontSize: 13, fontWeight: '700', color: '#10B981' },
    foodMacro: { fontSize: 12, color: '#64748B' },
    tipsCard: { flexDirection: 'row', backgroundColor: 'rgba(252, 211, 77, 0.1)', borderRadius: 12, padding: 14, marginTop: 16, alignItems: 'flex-start' },
    tipsText: { flex: 1, marginLeft: 10, color: '#F8FAFC', fontSize: 13, lineHeight: 18 },
});
