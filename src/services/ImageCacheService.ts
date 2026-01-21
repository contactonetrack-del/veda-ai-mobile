import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

const CACHE_FOLDER = `${FileSystem.cacheDirectory}image_cache/`;

class ImageCacheService {
    private static instance: ImageCacheService;
    private initialized: boolean = false;

    private constructor() { }

    public static getInstance(): ImageCacheService {
        if (!ImageCacheService.instance) {
            ImageCacheService.instance = new ImageCacheService();
        }
        return ImageCacheService.instance;
    }

    async init() {
        if (this.initialized) return;
        try {
            const folderInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
            if (!folderInfo.exists) {
                await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });
            }
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing ImageCacheService:', error);
        }
    }

    async getLocalUri(remoteUri: string): Promise<string | null> {
        if (!remoteUri) return null;
        await this.init();

        try {
            const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, remoteUri);
            const extension = remoteUri.split('.').pop()?.split('?')[0] || 'jpg'; // Basic extension extraction
            const localUri = `${CACHE_FOLDER}${hash}.${extension}`;

            const fileInfo = await FileSystem.getInfoAsync(localUri);

            if (fileInfo.exists) {
                return localUri;
            }

            // Download if not exists
            const downloadRes = await FileSystem.downloadAsync(remoteUri, localUri);
            if (downloadRes.status === 200) {
                return localUri;
            } else {
                return remoteUri; // Fallback to remote if download fails basically
            }
        } catch (error) {
            console.warn('ImageCacheService error:', error);
            return remoteUri; // Fallback
        }
    }

    async clearCache() {
        try {
            await FileSystem.deleteAsync(CACHE_FOLDER, { idempotent: true });
            this.initialized = false;
            await this.init();
        } catch (error) {
            console.error('Error clearing image cache:', error);
        }
    }
}

export const imageCacheService = ImageCacheService.getInstance();
