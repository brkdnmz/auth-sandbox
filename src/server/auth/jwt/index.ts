import jwt from "jsonwebtoken";
import {
  authTokenSchema,
  sessionUserSchema,
  type AuthToken,
  type UserModel,
} from "~/types";

/**
 * Generates a JWT containing the user information.
 * @param user The user information.
 * @param duration How long the token will last (in seconds).
 */
export function generateJwt(
  user: Omit<UserModel, "password">,
  duration: number,
): string {
  // Take the current time in seconds (since epoch).
  const dateNow = Math.floor(Date.now() / 1000);

  // Generate the token (it's in the encrypted form).
  const token = jwt.sign(
    {
      iat: dateNow,
      exp: dateNow + duration,
      user: sessionUserSchema.parse(user), // Drop the `password` attribute.
    },
    "secret",
  );

  return token;
}

/**
 * Decodes the given JWT.
 * @param token The JWT to decode. Must satisfy `authTokenSchema`.
 * @returns The decoded token in JSON format: an object satisfying `authTokenSchema`.
 */
export function decodeJwt(token: string) {
  const decodedToken = jwt.decode(token, { json: true });
  if (!decodedToken) return null;
  return authTokenSchema.parse(decodedToken);
}

export function isTokenExpired(token: AuthToken) {
  return token.exp <= Math.floor(Date.now() / 1000);
}
