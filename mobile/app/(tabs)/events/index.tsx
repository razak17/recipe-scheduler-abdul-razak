import { Loader } from '@/components/Loader';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRecipeEvents } from '@/hooks/useRecipeEvents';
import { RecipeEvent } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ActivityIndicator, Button } from 'react-native-paper';

export default function EventsScreen() {
	const { events, loading, hasMore, loadEvents, deleteEvent, refetch } = useRecipeEvents();
	const colorScheme = useColorScheme();

	useFocusEffect(
		useCallback(() => {
			refetch();
		}, [])
	);

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
				<MaterialIcons name='delete' size={24} color='white' />
				<ThemedText style={styles.deleteText}>Delete</ThemedText>
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
			<Pressable
				style={[styles.eventItem, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}
				onPress={() => router.push(`/events/${item.id}`)}
			>
				<ThemedText style={styles.eventTitle} lightColor='#000' darkColor='#fff'>
					{item.title}
				</ThemedText>
				<ThemedText style={styles.eventTime} lightColor='#666' darkColor='#ccc'>
					{formatDateTime(item.eventTime)}
				</ThemedText>
			</Pressable>
		</Swipeable>
	);

	if (loading && events.length === 0) {
		return <Loader />;
	}

	return (
		<ThemedView style={[styles.container]}>
			<FlatList
				data={events}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.list}
				onEndReached={loadMoreEvents}
				onEndReachedThreshold={0.5}
				ListFooterComponent={
					hasMore ? (
						<ThemedView style={{ padding: 20, alignItems: 'center' }}>
							{loading ? (
								<ActivityIndicator size='small' />
							) : (
								<Button mode='outlined' onPress={loadMoreEvents}>
									Load More
								</Button>
							)}
						</ThemedView>
					) : null
				}
				ListEmptyComponent={
					<ThemedView style={styles.emptyContainer}>
						<MaterialIcons name='event' size={64} color={colorScheme === 'dark' ? '#666' : '#ccc'} />
						<ThemedText style={styles.emptyText} lightColor='#000' darkColor='#fff'>
							No events scheduled
						</ThemedText>
						<ThemedText style={styles.emptySubText} lightColor='#999' darkColor='#666'>
							Tap the + button to add a new event
						</ThemedText>
					</ThemedView>
				}
			/>

			<Pressable
				style={({ pressed }) => [
					styles.fab,
					{
						backgroundColor: colorScheme === 'dark' ? '#bb86fc' : '#6200ee',
						opacity: pressed ? 0.8 : 1,
						transform: [{ scale: pressed ? 0.95 : 1 }]
					}
				]}
				onPress={() => router.push('/events/new')}
			>
				<MaterialIcons name='add' size={24} color='white' />
			</Pressable>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	list: {
		padding: 16,
		paddingBottom: 100
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
