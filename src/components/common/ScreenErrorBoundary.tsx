import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../config/spacing';

interface Props {
    children: ReactNode;
    screenName: string;
}

interface State {
    hasError: boolean;
}

/**
 * Screen-level Error Boundary to isolate crashes to a single screen.
 * Allows navigation back to previous screens if one crashes.
 */
export class ScreenErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`💥 ScreenErrorBoundary caught error in [${this.props.screenName}]:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Ionicons name="bug-outline" size={48} color="#64748B" style={{ marginBottom: spacing[4] }} />
                    <Text style={styles.title}>Screen Error</Text>
                    <Text style={styles.subtitle}>
                        The {this.props.screenName} screen crashed unexpectedly.
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => this.setState({ hasError: false })}
                    >
                        <Text style={styles.retryText}>Reload Screen</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#020617',
        padding: spacing[6],
    },
    title: {
        color: '#F8FAFC',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing[2],
    },
    subtitle: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: spacing[6],
    },
    retryButton: {
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    retryText: {
        color: '#3B82F6',
        fontWeight: '600',
    },
});
