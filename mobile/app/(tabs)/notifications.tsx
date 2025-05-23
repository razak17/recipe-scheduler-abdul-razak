import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NotificationsScreen } from '@/components/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function TabTwoScreen() {
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
			<Stack.Screen
				name='Notifications'
				component={NotificationsScreen}
				options={{ title: 'Notifications' }}
			/>
		</Stack.Navigator>
	);
}
