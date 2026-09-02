import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { config } from '../config';
import { AppError } from '../middleware/error.middleware';
import { SignupInput, LoginInput } from '../validators';
import logger from '../utils/logger';

export class AuthService {
  async signup(data: SignupInput) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new AppError(400, 'User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          name: data.name,
          settings: {
            create: {
              emailNotifications: true,
              notificationFrequency: 'realtime',
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
      );

      logger.info(`New user registered: ${user.email}`);

      return { user, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Signup error:', error);
      throw new AppError(500, 'Failed to create user');
    }
  }

  async login(data: LoginInput) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
      );

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Login error:', error);
      throw new AppError(500, 'Failed to login');
    }
  }

  async logout(token: string, userId: string) {
    try {
      // Token blacklisting not implemented in database architecture
      // In production, store revoked tokens in Redis with TTL
      // For now, logout is handled client-side by removing the token
      
      logger.info(`User logged out: ${userId}`);
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error);
      throw new AppError(500, 'Failed to logout');
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists
        return { message: 'If the email exists, a reset link has been sent' };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token in user settings or create a temporary token table
      // For now, store in memory or implement a separate password reset tracking system
      // Note: The database_architecture.md doesn't have a password_reset table
      // You may need to implement this differently based on your needs

      // TODO: Send email with reset link
      const resetUrl = `${config.frontend.url}/reset-password?token=${resetToken}`;
      logger.info(`Password reset requested for: ${email}. Reset URL: ${resetUrl}`);

      return { message: 'If the email exists, a reset link has been sent' };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw new AppError(500, 'Failed to process password reset request');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // For now, implement a simple token validation
      // In production, you should store these tokens in Redis or a database table
      // This is a placeholder implementation
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // TODO: Implement proper token validation and user lookup
      // For now, this is a stub that needs to be connected to your token storage
      
      logger.info('Password reset requested with token');

      return { message: 'Password reset functionality needs token storage implementation' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Reset password error:', error);
      throw new AppError(500, 'Failed to reset password');
    }
  }
}

export default new AuthService();
