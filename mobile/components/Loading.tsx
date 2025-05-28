import { useColorScheme } from '@/hooks/useColorScheme';
import { ActivityIndicator } from 'react-native';

export function Loading() {
	const colorScheme = useColorScheme();

	return <ActivityIndicator size='large' color={colorScheme === 'dark' ? '#fff' : '#000'} />;
}
