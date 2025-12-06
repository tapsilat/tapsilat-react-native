import Constants from 'expo-constants';

export type TapsilatRuntimeConfig = {
  baseURL: string;
  bearerToken: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  debug: boolean;
};

type Extra = {
  tapsilat?: Partial<TapsilatRuntimeConfig>;
};

const extra = (Constants.expoConfig?.extra as Extra | undefined) ?? {};
const tapsilatExtra = extra.tapsilat ?? {};

export const tapsilatConfig: TapsilatRuntimeConfig = {
  baseURL:
    tapsilatExtra.baseURL ?? process.env.EXPO_PUBLIC_TAPSILAT_BASE_URL ?? 'https://acquiring.tapsilat.dev/api/v1',
  bearerToken: tapsilatExtra.bearerToken ?? process.env.EXPO_PUBLIC_TAPSILAT_BEARER_TOKEN ?? '',
  timeout: tapsilatExtra.timeout ?? 30000,
  maxRetries: tapsilatExtra.maxRetries ?? 2,
  retryDelay: tapsilatExtra.retryDelay ?? 1000,
  debug: tapsilatExtra.debug ?? false
};

export const ensureBearerToken = (token?: string) => {
  if (token && token.trim().length > 0) {
    return token.trim();
  }
  if (tapsilatConfig.bearerToken) {
    return tapsilatConfig.bearerToken;
  }
  throw new Error('Missing Tapsilat bearer token. Provide EXPO_PUBLIC_TAPSILAT_BEARER_TOKEN or expo.extra.tapsilat.bearerToken.');
};
