import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'budget_access_token',
  REFRESH_TOKEN: 'budget_refresh_token',
  USER: 'budget_user',
} as const;

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
  await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
}

export async function saveUser(user: object): Promise<void> {
  await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user));
}

export async function getUser<T>(): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(KEYS.USER);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function clearUser(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.USER);
}
