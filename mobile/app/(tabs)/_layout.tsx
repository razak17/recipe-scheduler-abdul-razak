import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
	const colorScheme = useColorScheme();

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
					title: 'Notifications',
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
