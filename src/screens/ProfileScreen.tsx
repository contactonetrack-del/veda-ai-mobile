import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
    Linking
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { GlassView } from '../components/common/GlassView';
import { ProfileService, UserProfileExtended } from '../services/ProfileService';
import { getUserStats, UserStats, getChats, getMemories } from '../services/api';
import { ChatSession, MemoryItem } from '../types/chat';

const { width } = Dimensions.get('window');
const COVER_HEIGHT = 200;

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    const { colors, isDark } = useTheme();
    const { user, logout } = useAuth();
    const insets = useSafeAreaInsets();
    const [profile, setProfile] = useState<UserProfileExtended | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'memory' | 'badges'>('overview');
    const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
    const [activityMap, setActivityMap] = useState<number[]>(Array(35).fill(0.1));
    const [memories, setMemories] = useState<MemoryItem[]>([]);

    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                loadProfile();
            }
        }, [user?.id])
    );

    const loadProfile = async () => {
        if (user?.id) {
            try {
                // 1. Fetch basic profile
                const profileData = await ProfileService.getProfile(user.id);

                // 2. Fetch real stats (streak, etc.)
                const realStats = await getUserStats();

                // 3. Fetch chat history for Activity Heatmap and Recent Activity
                const chatResponse = await getChats();
                const chats = chatResponse.chats || chatResponse || [];

                // Calculate Heatmap Activity (last 35 days)
                const now = new Date();
                const activity: number[] = Array(35).fill(0.1);
                const dayCounts: Record<string, number> = {};

                chats.forEach((chat: any) => {
                    const date = new Date(chat.created_at).toDateString();
                    dayCounts[date] = (dayCounts[date] || 0) + 1;
                });

                for (let i = 0; i < 35; i++) {
                    const d = new Date();
                    d.setDate(now.getDate() - (34 - i));
                    const dateStr = d.toDateString();
                    const count = dayCounts[dateStr] || 0;
                    activity[i] = count === 0 ? 0.1 : Math.min(0.2 + (count * 0.2), 1.0);
                }

                setActivityMap(activity);
                setRecentChats(chats.slice(0, 3)); // Top 3 latest chats

                // 4. Fetch Memories for Insights tab
                const memoryData = await getMemories(user.id);
                setMemories(memoryData.slice(0, 4));

                // Calculate Rank based on points
                const points = (realStats.totalMessages * 5) + (chats.length * 25);
                let rank = "Novice";
                if (points > 5000) rank = "Legend";
                else if (points > 2000) rank = "Master";
                else if (points > 500) rank = "Explorer";

                // Merge real stats into profile
                const mergedProfile = {
                    ...profileData,
                    stats: {
                        ...profileData.stats,
                        streak: realStats.streakDays || 0,
                        points: points || profileData.stats.points,
                        rank: rank
                    }
                };

                setProfile(mergedProfile);
            } catch (e) {
                console.error("Error loading merged profile data:", e);
                const data = await ProfileService.getProfile(user.id);
                setProfile(data);
            }
        }
    };

    const handleOpenLink = async (url: string) => {
        if (!url) return;
        const finalUrl = url.startsWith('http') ? url : `https://${url}`;
        try {
            const supported = await Linking.canOpenURL(finalUrl);
            if (supported) {
                await Linking.openURL(finalUrl);
            }
        } catch (error) {
            console.log("Error opening link:", error);
        }
    };

    const scrollY = React.useRef(new Animated.Value(0)).current;

    const useParallax = () => {
        const translateY = scrollY.interpolate({
            inputRange: [-COVER_HEIGHT, 0, COVER_HEIGHT],
            outputRange: [-COVER_HEIGHT / 2, 0, COVER_HEIGHT * 0.5],
            extrapolate: 'clamp'
        });

        const scale = scrollY.interpolate({
            inputRange: [-COVER_HEIGHT, 0],
            outputRange: [2, 1],
            extrapolateRight: 'clamp'
        });

        return { transform: [{ translateY }, { scale }] };
    };

    const parallaxStyle = useParallax();

    if (!user || !profile) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />

            <Animated.ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Parallax Cover Image ... (existing code omitted for brevity but preserved) */}
                <View style={styles.coverContainer}>
                    {profile.coverImage ? (
                        <Animated.Image
                            source={{ uri: profile.coverImage }}
                            style={[styles.coverImage, parallaxStyle]}
                        />
                    ) : (
                        <Animated.View style={[styles.coverImage, parallaxStyle]}>
                            <LinearGradient
                                colors={[colors.primary, '#4F46E5']}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                        </Animated.View>
                    )}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.coverGradient}
                    />

                    {/* Header Buttons */}
                    <View style={[styles.headerButtons, { top: insets.top + 8 }]}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                            style={styles.backButton}
                        >
                            <GlassView intensity={60} style={styles.backButtonInner}>
                                <Ionicons name="arrow-back" size={22} color="#FFF" />
                            </GlassView>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('EditProfile')}
                            activeOpacity={0.7}
                            style={styles.editButton}
                        >
                            <GlassView intensity={60} style={styles.editButtonInner}>
                                <Text style={styles.editBtnText}>Edit Profile</Text>
                                <MaterialCommunityIcons name="pencil" size={14} color="#FFF" />
                            </GlassView>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Header Info */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {(profile.avatar || user.photoURL) ? (
                            <Image
                                source={{ uri: profile.avatar || user.photoURL || '' }}
                                style={[styles.avatar, { borderColor: colors.background, backgroundColor: colors.card }]}
                            />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: colors.primary, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
                                <Text style={{ fontSize: 32, color: '#FFF', fontWeight: 'bold' }}>{user.name?.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={[styles.levelBadge, { backgroundColor: colors.accent }]}>
                            <Text style={styles.levelText}>LVL {profile.stats.level}</Text>
                        </View>
                    </View>

                    <View style={styles.nameContainer}>
                        <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                        <Ionicons name="checkmark-circle" size={18} color="#0EA5E9" style={styles.verifiedBadge} />
                    </View>
                    <Text style={[styles.userBio, { color: colors.subtext }]}>{profile.bio}</Text>

                    {/* Level Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressTitle, { color: colors.text }]}>Level {profile.stats.level} Progress</Text>
                            <Text style={[styles.progressValue, { color: colors.primary }]}>{profile.stats.points % 1000}/1000 XP</Text>
                        </View>
                        <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        backgroundColor: colors.primary,
                                        width: `${(profile.stats.points % 1000) / 10}%`
                                    }
                                ]}
                            />
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <StatCard label="Streak" value={`${profile.stats.streak} Days`} icon="flame" color="#FF6B6B" isDark={isDark} colors={colors} />
                        <StatCard label="Points" value={`${profile.stats.points} Pts`} icon="trophy" color="#FFD93D" isDark={isDark} colors={colors} />
                        <StatCard label="Rank" value={profile.stats.rank} icon="medal" color="#4D96FF" isDark={isDark} colors={colors} />
                    </View>
                    {/* Location & Link ... (existing code omitted) */}
                    <View style={styles.metaRow}>
                        {profile.location ? (
                            <View style={styles.metaItem}>
                                <Ionicons name="location-outline" size={14} color={colors.subtext} />
                                <Text style={[styles.metaText, { color: colors.subtext }]}>{profile.location}</Text>
                            </View>
                        ) : null}
                        {profile.website ? (
                            <TouchableOpacity onPress={() => handleOpenLink(profile.website)} style={styles.metaItem}>
                                <Ionicons name="link-outline" size={14} color={colors.primary} />
                                <Text style={[styles.metaText, { color: colors.primary }]}>{profile.website.replace('https://', '')}</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Socials */}
                    <View style={styles.socialRow}>
                        {['twitter', 'linkedin', 'instagram'].map((platform) => {
                            const link = (profile.socials as Record<string, string>)[platform];
                            return (
                                <TouchableOpacity
                                    key={platform}
                                    onPress={() => link ? handleOpenLink(link) : navigation.navigate('EditProfile')}
                                    style={[styles.socialIcon, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', opacity: link ? 1 : 0.6 }]}
                                >
                                    <MaterialCommunityIcons
                                        name={platform === 'twitter' ? 'twitter' : platform === 'instagram' ? 'instagram' : 'linkedin'}
                                        size={20}
                                        color={link ? colors.text : colors.subtext}
                                    />
                                    {!link && (
                                        <View style={[styles.socialPlusBadge, { backgroundColor: colors.primary }]}>
                                            <Ionicons name="add" size={8} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        onPress={() => setActiveTab('overview')}
                        style={[styles.tabButton, activeTab === 'overview' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'overview' ? colors.text : colors.subtext, fontWeight: activeTab === 'overview' ? 'bold' : 'normal' }]}>Overview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('memory')}
                        style={[styles.tabButton, activeTab === 'memory' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'memory' ? colors.text : colors.subtext, fontWeight: activeTab === 'memory' ? 'bold' : 'normal' }]}>Insights</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('badges')}
                        style={[styles.tabButton, activeTab === 'badges' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'badges' ? colors.text : colors.subtext, fontWeight: activeTab === 'badges' ? 'bold' : 'normal' }]}>Badges</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Activity Heatmap */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Wellness Journey</Text>
                                <Ionicons name="information-circle-outline" size={16} color={colors.subtext} />
                            </View>
                            <View style={[styles.heatmapContainer, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC', borderColor: isDark ? '#374151' : colors.cardBorder }]}>
                                <View style={styles.heatmapGrid}>
                                    {activityMap.map((opacity, i) => (
                                        <View
                                            key={i}
                                            style={[styles.heatmapCell, { backgroundColor: colors.primary, opacity }]}
                                        />
                                    ))}
                                </View>
                                <View style={styles.heatmapFooter}>
                                    <Text style={[styles.heatmapLabel, { color: colors.subtext }]}>Less</Text>
                                    <View style={styles.heatmapLegend}>
                                        {[0.1, 0.4, 0.7, 1.0].map((op, i) => (
                                            <View key={i} style={[styles.heatmapCell, { backgroundColor: colors.primary, opacity: op, width: 10, height: 10, marginRight: 4 }]} />
                                        ))}
                                    </View>
                                    <Text style={[styles.heatmapLabel, { color: colors.subtext }]}>More</Text>
                                </View>
                            </View>
                        </View>

                        {/* Recent Activity Mini List */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Interaction History</Text>
                            </View>
                            <View style={{ paddingHorizontal: 16, gap: 12 }}>
                                {recentChats.length > 0 ? (
                                    recentChats.map((chat, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => navigation.navigate('Chat', { chatId: chat.id })}
                                            style={[styles.activityItem, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC', borderColor: isDark ? '#374151' : colors.cardBorder }]}
                                        >
                                            <View style={[styles.activityIcon, { backgroundColor: colors.primary + '15' }]}>
                                                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.activityLabel, { color: colors.text }]} numberOfLines={1}>{chat.title || 'Untitled Session'}</Text>
                                                <Text style={[styles.activityTime, { color: colors.subtext }]}>
                                                    {new Date(chat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={[styles.activityItem, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC', borderColor: isDark ? '#374151' : colors.cardBorder, justifyContent: 'center' }]}>
                                        <Text style={{ color: colors.subtext, fontSize: 13, fontStyle: 'italic' }}>No recent activity found</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </>
                )}

                {activeTab === 'memory' && (
                    <View style={styles.tabContent}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Identity Insights</Text>
                            <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>Data harvested from our interactions</Text>
                        </View>
                        {memories.length > 0 ? (
                            memories.map((memory, i) => (
                                <View key={i} style={[styles.insightCard, { backgroundColor: isDark ? '#1F2937' : '#F1F5F9', borderColor: isDark ? '#374151' : '#E2E8F0' }]}>
                                    <View style={[styles.insightIcon, { backgroundColor: colors.primary + '20' }]}>
                                        <MaterialCommunityIcons name="brain" size={20} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.insightText, { color: colors.text }]}>{memory.content}</Text>
                                        <Text style={[styles.insightMeta, { color: colors.subtext }]}>
                                            Refined {new Date(memory.timestamp).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={[styles.placeholderCard, { backgroundColor: isDark ? '#1F2937' : '#F1F5F9' }]}>
                                <Ionicons name="cloud-offline-outline" size={48} color={colors.subtext} />
                                <Text style={[styles.placeholderText, { color: colors.subtext }]}>No deep memories formed yet. Keep chatting!</Text>
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'badges' && (
                    <View style={styles.section}>
                        <View style={styles.badgesGrid}>
                            {profile.achievements.map((badge, index) => (
                                <View key={index} style={[styles.badgeCardLarge, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.cardBorder }]}>
                                    <View style={[styles.badgeIconLarge, { backgroundColor: badge === 'early_adopter' ? '#E0F2FE' : '#FEF3C7' }]}>
                                        <MaterialCommunityIcons
                                            name={badge === 'early_adopter' ? 'rocket-launch' : 'star-face'}
                                            size={32}
                                            color={badge === 'early_adopter' ? '#0EA5E9' : '#D97706'}
                                        />
                                    </View>
                                    <Text style={[styles.badgeTextLarge, { color: colors.text }]}>
                                        {badge.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </Text>
                                    <Text style={[styles.badgeDesc, { color: colors.subtext }]}>
                                        Awarded for joining during the initial launch phase.
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

            </Animated.ScrollView>
        </View>
    );
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: keyof typeof Ionicons.prototype.props.name | any; // Simplified for now but avoiding naked any
    color: string;
    isDark: boolean;
    colors: any; // Theme colors
}

const StatCard = ({ label, value, icon, color, isDark, colors }: StatCardProps) => (
    <View style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
        <View style={[styles.statIconCircle, { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.8)' : color + '10' }]}>
            <View style={[styles.statIconInner, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
        </View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.subtext }]}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    coverContainer: {
        height: COVER_HEIGHT,
        width: '100%',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    headerButtons: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        zIndex: 20,
    },
    backButton: {
        // Wrapper for Touchable
    },
    editButton: {
        // Wrapper for Touchable
    },
    backButtonInner: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    editButtonInner: {
        flexDirection: 'row',
        height: 42,
        borderRadius: 21,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        gap: 8,
    },
    editBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: -50,
        paddingHorizontal: 24,
        zIndex: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
    },
    levelBadge: {
        position: 'absolute',
        bottom: 0,
        right: -10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    levelText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    progressContainer: {
        width: '100%',
        marginVertical: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressTitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    verifiedBadge: {
        marginTop: 2,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    userBio: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    socialIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    socialPlusBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 14,
        height: 14,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150, 150, 150, 0.1)',
    },
    tabButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    tabText: {
        fontSize: 14,
    },
    heatmapContainer: {
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    heatmapGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        justifyContent: 'center',
    },
    heatmapCell: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    heatmapFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 8,
    },
    heatmapLabel: {
        fontSize: 10,
    },
    heatmapLegend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    activityIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    activityTime: {
        fontSize: 12,
        marginTop: 2,
    },

    insightTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    insightDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    placeholderSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingHorizontal: 16,
    },
    badgeCardLarge: {
        width: (width - 44) / 2,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
    },
    badgeIconLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeTextLarge: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    badgeDesc: {
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 24,
        marginTop: 12,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // Elevation/Shadow for premium feel
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    statIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIconInner: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800', // Extra bold for emphasis
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        opacity: 0.7,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    badgeCard: {
        width: 120,
        height: 100,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    badgeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    tabContent: {
        paddingTop: 10,
    },
    sectionSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 16,
        marginHorizontal: 16,
        marginBottom: 12,
    },
    insightIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    insightText: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    insightMeta: {
        fontSize: 12,
        marginTop: 4,
    },
    placeholderCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginHorizontal: 20,
        borderRadius: 24,
    },
    placeholderText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
    },
});
