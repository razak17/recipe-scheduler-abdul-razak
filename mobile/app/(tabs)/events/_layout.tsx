import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';

export default function EventsLayout() {
	const colorScheme = useColorScheme();

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: Colors[colorScheme ?? 'light'].headerBackground
				},
				headerTintColor: Colors[colorScheme ?? 'light'].headerTint,
				headerTitleStyle: {
					fontWeight: 'bold'
				}
			}}
		>
			<Stack.Screen name='index' options={{ title: 'Events' }} />
			<Stack.Screen
				name='new'
				options={{
					title: 'New Event'
				}}
			/>
			<Stack.Screen name='[id]' options={{ title: 'Event Details' }} />
		</Stack>
	);
}
