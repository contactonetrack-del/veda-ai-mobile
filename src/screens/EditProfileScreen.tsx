/**
 * Edit Profile Screen - Premium UI
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Alert,
    Platform,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();

    // State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [dob, setDob] = useState(''); // Allow string or use a date picker
    const [avatar, setAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Load extra profile data stored in AsyncStorage (DOB, Avatar)
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const savedDob = await AsyncStorage.getItem(`user_dob_${user?.id}`);
                const savedAvatar = await AsyncStorage.getItem(`user_avatar_${user?.id}`);
                if (savedDob) setDob(savedDob);
                if (savedAvatar) setAvatar(savedAvatar);
            } catch (e) {
                console.log('Error loading profile data', e);
            }
        };
        if (user?.id) loadProfileData();
    }, [user?.id]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to change your photo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true, // we might need base64 if we want to store it simply or use URI
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter your name');
            return;
        }

        setLoading(true);
        try {
            // 1. Update basic auth profile if supported
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: name });
            }

            // 2. Persist local data (DOB, Avatar, Name override)
            if (user?.id) {
                await AsyncStorage.setItem(`user_name_${user?.id}`, name);
                await AsyncStorage.setItem(`user_dob_${user?.id}`, dob);
                if (avatar) {
                    await AsyncStorage.setItem(`user_avatar_${user?.id}`, avatar);
                }
            }

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('edit_profile')}</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    <Text style={[styles.saveText, { color: colors.primary }]}>{loading ? t('saving') : t('save')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatarImage} />
                        ) : (
                            <LinearGradient colors={[colors.primary, '#059669']} style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={40} color="#FFF" />
                            </LinearGradient>
                        )}
                        <View style={[styles.cameraIconBadge, { borderColor: colors.background, backgroundColor: colors.accent }]}>
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.changePhotoText, { color: colors.primary }]}>{t('change_photo')}</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.subtext }]}>{t('full_name')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                            value={name}
                            onChangeText={setName}
                            placeholder={t('enter_name')}
                            placeholderTextColor={colors.subtext}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.subtext }]}>{t('email_address')}</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0', borderColor: colors.inputBorder, color: colors.subtext }]}
                            value={email}
                            editable={false}
                            placeholder="your@email.com"
                            placeholderTextColor={colors.subtext}
                        />
                        <Text style={[styles.helperText, { color: colors.subtext }]}>{t('email_cannot_change')}</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.subtext }]}>{t('dob')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                            value={dob}
                            onChangeText={setDob}
                            placeholder="DD/MM/YYYY"
                            placeholderTextColor={colors.subtext}
                        />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        padding: 8,
    },
    content: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    changePhotoText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '500',
    },
    formContainer: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    disabledInput: {
        opacity: 0.5,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
    },
});
