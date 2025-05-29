import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Appearance, ScrollView, StyleSheet, Switch, View } from 'react-native';

export default function SettingsTab() {
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === 'dark';

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}
			contentContainerStyle={styles.contentContainer}
		>
			<ThemedView style={styles.section} lightColor='#fff' darkColor='#333'>
				<ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
				<View style={styles.setting}>
					<ThemedText style={styles.settingText}>Dark Mode</ThemedText>
					<Switch
						value={isDarkMode}
						onChange={() => {
							Appearance.setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
						}}
						trackColor={{ false: '#767577', true: '#bb86fc' }}
						thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
					/>
				</View>
			</ThemedView>

			<ThemedView style={styles.section} lightColor='#fff' darkColor='#333'>
				<ThemedText style={styles.sectionTitle}>About</ThemedText>
				<ThemedText style={styles.aboutText} lightColor='#666' darkColor='#ccc'>
					Recipe Scheduler App
				</ThemedText>
				<ThemedText style={styles.versionText} lightColor='#999' darkColor='#aaa'>
					Version 1.0.0
				</ThemedText>
			</ThemedView>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	contentContainer: {
		padding: 16
	},
	section: {
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 16
	},
	setting: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8
	},
	settingText: {
		fontSize: 16
	},
	aboutText: {
		fontSize: 16,
		marginBottom: 8
	},
	versionText: {
		fontSize: 14
	}
});
