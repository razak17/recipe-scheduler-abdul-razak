import { useColorScheme } from '@/hooks/useColorScheme';
import { registerForPushNotifications } from '@/services/notifications';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { Loading } from './Loading';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationsScreen = () => {
	const colorScheme = useColorScheme();
	const { notifications, loading, error } = useNotifications();
	const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus>();

	useEffect(() => {
		const checkPermissions = async () => {
			const { status } = await Notifications.getPermissionsAsync();
			setPermissionStatus(status);
		};

		checkPermissions();
	}, []);

	const handleEnableNotifications = async () => {
		try {
			const { status } = await Notifications.requestPermissionsAsync();
			setPermissionStatus(status);

			if (status === 'granted') {
				const token = await registerForPushNotifications();
				console.log('Notification token after enabling:', token);
			}
		} catch (err) {
			console.error('Error enabling notifications:', err);
			Alert.alert('Permission Error', 'Failed to enable notifications. Please try again.');
		}
	};

	if (loading) {
		return <Loading />;
	}

	if (error) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.emptyContainer}>
					<Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#fff' : '#666' }]}>
						Error loading notifications
					</Text>
					<Text style={[styles.emptySubText, { color: colorScheme === 'dark' ? '#ccc' : '#999' }]}>
						{error.message}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const renderItem = ({ item }: { item: Notification }) => (
		<View
			style={[styles.notificationItem, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}
		>
			<Text style={[styles.notificationTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
				{item.title}
			</Text>
			<Text style={[styles.notificationBody, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
				{item.body}
			</Text>
			{item.data?.url && <Text style={styles.notificationLink}>Event: {item.data.url}</Text>}
		</View>
	);

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}
		>
			{permissionStatus !== 'granted' && (
				<View style={styles.permissionBanner}>
					<Text style={styles.permissionText}>
						Notifications are disabled. Enable them to receive reminders.
					</Text>
					<Button onPress={handleEnableNotifications} mode='contained' style={styles.permissionButton}>
						Enable
					</Button>
				</View>
			)}
			<FlatList
				data={notifications}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#fff' : '#666' }]}>
							No notifications yet
						</Text>
						<Text style={[styles.emptySubText, { color: colorScheme === 'dark' ? '#ccc' : '#999' }]}>
							When you receive reminders, they will appear here
						</Text>
					</View>
				}
				renderItem={renderItem}
				contentContainerStyle={styles.list}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	list: {
		padding: 16
	},
	notificationItem: {
		padding: 16,
		borderRadius: 8,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2
	},
	notificationTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 4
	},
	notificationBody: {
		fontSize: 14,
		marginBottom: 8
	},
	notificationTime: {
		fontSize: 12,
		alignSelf: 'flex-end'
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20
	},
	emptyText: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8
	},
	emptySubText: {
		fontSize: 14,
		textAlign: 'center'
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		padding: 16
	},
	permissionBanner: {
		backgroundColor: '#fff3cd',
		padding: 16,
		borderRadius: 8,
		marginBottom: 16
	},
	permissionText: {
		color: '#856404',
		marginBottom: 12
	},
	permissionButton: {
		alignSelf: 'flex-start'
	},

	notificationLink: {
		fontSize: 12,
		color: '#2f95dc',
		marginTop: 4
	}
});
