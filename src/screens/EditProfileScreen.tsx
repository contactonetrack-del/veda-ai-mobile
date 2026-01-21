/**
 * Edit Profile Screen - Enhanced
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ProfileService, UserProfileExtended } from '../services/ProfileService';
import { GlassView } from '../components/common/GlassView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();

    // Core Profile State
    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState<string | null>(null);

    // Extended State
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);

    // Socials
    const [twitter, setTwitter] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [instagram, setInstagram] = useState('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfileData();
    }, [user?.id]);

    const loadProfileData = async () => {
        if (!user?.id) return;

        // Load local avatar/dob logic if still needed, but primarily load from ProfileService
        const extendedProfile = await ProfileService.getProfile(user.id);

        if (extendedProfile) {
            setBio(extendedProfile.bio || '');
            setLocation(extendedProfile.location || '');
            setWebsite(extendedProfile.website || '');
            setCoverImage(extendedProfile.coverImage);

            if (extendedProfile.socials) {
                setTwitter(extendedProfile.socials.twitter || '');
                setLinkedin(extendedProfile.socials.linkedin || '');
                setInstagram(extendedProfile.socials.instagram || '');
            }
        }

        // Also check if we have a local avatar override from previous version
        const savedAvatar = await AsyncStorage.getItem(`user_avatar_${user.id}`);
        if (savedAvatar) setAvatar(savedAvatar);
    };

    const pickImage = async (type: 'avatar' | 'cover') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 0.5,
        });

        if (!result.canceled) {
            if (type === 'avatar') setAvatar(result.assets[0].uri);
            else setCoverImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter your name');
            return;
        }

        setLoading(true);
        try {
            // 1. Update basic auth profile
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: name,
                    photoURL: avatar
                });
            }

            if (user?.id) {
                // 2. Persist legacy parts (Name, Avatar)
                await AsyncStorage.setItem(`user_name_${user.id}`, name);
                if (avatar) await AsyncStorage.setItem(`user_avatar_${user.id}`, avatar);

                // 3. Persist Extended Profile via Service
                const extendedData: Partial<UserProfileExtended> = {
                    bio,
                    location,
                    website,
                    coverImage,
                    avatar, // Save avatar to profile service
                    socials: { twitter, linkedin, instagram }
                };
                await ProfileService.updateProfile(user.id, extendedData);
            }

            Alert.alert('Success', 'Profile updated!', [
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
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: colors.subtext, fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('edit_profile')}</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    <Text style={[styles.saveText, { color: colors.primary }]}>{loading ? t('saving') : t('save')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Cover Image Section */}
                <TouchableOpacity onPress={() => pickImage('cover')} style={styles.coverSection}>
                    {coverImage ? (
                        <Image source={{ uri: coverImage }} style={styles.coverImage} />
                    ) : (
                        <View style={[styles.coverPlaceholder, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                            <Ionicons name="image-outline" size={32} color={colors.subtext} />
                            <Text style={{ color: colors.subtext, marginTop: 8 }}>Add Cover Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Avatar Section - Overlapping */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={() => pickImage('avatar')}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={[styles.avatarImage, { borderColor: colors.background }]} />
                        ) : (
                            <LinearGradient colors={[colors.primary, '#059669']} style={[styles.avatarPlaceholder, { borderColor: colors.background }]}>
                                <Text style={{ fontSize: 32, color: '#FFF' }}>{name.charAt(0)}</Text>
                            </LinearGradient>
                        )}
                        <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <InputGroup label={t('full_name')} value={name} onChange={setName} colors={colors} />

                    <InputGroup label="Bio" value={bio} onChange={setBio} colors={colors} multiline />

                    <InputGroup label="Location" value={location} onChange={setLocation} colors={colors} placeholder="New York, USA" />

                    <InputGroup label="Website" value={website} onChange={setWebsite} colors={colors} placeholder="yourwebsite.com" />

                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Social Links</Text>

                    <View style={styles.socialInputRow}>
                        <MaterialCommunityIcons name="twitter" size={20} color={colors.subtext} style={styles.socialIcon} />
                        <TextInput
                            style={[styles.socialInput, { color: colors.text, borderBottomColor: colors.cardBorder }]}
                            value={twitter}
                            onChangeText={setTwitter}
                            placeholder="Twitter username"
                            placeholderTextColor={colors.subtext}
                        />
                    </View>
                    <View style={styles.socialInputRow}>
                        <MaterialCommunityIcons name="linkedin" size={20} color={colors.subtext} style={styles.socialIcon} />
                        <TextInput
                            style={[styles.socialInput, { color: colors.text, borderBottomColor: colors.cardBorder }]}
                            value={linkedin}
                            onChangeText={setLinkedin}
                            placeholder="LinkedIn URL"
                            placeholderTextColor={colors.subtext}
                        />
                    </View>
                    <View style={styles.socialInputRow}>
                        <MaterialCommunityIcons name="instagram" size={20} color={colors.subtext} style={styles.socialIcon} />
                        <TextInput
                            style={[styles.socialInput, { color: colors.text, borderBottomColor: colors.cardBorder }]}
                            value={instagram}
                            onChangeText={setInstagram}
                            placeholder="Instagram username"
                            placeholderTextColor={colors.subtext}
                        />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const InputGroup = ({ label, value, onChange, colors, multiline, placeholder }: any) => (
    <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text>
        <TextInput
            style={[
                styles.input,
                {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                    height: multiline ? 80 : 50,
                    textAlignVertical: multiline ? 'top' : 'center'
                }
            ]}
            value={value}
            onChangeText={onChange}
            multiline={multiline}
            placeholder={placeholder}
            placeholderTextColor={colors.subtext}
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 17, fontWeight: '600' },
    saveText: { fontSize: 16, fontWeight: '600' },
    content: { paddingBottom: 40 },
    coverSection: {
        height: 150,
        width: '100%',
    },
    coverImage: { width: '100%', height: '100%' },
    coverPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: -50,
        marginBottom: 20,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    form: { paddingHorizontal: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
    input: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 16,
    },
    socialInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    socialIcon: { marginRight: 12 },
    socialInput: {
        flex: 1,
        borderBottomWidth: 1,
        paddingVertical: 8,
        fontSize: 16,
    },
});
