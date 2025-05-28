import React from 'react';
import { EventDetailScreen } from '@/components/EventDetailScreen';
import { EventFormScreen } from '@/components/EventFormScreen';
import { EventsScreen } from '@/components/EventsScreen';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function Index() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: {
					backgroundColor: isDark ? '#1e1e1e' : '#ffffff'
				},
				headerTintColor: isDark ? '#ffffff' : '#000000',
				headerTitleStyle: {
					fontWeight: 'bold'
				}
			}}
		>
			<Stack.Screen name='Events' component={EventsScreen} options={{ title: 'Events' }} />
			<Stack.Screen name='EventForm' component={EventFormScreen} options={{ title: 'New Event' }} />
			<Stack.Screen
				name='EventDetail'
				component={EventDetailScreen}
				options={{ title: 'Event Details' }}
			/>
		</Stack.Navigator>
	);
}
