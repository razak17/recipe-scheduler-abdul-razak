import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

interface AppNotification {
	title: string;
	body: string;
	timestamp: string;
}

export const useNotifications = () => {
	const [notifications, setNotifications] = useState<AppNotification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const addNotification = (notification: { title: string; body: string }) => {
		try {
			setNotifications((prev) => [
				{
					title: notification.title,
					body: notification.body,
					timestamp: new Date().toISOString()
				},
				...prev
			]);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to add notification'));
		}
	};

	useEffect(() => {
		const setupNotifications = async () => {
			try {
				const subscription = Notifications.addNotificationReceivedListener((notification) => {
					addNotification({
						title: notification.request.content.title || 'Reminder',
						body: notification.request.content.body || ''
					});
				});

				// Configure notification handler
				await Notifications.setNotificationHandler({
					handleNotification: async () => ({
						shouldShowAlert: true,
						shouldPlaySound: true,
						shouldSetBadge: false,
						shouldShowBanner: true,
						shouldShowList: true
					})
				});

				return () => subscription.remove();
			} catch (err) {
				setError(err instanceof Error ? err : new Error('Notification setup failed'));
			} finally {
				setLoading(false);
			}
		};

		const cleanup = setupNotifications();
		return () => {
			cleanup.then((fn) => fn?.()).catch(console.error);
		};
	}, []);

	const clearError = () => setError(null);

	return {
		notifications,
		addNotification,
		loading,
		error,
		clearError
	};
};
