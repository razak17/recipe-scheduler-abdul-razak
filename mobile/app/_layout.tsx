import { useColorScheme } from '@/hooks/useColorScheme';
import { setupNotificationChannel } from '@/utils/setupNotificationChannel';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const router = useRouter();

	const [loaded, error] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
	});

	useEffect(() => {
		setupNotificationChannel();
	}, []);

	useEffect(() => {
		const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
			const url = response.notification.request.content.data?.url;
			if (url && typeof url === 'string') {
				router.push(url as any);
			}
		});

		return () => subscription.remove();
	}, [router]);

	// Handle font loading and splash screen
	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync();
		}
	}, [loaded, error]);

	if (!loaded && !error) {
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
				<Stack>
					<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
					<Stack.Screen name='+not-found' />
				</Stack>
				<StatusBar style='auto' />
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
