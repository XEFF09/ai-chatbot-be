import { UserRole } from '../../types/type.role';

export interface JwtPayload {
  email: string;
  sub: string;
  role: UserRole;
}

export interface JwtSignProps {
  email: string;
  userId: string;
  role: UserRole;
}

export interface GoogleAuthUser {
  googleId: string;
  email: string | undefined;
  fullname: string;
  picture: string | undefined;
  accessToken: string;
}
