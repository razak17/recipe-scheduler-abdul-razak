import axios from 'axios';
import Constants from 'expo-constants';

// Get the API URL from the environment variables
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Event {
  id: string;
  userId: string;
  title: string;
  eventTime: string;
  createdAt: string;
}

export interface CreateEventPayload {
  userId: string;
  title: string;
  eventTime: string;
}

export interface UpdateEventPayload {
  title?: string;
  eventTime?: string;
}

export interface DevicePayload {
  userId: string;
  pushToken: string;
}

export const getEvents = async (userId: string): Promise<Event[]> => {
  const response = await api.get<Event[]>(`/events?userId=${userId}`);
  return response.data;
};

export const createEvent = async (payload: CreateEventPayload): Promise<Event> => {
  const {userId, title, eventTime} = payload
  const response = await api.post<Event>(`/events?userId=${userId}`, {
    title,
    eventTime,
  });
  return response.data;
};

export const updateEvent = async (id: string, payload: UpdateEventPayload): Promise<Event> => {
  const response = await api.patch<Event>(`/events/${id}`, payload);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};

export const registerDevice = async (payload: DevicePayload): Promise<void> => {
  await api.post('/devices', payload);
};

