import { useColorScheme } from '@/hooks/useColorScheme';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function Loader() {
	const colorScheme = useColorScheme();

	return (
		<View style={styles.container}>
			<ActivityIndicator size='large' color={colorScheme === 'dark' ? '#fff' : '#000'} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});
