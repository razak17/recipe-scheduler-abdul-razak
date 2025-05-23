import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getNotifications, Notification } from '../services/notifications';

export const NotificationsScreen = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const colorScheme = useColorScheme();

	const loadNotifications = () => {
		const notifs = getNotifications();
		setNotifications(notifs);
	};

	useEffect(() => {
		loadNotifications();
	}, []);

	const onRefresh = () => {
		setRefreshing(true);
		loadNotifications();
		setRefreshing(false);
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const renderItem = ({ item }: { item: Notification }) => (
		<View style={[styles.notificationItem, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
			<Text style={[styles.notificationTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
				{item.title}
			</Text>
			<Text style={[styles.notificationBody, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
				{item.body}
			</Text>
			<Text style={[styles.notificationTime, { color: colorScheme === 'dark' ? '#aaa' : '#999' }]}>
				{formatTime(item.receivedAt)}
			</Text>
		</View>
	);

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}
		>
			{notifications.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#fff' : '#666' }]}>
						No notifications yet
					</Text>
					<Text style={[styles.emptySubText, { color: colorScheme === 'dark' ? '#ccc' : '#999' }]}>
						When you receive reminders, they will appear here
					</Text>
				</View>
			) : (
				<FlatList
					data={notifications}
					renderItem={renderItem}
					keyExtractor={(item, index) => item.id || index.toString()}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							colors={[colorScheme === 'dark' ? '#bb86fc' : '#6200ee']}
							tintColor={colorScheme === 'dark' ? '#bb86fc' : '#6200ee'}
						/>
					}
				/>
			)}
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
	}
});
