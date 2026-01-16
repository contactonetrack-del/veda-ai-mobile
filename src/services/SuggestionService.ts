/**
 * Suggestion Service
 * Generates context-aware follow-up questions/suggestions based on AI responses
 */

export const getContextualSuggestions = (lastAiMessage: string): { id: string, text: string }[] => {
    const text = lastAiMessage.toLowerCase();

    // Simple keyword-based suggestion engine
    if (text.includes('meditation') || text.includes('meditate')) {
        return [
            { id: 'm1', text: 'How long should I meditate?' },
            { id: 'm2', text: 'Best time for meditation?' },
            { id: 'm3', text: 'Different types of meditation' }
        ];
    }

    if (text.includes('yoga') || text.includes('stretch')) {
        return [
            { id: 'y1', text: 'Yoga for beginners' },
            { id: 'y2', text: 'Best morning stretches' },
            { id: 'y3', text: 'Yoga for back pain' }
        ];
    }

    if (text.includes('sleep') || text.includes('insomnia')) {
        return [
            { id: 's1', text: 'Tips for better sleep' },
            { id: 's2', text: 'Bedtime routine for anxiety' },
            { id: 's3', text: 'Best herbs for sleep' }
        ];
    }

    if (text.includes('diet') || text.includes('nutrition') || text.includes('eat')) {
        return [
            { id: 'd1', text: 'Healthy breakfast ideas' },
            { id: 'd2', text: 'Anti-inflammatory foods' },
            { id: 'd3', text: 'Meal prep tips' }
        ];
    }

    if (text.includes('anxiety') || text.includes('stress') || text.includes('overwhelmed')) {
        return [
            { id: 'a1', text: 'Quick breathing exercises' },
            { id: 'a2', text: 'Grounding techniques' },
            { id: 'a3', text: 'Journaling prompts for stress' }
        ];
    }

    // Default suggestions if no keywords match
    return [
        { id: 'def1', text: 'Tell me more about VEDA' },
        { id: 'def2', text: 'Give me a daily wellness tip' },
        { id: 'def3', text: 'Help me plan my day' }
    ];
};
