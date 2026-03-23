import jwt from "jsonwebtoken";

const readSecret = (primaryName: string, fallbackName?: string) => {
  const primaryValue = process.env[primaryName];
  const fallbackValue = fallbackName ? process.env[fallbackName] : undefined;
  const value = primaryValue ?? fallbackValue;

  if (!value) {
    const fallbackHint = fallbackName ? ` or ${fallbackName}` : "";
    throw new Error(`Missing required environment variable: ${primaryName}${fallbackHint}`);
  }

  return value;
};

export const getAccessTokenSecret = () =>
  readSecret("ACCESS_TOKEN_SECRET", "JWT_SECRET");

export const getRefreshTokenSecret = () => readSecret("REFRESH_TOKEN_SECRET");

export const signAccessToken = (userId: number) =>
  jwt.sign({ id: userId }, getAccessTokenSecret(), {
    expiresIn: "7d",
  });

export const signRefreshToken = (userId: number) =>
  jwt.sign({ id: userId }, getRefreshTokenSecret(), {
    expiresIn: "14d",
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, getAccessTokenSecret()) as { id: number };
