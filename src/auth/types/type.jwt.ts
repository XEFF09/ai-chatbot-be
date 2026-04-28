export interface JwtPayload {
  email: string;
  sub: string;
}

export interface JwtSignProps {
  email: string;
  userId: string;
}
