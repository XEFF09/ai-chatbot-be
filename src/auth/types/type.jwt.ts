export interface JwtPayload {
  email: string;
  sub?: string;
}

export interface JwtSignProps {
  email: string;
  userId: string;
}

export interface GoogleAuthUser {
  googleId: string;
  email: string | undefined;
  fullname: string;
  picture: string | undefined;
  accessToken: string;
}
