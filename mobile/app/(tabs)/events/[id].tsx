import { Loader } from '@/components/Loader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRecipeEvent, useRecipeEvents } from '@/hooks/useRecipeEvents';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function EventDetailScreen() {
	const { id } = useLocalSearchParams();
	const { updateEvent, deleteEvent } = useRecipeEvents();
	const { event, loading } = useRecipeEvent(id as string);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigation = useNavigation();
	const colorScheme = useColorScheme();

	const [title, setTitle] = useState('');
	const [eventTime, setEventTime] = useState(new Date());
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

	useFocusEffect(
		useCallback(() => {
			if (event) {
				setTitle(event.title);
				setEventTime(new Date(event.eventTime));
			}
		}, [event])
	);

	if (!event) return null;

	const hasChanges = () => {
		return event && (event.title !== title.trim() || event.eventTime !== eventTime.toISOString());
	};

	const showDatePicker = () => {
		setDatePickerVisibility(true);
	};

	const hideDatePicker = () => {
		setDatePickerVisibility(false);
	};

	const handleConfirm = (date: Date) => {
		setEventTime(date);
		hideDatePicker();
	};

	const handleUpdate = async () => {
		if (!title.trim()) {
			Alert.alert('Error', 'Please enter a title for your event');
			return;
		}

		try {
			setIsSubmitting(true);
			await updateEvent(event.id, {
				title: title.trim(),
				eventTime: eventTime.toISOString()
			});
			navigation.goBack();
		} catch (error) {
			console.error('Error updating event:', error);
			Alert.alert('Error', 'Failed to update event. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		try {
			setIsSubmitting(true);
			await deleteEvent(event.id);
			navigation.goBack();
		} catch (error) {
			console.error('Error deleting event:', error);
			Alert.alert('Error', 'Failed to delete event. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const confirmDelete = () => {
		Alert.alert('Confirm Delete', 'Are you sure you want to delete this event?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', style: 'destructive', onPress: handleDelete }
		]);
	};

	const formatDateTime = (date: Date) => {
		return date.toLocaleString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<View
			style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}
		>
			<View
				style={[styles.formContainer, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}
			>
				<Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Title</Text>
				<TextInput
					style={[
						styles.input,
						{
							color: colorScheme === 'dark' ? '#fff' : '#000',
							backgroundColor: colorScheme === 'dark' ? '#444' : '#f0f0f0'
						}
					]}
					value={title}
					onChangeText={setTitle}
					placeholder='Enter event title'
					placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
				/>

				<Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
					Date & Time
				</Text>
				<TouchableOpacity
					style={[
						styles.dateTimeButton,
						{ backgroundColor: colorScheme === 'dark' ? '#444' : '#f0f0f0' }
					]}
					onPress={showDatePicker}
				>
					<Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>
						{formatDateTime(eventTime)}
					</Text>
				</TouchableOpacity>

				<DateTimePickerModal
					isVisible={isDatePickerVisible}
					mode='datetime'
					onConfirm={handleConfirm}
					onCancel={hideDatePicker}
					date={eventTime}
					minimumDate={new Date()}
				/>

				<TouchableOpacity
					style={[
						styles.updateButton,
						{ backgroundColor: colorScheme === 'dark' ? '#bb86fc' : '#6200ee' },
						isSubmitting && styles.disabledButton
					]}
					onPress={handleUpdate}
					disabled={isSubmitting || !hasChanges()}
				>
					{isSubmitting ? (
						<ActivityIndicator color='#fff' size='small' />
					) : (
						<Text style={styles.buttonText}>Update Event</Text>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.deleteButton,
						{ backgroundColor: colorScheme === 'dark' ? '#cf6679' : '#ff4757' },
						isSubmitting && styles.disabledButton
					]}
					onPress={confirmDelete}
					disabled={isSubmitting}
				>
					<Text style={styles.buttonText}>Delete Event</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16
	},
	formContainer: {
		padding: 16,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2
	},
	label: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 8
	},
	input: {
		height: 50,
		borderRadius: 8,
		padding: 12,
		marginBottom: 16
	},
	dateTimeButton: {
		height: 50,
		borderRadius: 8,
		padding: 12,
		marginBottom: 24,
		justifyContent: 'center'
	},
	updateButton: {
		height: 50,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 12
	},
	deleteButton: {
		height: 50,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center'
	},
	disabledButton: {
		opacity: 0.7
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold'
	}
});
