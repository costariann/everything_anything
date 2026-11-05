import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt';
import { BadRequestError, UnauthorizedError } from '../../shared/errors/AppError';

export class AuthService {
  async register(data: { email: string; password: string; fullName: string; phone?: string }) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase(), deletedAt: null },
    });

    if (existing) {
      throw new BadRequestError('An account with this email already exists.');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: 'CUSTOMER',
      },
    });

    const tokenPayload = {
      userId: user.id,
      publicId: user.publicId,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        publicId: user.publicId,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase(), deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const tokenPayload = {
      userId: user.id,
      publicId: user.publicId,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        publicId: user.publicId,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedError('User account not found or deactivated.');
      }

      const tokenPayload = {
        userId: user.id,
        publicId: user.publicId,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        publicId: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    return user;
  }
}

export const authService = new AuthService();

