import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SettingsScreen } from '@/components/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function TabThreeScreen() {
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
				name='Settings'
				component={SettingsScreen}
				options={{ title: 'Settings' }}
			/>
		</Stack.Navigator>
	);
}
