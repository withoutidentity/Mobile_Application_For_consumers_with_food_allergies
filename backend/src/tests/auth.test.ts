import assert from "node:assert/strict";

import {
  getAccessTokenSecret,
  getRefreshTokenSecret,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from "../utils/auth";

export const runAuthTests = () => {
  process.env.ACCESS_TOKEN_SECRET = "access-secret";
  process.env.REFRESH_TOKEN_SECRET = "refresh-secret";
  delete process.env.JWT_SECRET;

  const accessToken = signAccessToken(42);
  const decoded = verifyAccessToken(accessToken);
  assert.equal(decoded.id, 42);

  delete process.env.ACCESS_TOKEN_SECRET;
  process.env.JWT_SECRET = "legacy-secret";
  assert.equal(getAccessTokenSecret(), "legacy-secret");

  process.env.ACCESS_TOKEN_SECRET = "access-secret";
  process.env.REFRESH_TOKEN_SECRET = "refresh-secret";
  const refreshToken = signRefreshToken(7);
  assert.equal(typeof refreshToken, "string");
  assert.equal(getRefreshTokenSecret(), "refresh-secret");
};
