export interface JwtPayload {
  username: string;
  sub: string;
}

export interface JwtSignProps {
  email: string;
  userId: string;
}
