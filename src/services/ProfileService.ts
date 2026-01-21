import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfileExtended {
    userId: string;
    bio: string;
    avatar: string | null;
    coverImage: string | null;
    location: string;
    website: string;
    socials: {
        twitter: string;
        linkedin: string;
        instagram: string;
    };
    stats: {
        level: number;
        points: number;
        rank: string;
        streak: number;
    };
    achievements: string[];
}

const DEFAULT_PROFILE: Partial<UserProfileExtended> = {
    bio: 'AI Enthusiast & Explorer',
    avatar: null,
    coverImage: null,
    location: '',
    website: '',
    socials: {
        twitter: '',
        linkedin: '',
        instagram: '',
    },
    stats: {
        level: 1,
        points: 100,
        rank: 'Novice',
        streak: 0,
    },
    achievements: ['early_adopter', 'first_chat']
};

export const ProfileService = {
    async getProfile(userId: string): Promise<UserProfileExtended> {
        try {
            const json = await AsyncStorage.getItem(`user_profile_${userId}`);
            if (json) {
                const data = JSON.parse(json);
                return { ...DEFAULT_PROFILE, ...data, userId, stats: { ...DEFAULT_PROFILE.stats, ...data.stats } };
            }
            return { ...DEFAULT_PROFILE, userId } as UserProfileExtended;
        } catch (e) {
            console.error('Failed to load profile', e);
            return { ...DEFAULT_PROFILE, userId } as UserProfileExtended;
        }
    },

    async updateProfile(userId: string, data: Partial<UserProfileExtended>): Promise<void> {
        try {
            const current = await this.getProfile(userId);
            const updated = { ...current, ...data };
            await AsyncStorage.setItem(`user_profile_${userId}`, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save profile', e);
            throw e;
        }
    }
};
