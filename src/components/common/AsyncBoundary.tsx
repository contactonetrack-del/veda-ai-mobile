import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../config/spacing';

interface Props {
    isLoading: boolean;
    error: Error | string | null;
    children: ReactNode;
    onRetry?: () => void;
    loadingMessage?: string;
    errorMessage?: string;
}

/**
 * AsyncBoundary component to handle loading and error states for async operations.
 */
export const AsyncBoundary: React.FC<Props> = ({
    isLoading,
    error,
    children,
    onRetry,
    loadingMessage = 'Loading...',
    errorMessage = 'Failed to load content',
}) => {
    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>{loadingMessage}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorSubtitle}>{typeof error === 'string' ? error : errorMessage}</Text>
                {onRetry && (
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing[6],
    },
    loadingText: {
        marginTop: spacing[4],
        color: '#94A3B8',
        fontSize: 14,
    },
    errorTitle: {
        color: '#F8FAFC',
        fontSize: 20,
        fontWeight: '700',
        marginTop: spacing[4],
        marginBottom: spacing[2],
    },
    errorSubtitle: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: spacing[6],
    },
    retryButton: {
        flexDirection: 'row',
        backgroundColor: '#3B82F6',
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[5],
        borderRadius: borderRadius.sm,
        alignItems: 'center',
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
