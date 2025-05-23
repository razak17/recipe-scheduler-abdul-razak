import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	Switch,
	ScrollView,
	Appearance
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export const SettingsScreen = () => {
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === 'dark';

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }]}
			contentContainerStyle={styles.contentContainer}
		>
			<View style={[styles.section, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
				<Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Appearance</Text>
				<View style={styles.setting}>
					<Text style={[styles.settingText, { color: isDarkMode ? '#fff' : '#000' }]}>Dark Mode</Text>
					<Switch
						value={isDarkMode}
						onChange={() => {
							Appearance.setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
						}}
						trackColor={{ false: '#767577', true: '#bb86fc' }}
						thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
					/>
				</View>
			</View>

			<View style={[styles.section, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
				<Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>About</Text>
				<Text style={[styles.aboutText, { color: isDarkMode ? '#ccc' : '#666' }]}>
					Recipe Scheduler App
				</Text>
				<Text style={[styles.versionText, { color: isDarkMode ? '#aaa' : '#999' }]}>Version 1.0.0</Text>
			</View>
		</ScrollView>
	);
};

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
