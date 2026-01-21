import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../config/colors';
import { spacing, borderRadius } from '../../config/spacing';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Root level Error Boundary to catch UI/Rendering crashes
 * and provide a recovery path for the user.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console - in production, this could send to Sentry/Bugsnag
        console.error('💥 Root ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                        </View>

                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.subtitle}>
                            An unexpected error occurred. We've been notified and are working on it.
                        </Text>

                        {__DEV__ && this.state.error && (
                            <View style={styles.debugContainer}>
                                <Text style={styles.debugTitle}>Debug Information:</Text>
                                <ScrollView style={styles.debugScroll} nestedScrollEnabled>
                                    <Text style={styles.debugText}>{this.state.error.toString()}</Text>
                                    {this.state.errorInfo && (
                                        <Text style={styles.debugText}>{this.state.errorInfo.componentStack}</Text>
                                    )}
                                </ScrollView>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleReset}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617', // Match app's dark background
    },
    content: {
        flex: 1,
        padding: spacing[6],
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[6],
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: spacing[2],
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: spacing[8],
        lineHeight: 24,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#3B82F6',
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[6],
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    debugContainer: {
        width: '100%',
        maxHeight: 200,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: borderRadius.sm,
        padding: spacing[3],
        marginBottom: spacing[6],
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    debugTitle: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    debugScroll: {
        flex: 1,
    },
    debugText: {
        color: '#CBD5E1',
        fontSize: 11,
        fontFamily: 'monospace',
    },
});
