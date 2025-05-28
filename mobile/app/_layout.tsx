import { useColorScheme } from '@/hooks/useColorScheme';
import { setupNotificationChannel } from '@/utils/setupNotificationChannel';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {
	setupNotificationChannel();
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
	});
	const router = useRouter();

	useEffect(() => {
		const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
			const url = response.notification.request.content.data?.url;
			if (url && typeof url === 'string') {
				router.push(url as any);
			}
		});

		return () => subscription.remove();
	}, []);

	if (!loaded) {
		// Async font loading only occurs in development.
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
