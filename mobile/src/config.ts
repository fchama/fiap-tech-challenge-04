import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3000;

/**
 * Descobre a URL base da API.
 *
 * 1. `EXPO_PUBLIC_API_URL` (arquivo `.env`) tem prioridade.
 * 2. Em desenvolvimento, usa o IP da máquina que serve o Metro (o mesmo que o
 *    Expo Go usa para carregar o app), o que funciona em celular físico na
 *    mesma rede Wi-Fi e no simulador iOS.
 * 3. Fallback: emulador Android usa 10.0.2.2; demais, localhost.
 */
const resolveApiUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}`;

  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${fallbackHost}:${API_PORT}`;
};

export const API_URL = resolveApiUrl();
