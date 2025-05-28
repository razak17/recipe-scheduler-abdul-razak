import { useColorScheme } from '@/hooks/useColorScheme';
import { useEvents } from '@/services/events';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Button } from 'react-native-paper';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { RecipeEvent } from '../services/api';
import { Loading } from './Loading';

export const EventsScreen = () => {
	const { events, loading, hasMore, loadEvents, deleteEvent, refetch } = useEvents();
	const navigation = useNavigation();
	const colorScheme = useColorScheme();

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			refetch();
		});
		return unsubscribe;
	}, [navigation]);

	const loadMoreEvents = useCallback(() => {
		if (!hasMore || loading) return;
		loadEvents(8, events.length);
	}, [hasMore, loading, loadEvents, events.length]);

	const confirmDelete = (id: string) => {
		Alert.alert('Confirm Delete', 'Are you sure you want to delete this event?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', style: 'destructive', onPress: () => deleteEvent(id) }
		]);
	};

	const renderRightActions = (id: string) => {
		return (
			<TouchableOpacity
				style={[
					styles.deleteButton,
					{ backgroundColor: colorScheme === 'dark' ? '#ff6b6b' : '#ff4757' }
				]}
				onPress={() => confirmDelete(id)}
			>
				<Text style={styles.deleteText}>Delete</Text>
			</TouchableOpacity>
		);
	};

	const formatDateTime = (dateTimeString: string) => {
		const date = new Date(dateTimeString);
		return date.toLocaleString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const renderItem = ({ item }: { item: RecipeEvent }) => (
		<Swipeable renderRightActions={() => renderRightActions(item.id)}>
			<TouchableOpacity
				style={[styles.eventItem, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}
				onPress={() => navigation.navigate('EventDetail', { event: item })}
			>
				<Text style={[styles.eventTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
					{item.title}
				</Text>
				<Text style={[styles.eventTime, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
					{formatDateTime(item.eventTime)}
				</Text>
			</TouchableOpacity>
		</Swipeable>
	);
	if (loading && events.length === 0) {
		return <Loading />;
	}

	return (
		<View
			style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}
		>
			<>
				<FlatList
					data={events}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.list}
					onEndReached={loadMoreEvents}
					onEndReachedThreshold={0.5}
					ListFooterComponent={
						hasMore ? (
							<View style={{ padding: 20, alignItems: 'center' }}>
								{loading ? (
									<ActivityIndicator size='small' />
								) : (
									<Button mode='outlined' onPress={loadMoreEvents}>
										Load More
									</Button>
								)}
							</View>
						) : null
					}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#fff' : '#666' }]}>
								No events scheduled
							</Text>
							<Text style={[styles.emptySubText, { color: colorScheme === 'dark' ? '#ccc' : '#999' }]}>
								Tap the + button to add a new event
							</Text>
						</View>
					}
				/>
				<TouchableOpacity
					style={[styles.fab, { backgroundColor: colorScheme === 'dark' ? '#bb86fc' : '#6200ee' }]}
					onPress={() => navigation.navigate('EventForm')}
				>
					<Text style={styles.fabText}>+</Text>
				</TouchableOpacity>
			</>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	list: {
		padding: 16
	},
	eventItem: {
		padding: 16,
		borderRadius: 8,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2
	},
	eventTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8
	},
	eventTime: {
		fontSize: 14
	},
	deleteButton: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 90,
		height: '85%',
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8
	},
	deleteText: {
		color: '#fff',
		fontWeight: 'bold'
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
	fab: {
		position: 'absolute',
		width: 56,
		height: 56,
		alignItems: 'center',
		justifyContent: 'center',
		right: 20,
		bottom: 20,
		borderRadius: 28,
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3
	},
	fabText: {
		fontSize: 24,
		color: 'white'
	}
});
