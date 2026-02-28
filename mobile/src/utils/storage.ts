import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'budget_access_token',
  REFRESH_TOKEN: 'budget_refresh_token',
  USER: 'budget_user',
} as const;

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await setItem(KEYS.ACCESS_TOKEN, accessToken);
  await setItem(KEYS.REFRESH_TOKEN, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(KEYS.REFRESH_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await removeItem(KEYS.ACCESS_TOKEN);
  await removeItem(KEYS.REFRESH_TOKEN);
}

export async function saveUser(user: object): Promise<void> {
  await setItem(KEYS.USER, JSON.stringify(user));
}

export async function getUser<T>(): Promise<T | null> {
  const raw = await getItem(KEYS.USER);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function clearUser(): Promise<void> {
  await removeItem(KEYS.USER);
}
