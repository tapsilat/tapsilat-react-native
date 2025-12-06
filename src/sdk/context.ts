import { createContext } from 'react';
import { TapsilatSDK } from '@tapsilat/tapsilat-js';

export const TapsilatClientContext = createContext<TapsilatSDK | null>(null);
