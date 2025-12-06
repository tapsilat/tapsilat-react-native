import { useCallback, useEffect, useRef, useState } from 'react';
import { TapsilatSDK } from '@tapsilat/tapsilat-js';
import { useTapsilatClient } from '../sdk/useTapsilatClient';

type OrderStatusResponse = Awaited<ReturnType<TapsilatSDK['getOrderStatus']>>;

type UseOrderStatusArgs = {
  referenceId?: string;
  enabled?: boolean;
  pollIntervalMs?: number;
};

type UseOrderStatusResult = {
  status: OrderStatusResponse | null;
  fetchStatus: (referenceId?: string) => Promise<OrderStatusResponse | null>;
  loading: boolean;
  error: string | null;
};

export const useOrderStatus = ({ referenceId, enabled = true, pollIntervalMs = 15000 }: UseOrderStatusArgs) => {
  const client = useTapsilatClient();
  const [status, setStatus] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(
    async (refId?: string) => {
      const lookupId = refId ?? referenceId;
      if (!lookupId) {
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await client.getOrderStatus(lookupId);
        setStatus(response);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to fetch order status.';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [client, referenceId]
  );

  useEffect(() => {
    if (!enabled || !referenceId) {
      return undefined;
    }

    fetchStatus(referenceId);

    intervalRef.current = setInterval(() => {
      fetchStatus(referenceId).catch(() => undefined);
    }, pollIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, fetchStatus, pollIntervalMs, referenceId]);

  return { status, fetchStatus, loading, error } satisfies UseOrderStatusResult;
};
