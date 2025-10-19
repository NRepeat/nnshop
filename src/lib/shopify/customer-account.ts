export class ShopifyOAuthConfigurationError extends Error {}
export class ShopifyOAuthError extends Error {}

const base64UrlDecode = (input: string) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = normalized.length % 4;
  const padded =
    padLength === 0 ? normalized : normalized + '='.repeat(4 - padLength);
  return Buffer.from(padded, 'base64');
};

export const decodeIdToken = <T = Record<string, unknown>>(
  token: string,
): T => {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      throw new ShopifyOAuthError('ID token payload is missing');
    }

    const decoded = base64UrlDecode(payload);
    return JSON.parse(decoded.toString('utf8'));
  } catch (error) {
    if (error instanceof ShopifyOAuthError) {
      throw error;
    }
    throw new ShopifyOAuthError('Unable to decode ID token payload');
  }
};

export const getUserInfo = async (tokens: {
  accessToken: string;
  idToken?: string;
}) => {
  try {
    if (tokens.idToken) {
      const userData = decodeIdToken(tokens.idToken);

      const mappedUserData = {
        id: userData.sub?.toString() || userData.id?.toString(),
        email: userData.email,
        name: userData.email,
        image: userData.image,
        emailVerified:
          userData.email_verified || userData.emailVerified || true,
      };

      console.log('mapped userData', mappedUserData);
      return mappedUserData;
    }

    throw new ShopifyOAuthError(
      'No ID token available to get user information',
    );
  } catch (error) {
    console.error('getUserInfo error', error);
    if (error instanceof ShopifyOAuthError) {
      throw error;
    }
    throw new ShopifyOAuthError(
      `Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};
