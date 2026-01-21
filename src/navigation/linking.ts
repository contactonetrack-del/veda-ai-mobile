import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './RootNavigator';

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.createURL('/'), 'veda-ai://'],
    config: {
        screens: {
            Chat: 'chat/:chatId?', // Optional chatId
            Settings: 'settings',
            EditProfile: 'profile/edit',
            About: 'about',
            PrivacyPolicy: 'privacy',
            TermsOfService: 'terms',
            Memory: 'memory',
            Profile: 'profile',
        },
    },
};

export default linking;
