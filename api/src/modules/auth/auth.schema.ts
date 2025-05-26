import { z } from 'zod';

export const registerSchema = {
	body: z.object({
		email: z.string().email('Invalid email format'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		name: z.string().optional()
	})
};

export const loginSchema = {
	body: z.object({
		email: z.string().email('Invalid email format'),
		password: z.string()
	})
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Invalid email format')
  })
}

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
  })
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
}

export type RegisterUserBody = z.TypeOf<typeof registerSchema.body>;
export type LoginUserBody = z.TypeOf<typeof loginSchema.body>;
export type ForgotPasswordBody = z.TypeOf<typeof forgotPasswordSchema.body>;
export type ResetPasswordBody = z.TypeOf<typeof resetPasswordSchema.body>;
export type RefreshTokenBody = z.TypeOf<typeof refreshTokenSchema.body>;
