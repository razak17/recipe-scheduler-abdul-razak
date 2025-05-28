import { useEffect } from 'react';
import { useNavigation, Redirect } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';

export default function TabIndex() {
	const navigation = useNavigation<StackNavigationProp<any>>();

	useEffect(() => {
		navigation.setOptions({
			headerShown: false // Hide header if needed
		});
	}, [navigation]);

	return <Redirect href='/events' />;
}
