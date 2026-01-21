import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    Platform,
    TextInput
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import LanguageService, { LANGUAGES } from '../services/LanguageService';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LanguageSettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function LanguageSettingsModal({ visible, onClose }: LanguageSettingsModalProps) {
    const { colors, isDark } = useTheme();
    const { i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLang, setSelectedLang] = useState(i18n.language);
    const insets = useSafeAreaInsets();

    // Collapsible states
    const [showIndian, setShowIndian] = useState(true);
    const [showGlobal, setShowGlobal] = useState(true);

    useEffect(() => {
        if (visible) {
            setSelectedLang(i18n.language);
        }
    }, [visible, i18n.language]);

    const filteredLanguages = LANGUAGES.filter(lang =>
    (lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const indianLanguages = filteredLanguages.filter(l => l.category === 'Indian');
    const globalLanguages = filteredLanguages.filter(l => l.category === 'Global');

    const handleSelect = async (langCode: string) => {
        Haptics.selectionAsync();
        setSelectedLang(langCode);
        await LanguageService.setLanguage(langCode);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => onClose(), 300);
    };

    const renderLanguageItem = (item: any, section: 'Indian' | 'Global') => {
        const isSelected = selectedLang === item.code;
        // Unique key for list items, especially if English is duplicated visually
        const itemKey = `${section}-${item.code}`;

        return (
            <TouchableOpacity
                key={itemKey}
                style={[
                    styles.langItem,
                    {
                        backgroundColor: isSelected ? (isDark ? '#1E293B' : '#EFF6FF') : 'transparent',
                        borderColor: isSelected ? colors.primary : 'transparent'
                    }
                ]}
                onPress={() => handleSelect(item.code)}
            >
                <View style={styles.langInfo}>
                    <Text style={[
                        styles.langNative,
                        {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected ? '700' : '500'
                        }
                    ]}>
                        {item.nativeName}
                    </Text>
                    <Text style={[styles.langEnglish, { color: colors.subtext }]}>
                        {item.name}
                    </Text>
                </View>
                {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = (title: string, count: number, isOpen: boolean, onToggle: () => void) => (
        <TouchableOpacity
            style={[styles.sectionHeader, { backgroundColor: isDark ? colors.card : '#F8FAFC' }]}
            onPress={() => {
                Haptics.selectionAsync();
                onToggle();
            }}
            activeOpacity={0.7}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
                <View style={[styles.badge, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <Text style={[styles.badgeText, { color: colors.subtext }]}>{count}</Text>
                </View>
            </View>
            <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.subtext}
            />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView
                    intensity={Platform.OS === 'ios' ? 40 : 100}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />

                <View style={[
                    styles.container,
                    {
                        backgroundColor: isDark ? colors.background : '#fff',
                        paddingTop: insets.top
                    }
                ]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>Select Language</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Search */}
                    <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.card : '#F1F5F9' }]}>
                        <Ionicons name="search" size={20} color={colors.subtext} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search language..."
                            placeholderTextColor={colors.subtext}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={colors.subtext} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        data={[]} // Using ListHeaderComponent to render sections for better scroll handling
                        renderItem={() => null}
                        keyExtractor={() => 'dummy'}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <>
                                {/* Indian Languages Section */}
                                {indianLanguages.length > 0 && (
                                    <View style={styles.sectionContainer}>
                                        {renderSectionHeader(
                                            "Indian Languages",
                                            indianLanguages.length,
                                            showIndian,
                                            () => setShowIndian(!showIndian)
                                        )}
                                        {showIndian && (
                                            <View style={styles.sectionList}>
                                                {indianLanguages.map(item => renderLanguageItem(item, 'Indian'))}
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Global Languages Section */}
                                {globalLanguages.length > 0 && (
                                    <View style={styles.sectionContainer}>
                                        {renderSectionHeader(
                                            "Global Languages",
                                            globalLanguages.length,
                                            showGlobal,
                                            () => setShowGlobal(!showGlobal)
                                        )}
                                        {showGlobal && (
                                            <View style={styles.sectionList}>
                                                {globalLanguages.map(item => renderLanguageItem(item, 'Global'))}
                                            </View>
                                        )}
                                    </View>
                                )}
                            </>
                        }
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 16,
        height: 44,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    badge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionList: {
        paddingTop: 4,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
    },
    langInfo: {
        flexDirection: 'column',
    },
    langNative: {
        fontSize: 16,
        marginBottom: 2,
    },
    langEnglish: {
        fontSize: 14,
    }
});
