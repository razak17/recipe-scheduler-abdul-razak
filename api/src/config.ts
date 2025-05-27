export const getConfig = () => ({
	port: parseInt(process.env.PORT || '8000', 10),
	nodeEnv: process.env.NODE_ENV || 'development',
	redisHost: process.env.REDIS_HOST || 'redis',
	redisPort: process.env.REDIS_PORT || '6379',
	redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
	reminderLeadMinutes: parseInt(process.env.REMINDER_LEAD_MINUTES || '15', 10),
	jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
	jwtExpiry: process.env.JWT_EXPIRY || '7d'
});
