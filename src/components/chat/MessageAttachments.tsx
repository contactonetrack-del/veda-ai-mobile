import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Attachment } from '../../types/chat';
import { imageCacheService } from '../../services/ImageCacheService';

interface MessageAttachmentsProps {
    attachments: Attachment[];
    isDark: boolean;
}

export const MessageAttachments = ({ attachments, isDark }: MessageAttachmentsProps) => {
    const { colors } = useTheme();
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
    const [cachedUris, setCachedUris] = useState<Record<string, string>>({});

    useEffect(() => {
        let isMounted = true;
        const loadCachedImages = async () => {
            const newCachedUris: Record<string, string> = {};
            // Parallelize loading for better performance
            await Promise.all(attachments.map(async (att) => {
                if (att.type === 'image') {
                    try {
                        const localUri = await imageCacheService.getLocalUri(att.uri);
                        if (localUri && isMounted) {
                            newCachedUris[att.id] = localUri;
                        }
                    } catch (e) {
                        console.warn('Failed to cache image:', att.id);
                    }
                }
            }));
            if (isMounted) {
                setCachedUris(prev => ({ ...prev, ...newCachedUris }));
            }
        };

        loadCachedImages();

        return () => { isMounted = false; };
    }, [attachments]);

    if (!attachments || attachments.length === 0) return null;

    return (
        <View style={styles.attachmentGrid}>
            {attachments.map((att) => (
                <View
                    key={att.id}
                    style={[
                        styles.attachmentContainer,
                        att.type === 'file' && {
                            width: 140,
                            padding: 8,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                        }
                    ]}
                >
                    {att.type === 'image' ? (
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: cachedUris[att.id] || att.uri }}
                                style={styles.attachmentImage}
                                onLoadEnd={() => setLoadedImages(prev => ({ ...prev, [att.id]: true }))}
                            />
                            {!loadedImages[att.id] && (
                                <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#2C2C2C' : '#F5F5F5' }]}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.fileAttachmentRow}>
                            <Ionicons name="document-text" size={24} color={colors.primary} />
                            <View style={styles.fileInfo}>
                                <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                                    {att.name || 'Document'}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    attachmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    attachmentContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachmentImage: {
        width: '100%',
        height: '100%',
    },
    fileAttachmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        gap: 10,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 12,
        fontWeight: '500',
    },
});
