import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { avatarSize, spacing } from '../../config';

interface AiMetadataProps {
    agentUsed?: string;
    provider?: string;
    isTyping?: boolean;
}

export const AiMetadata = ({ agentUsed, provider, isTyping }: AiMetadataProps) => {
    const { colors, isDark } = useTheme();

    return (
        <View style={styles.metadataContainer}>
            <View style={styles.avatarContainer}>
                <View style={[styles.avatarGlow, { backgroundColor: colors.primary, opacity: 0.15 }]} />
                <Image
                    source={require('../../../assets/veda-avatar.png')}
                    style={[styles.avatar, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}
                    resizeMode="cover"
                    accessibilityLabel="VEDA AI Assistant Avatar"
                />
            </View>

            <View style={styles.agentRow}>
                <Text style={[styles.agentName, { color: colors.primary }]}>
                    {agentUsed || 'VEDA AI'}
                </Text>
                {isTyping && (
                    <View style={[styles.statusBadge, { backgroundColor: `${colors.primary}15` }]}>
                        <Text style={[styles.statusText, { color: colors.primary }]}>Typing...</Text>
                    </View>
                )}
                {provider && (
                    <View style={[styles.agentBadge, { backgroundColor: colors.secondary + '10' }]}>
                        <Text style={[styles.agentBadgeText, { color: colors.secondary }]}>
                            {provider}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    metadataContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[1],
    },
    avatarContainer: {
        width: avatarSize.sm,
        height: avatarSize.sm,
        marginRight: spacing[3],
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarGlow: {
        position: 'absolute',
        width: avatarSize.sm + 6,
        height: avatarSize.sm + 6,
        borderRadius: (avatarSize.sm + 6) / 2,
    },
    avatar: {
        width: avatarSize.sm,
        height: avatarSize.sm,
        borderRadius: avatarSize.sm / 2,
    },
    agentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    agentName: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    agentBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    agentBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
