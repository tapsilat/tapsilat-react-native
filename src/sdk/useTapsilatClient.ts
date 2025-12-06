import { useContext } from 'react';
import { TapsilatClientContext } from './context';

export const useTapsilatClient = () => {
  const client = useContext(TapsilatClientContext);
  if (!client) {
    throw new Error('Tapsilat client is unavailable. Wrap your tree with <TapsilatProvider>.');
  }
  return client;
};
