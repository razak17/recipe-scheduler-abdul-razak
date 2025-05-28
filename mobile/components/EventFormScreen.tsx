import React, { useState } from 'react';
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Keyboard,
	Alert,
	ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createEvent, RecipeEvent } from '../services/api';

const USER_ID = '12345'; // In a real app, this would come from authentication

export const EventFormScreen = () => {
	const [title, setTitle] = useState('');
	const [eventTime, setEventTime] = useState(new Date());
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const navigation = useNavigation();
	const colorScheme = useColorScheme();

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

	const handleSubmit = async () => {
		if (!title.trim()) {
			Alert.alert('Error', 'Please enter a title for your event');
			return;
		}

		try {
			setIsSubmitting(true);
			await createEvent({
				userId: USER_ID,
				title: title.trim(),
				eventTime: eventTime.toISOString()
			});

			navigation.goBack();
		} catch (error) {
			console.error('Error creating event:', error);
			Alert.alert('Error', 'Failed to create event. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
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

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}>
				<View style={[styles.formContainer, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
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

					<Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Date & Time</Text>
					<TouchableOpacity
						style={[styles.dateTimeButton, { backgroundColor: colorScheme === 'dark' ? '#444' : '#f0f0f0' }]}
						onPress={showDatePicker}
					>
						<Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000' }}>{formatDateTime(eventTime)}</Text>
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
							styles.submitButton,
							{ backgroundColor: colorScheme === 'dark' ? '#bb86fc' : '#6200ee' },
							isSubmitting && styles.disabledButton
						]}
						onPress={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<ActivityIndicator color='#fff' size='small' />
						) : (
							<Text style={styles.submitButtonText}>Create Event</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
};

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
	submitButton: {
		height: 50,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center'
	},
	disabledButton: {
		opacity: 0.7
	},
	submitButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold'
	}
});
