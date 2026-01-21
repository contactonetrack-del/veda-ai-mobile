require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-speech', () => ({
    speak: jest.fn(),
    stop: jest.fn(),
    isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('expo-av', () => ({
    Audio: {
        Recording: jest.fn(),
        Sound: jest.fn(),
        setAudioModeAsync: jest.fn(),
    },
}));

jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    addNotificationReceivedListener: jest.fn(),
    addNotificationResponseReceivedListener: jest.fn(),
    removeNotificationSubscription: jest.fn(),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'fake-token' })),
}));

jest.mock('expo-constants', () => ({
    expoConfig: {
        extra: {
            eas: {
                projectId: 'test-project-id',
            },
        },
    },
}));

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: jest.fn(() => Promise.resolve()),
        runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1, changes: 1 })),
        getAllAsync: jest.fn(() => Promise.resolve([])),
        getFirstAsync: jest.fn(() => Promise.resolve(null)),
        transactionAsync: jest.fn((callback) => callback({
            executeSql: jest.fn(),
        })),
    })),
}));
