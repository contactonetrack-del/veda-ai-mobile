import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Message } from '../../types/chat';

interface MessageItemProps {
    item: Message;
    index: number;
    messagesLength: number;
    isStreaming: boolean;
    onDelete: (msg: Message) => void;
    onReply: (msg: Message) => void;
    onReaction: (msg: Message, emoji: string) => void;
    onLongPress: (msg: Message) => void;
}

const MessageItem = React.memo(({
    item,
    index,
    messagesLength,
    isStreaming,
    onDelete,
    onReply,
    onReaction,
    onLongPress
}: MessageItemProps) => {
    const handleDelete = useCallback(() => onDelete(item), [item, onDelete]);
    const handleReply = useCallback(() => onReply(item), [item, onReply]);
    const handleReaction = useCallback((emoji: string) => onReaction(item, emoji), [item, onReaction]);
    const handleLongPress = useCallback(() => onLongPress(item), [item, onLongPress]);

    return (
        <MessageBubble
            role={item.role}
            content={item.content}
            sources={item.sources}
            attachments={item.attachments}
            agentUsed={item.agentUsed}
            isLatest={index === messagesLength - 1}
            isTyping={isStreaming && index === messagesLength - 1}
            onDelete={handleDelete}
            onReply={handleReply}
            onReaction={handleReaction}
            onLongPress={handleLongPress}
            reactions={item.reactions}
            thinking={item.thinking}
        />
    );
});

interface MessageListProps {
    messages: Message[];
    flashListRef: React.RefObject<any>;
    isStreaming: boolean;
    loading: boolean;
    onMessageDelete: (msg: Message) => void;
    onMessageReply: (msg: Message) => void;
    onMessageReaction: (msg: Message, emoji: string) => void;
    onMessageLongPress: (msg: Message) => void;
}

const MessageList = ({
    messages,
    flashListRef,
    isStreaming,
    loading,
    onMessageDelete,
    onMessageReply,
    onMessageReaction,
    onMessageLongPress
}: MessageListProps) => {

    const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => (
        <MessageItem
            item={item}
            index={index}
            messagesLength={messages.length}
            isStreaming={isStreaming}
            onDelete={onMessageDelete}
            onReply={onMessageReply}
            onReaction={onMessageReaction}
            onLongPress={onMessageLongPress}
        />
    ), [messages.length, isStreaming, onMessageDelete, onMessageReply, onMessageReaction, onMessageLongPress]);

    const keyExtractor = useCallback((item: Message) => item.id, []);

    return (
        <View style={styles.container}>
            <FlashList
                ref={flashListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                estimatedItemSize={120}
                drawDistance={2500}
                removeClippedSubviews={false} // Better for chat interfaces with varying heights
                updateCellsBatchingPeriod={50}
                maxToRenderPerBatch={10}
                windowSize={21}
                contentContainerStyle={styles.contentContainer}
                onContentSizeChange={() => flashListRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={loading ? (
                    <View style={styles.footerContainer}>
                        <TypingIndicator />
                    </View>
                ) : null}
                extraData={[isStreaming, messages.length]}
                overrideItemLayout={(layout, item) => {
                    // Optional: Optimized layout for simpler items if needed
                    // For now, estimatedItemSize is sufficient for variable height bubbles
                }}
            />
        </View>
    );
};

export default MessageList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: 16,
        paddingBottom: 40,
    },
    footerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
});
