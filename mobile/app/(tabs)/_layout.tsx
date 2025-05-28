import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { setupNotificationChannel } from '@/utils/setupNotificationChannel';
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
	setupNotificationChannel();
	const colorScheme = useColorScheme();
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

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: Platform.select({
					ios: { position: 'absolute' },
					default: {}
				})
			}}
		>
			<Tabs.Screen
				name='events'
				options={{
					title: 'Events',
					tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name='home' />
				}}
			/>
			<Tabs.Screen
				name='notifications'
				options={{
					title: 'notifications',
					tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name='notifications' />
				}}
			/>
			<Tabs.Screen
				name='settings'
				options={{
					title: 'Settings',
					tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name='settings' />
				}}
			/>
		</Tabs>
	);
}
