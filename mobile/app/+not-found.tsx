import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotFoundScreen() {
	const colorScheme = useColorScheme();

	return (
		<>
			<Stack.Screen options={{ title: 'Oops!' }} />
			<View
				style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}
			>
				<Text style={[{ color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
					This screen does not exist
				</Text>
				<Link href='/' style={styles.link}>
					<Text style={[{ color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Go to home screen!</Text>
				</Link>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20
	},
	link: {
		marginTop: 15,
		paddingVertical: 15
	}
});
