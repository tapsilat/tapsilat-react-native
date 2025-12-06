import { PropsWithChildren, useMemo } from 'react';
import { TapsilatSDK } from '@tapsilat/tapsilat-js';
import { TapsilatClientContext } from './context';
import { ensureBearerToken, tapsilatConfig } from '../config/tapsilat';

type SDKConfig = ConstructorParameters<typeof TapsilatSDK>[0];

type ProviderProps = PropsWithChildren<{ overrideConfig?: Partial<SDKConfig> }>;

export const TapsilatProvider = ({ children, overrideConfig }: ProviderProps) => {
  const memoizedConfig = useMemo(() => ({
    baseURL: overrideConfig?.baseURL ?? tapsilatConfig.baseURL,
    bearerToken: ensureBearerToken(overrideConfig?.bearerToken ?? tapsilatConfig.bearerToken),
    timeout: overrideConfig?.timeout ?? tapsilatConfig.timeout,
    maxRetries: overrideConfig?.maxRetries ?? tapsilatConfig.maxRetries,
    retryDelay: overrideConfig?.retryDelay ?? tapsilatConfig.retryDelay,
    debug: overrideConfig?.debug ?? tapsilatConfig.debug
  }), [overrideConfig]);

  const client = useMemo(() => new TapsilatSDK(memoizedConfig), [memoizedConfig]);

  return <TapsilatClientContext.Provider value={client}>{children}</TapsilatClientContext.Provider>;
};
