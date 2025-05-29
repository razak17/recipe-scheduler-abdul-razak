import { API_URL, TOKEN } from '@/constants/api';
import axios from 'axios';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

const apiURL = Constants.expoConfig?.extra?.apiUrl || API_URL;
const authToken = TOKEN;

export interface RecipeEvent {
	id: string;
	userId?: string;
	title: string;
	eventTime: string;
	createdAt: string;
}

const api = axios.create({
	baseURL: apiURL,
	headers: {
		'Content-Type': 'application/json',
		// Ngrok free tier requires this header
		'ngrok-skip-browser-warning': 'true',
		Authorization: `Bearer ${authToken}`
	}
});

api.interceptors.request.use((config) => {
	console.log('Making request to:', config.url);
	return config;
});

api.interceptors.response.use(
	(response) => {
		console.log('Response from:', response.config.url);
		return response;
	},
	(error) => {
		let errorMessage = 'Something went wrong';
		let showAlert = false;
		let alertTitle = 'Error';

		if (error.response) {
			const responseData = error.response.data;

			if (typeof responseData === 'string') {
				errorMessage = responseData;
			} else if (responseData?.error) {
				errorMessage = responseData.error;
			} else if (responseData?.message) {
				errorMessage = responseData.message;
			} else if (responseData?.errors) {
				errorMessage = (responseData.errors as { message: string }[]).map((e) => e.message).join('\n');
			} else {
				errorMessage = `Server error: ${error.response.status}`;
			}

			if (
				errorMessage.toLowerCase().includes('future') ||
				errorMessage.toLowerCase().includes('date') ||
				errorMessage.toLowerCase().includes('time')
			) {
				errorMessage = 'Please select a future date and time';
			}

			showAlert = true;
		} else if (error.request) {
			errorMessage = 'No response from server - please check your connection';
			alertTitle = 'Connection Error';
			showAlert = true;
		} else {
			errorMessage = error.message || 'Failed to process request';
		}

		console.error('API Error:', errorMessage, error.config?.url);

		const apiError = new Error(errorMessage);

		if (showAlert) {
			Alert.alert(alertTitle, errorMessage, [{ text: 'OK' }]);
		}

		return Promise.reject(apiError);
	}
);

export const registerDevice = async (pushToken: string) => {
	try {
		const response = await api.post('/devices', { pushToken });
		return response.data;
	} catch (error) {
		console.error('Failed to register device token:', error);
		throw error;
	}
};

export const getEvents = async (limit = 10, page = 1) => {
	try {
		const response = await api.get<{
			data: RecipeEvent[];
			pagination: {
				total: number;
				page: number;
				limit: number;
				pages: number;
				hasMore: boolean;
			};
		}>('/events', { params: { limit, page } });
		return response.data;
	} catch (error) {
		console.error('Failed to fetch events:', error);
		throw error;
	}
};

export const getEventById = async (id: string) => {
	try {
		const response = await api.get<RecipeEvent>(`/events/${id}`);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch event by ID:', error);
		throw error;
	}
};

export const createEvent = async (event: Omit<RecipeEvent, 'id' | 'createdAt' | 'userId'>) => {
	try {
		const response = await api.post<RecipeEvent>('/events', event);
		return response.data;
	} catch (error) {
		console.error('Failed to create event:', error);
		throw error;
	}
};

export const updateEvent = async (id: string, updates: Partial<RecipeEvent>) => {
	try {
		const response = await api.patch<RecipeEvent>(`/events/${id}`, updates);
		return response.data;
	} catch (error) {
		console.error('Failed to update event:', error);
		throw error;
	}
};

export const deleteEvent = async (id: string) => {
	try {
		await api.delete(`/events/${id}`);
	} catch (error) {
		console.error('Failed to delete event:', error);
		throw error;
	}
};
