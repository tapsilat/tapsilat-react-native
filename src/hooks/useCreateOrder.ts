import { useCallback, useState } from 'react';
import { TapsilatSDK } from '@tapsilat/tapsilat-js';
import { useTapsilatClient } from '../sdk/useTapsilatClient';

type CreateOrderPayload = Parameters<TapsilatSDK['createOrder']>[0];

type TapsilatOrder = Awaited<ReturnType<TapsilatSDK['createOrder']>>;

type CreateOrderResult = {
  createOrder: (payload: CreateOrderPayload) => Promise<TapsilatOrder | null>;
  data: TapsilatOrder | null;
  loading: boolean;
  error: string | null;
};

export const useCreateOrder = (): CreateOrderResult => {
  const client = useTapsilatClient();
  const [data, setData] = useState<TapsilatOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(
    async (payload: CreateOrderPayload) => {
      setLoading(true);
      setError(null);
      try {
        const order = await client.createOrder(payload);
        setData(order);
        return order;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to create order.';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return { createOrder, data, loading, error };
};
