import { act, renderHook, waitFor } from '@testing-library/react';
import { useOrderStatus } from '../useOrderStatus';
import { useTapsilatClient } from '../../sdk/useTapsilatClient';

jest.mock('../../sdk/useTapsilatClient', () => ({
  useTapsilatClient: jest.fn()
}));

const mockedUseClient = useTapsilatClient as jest.MockedFunction<typeof useTapsilatClient>;

describe('useOrderStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('returns null without calling the API when no reference ID is available', async () => {
    const getOrderStatus = jest.fn();
    mockedUseClient.mockReturnValue({ getOrderStatus } as never);

    const { result } = renderHook(() => useOrderStatus({ enabled: false }));

    let response: unknown;
    await act(async () => {
      response = await result.current.fetchStatus();
    });

    expect(response).toBeNull();
    expect(getOrderStatus).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('fetches and stores the order status when a reference ID exists', async () => {
    const apiResponse = { status: 'COMPLETED', referenceId: 'order-123' } as const;
    const getOrderStatus = jest.fn().mockResolvedValue(apiResponse);
    mockedUseClient.mockReturnValue({ getOrderStatus } as never);

    const { result } = renderHook(() => useOrderStatus({ referenceId: 'order-123', enabled: false }));

    await act(async () => {
      const response = await result.current.fetchStatus();
      expect(response).toEqual(apiResponse);
    });

    expect(getOrderStatus).toHaveBeenCalledWith('order-123');
    expect(result.current.status).toEqual(apiResponse);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('polls automatically when enabled', async () => {
    jest.useFakeTimers();
    const getOrderStatus = jest.fn().mockResolvedValue({ status: 'PENDING', referenceId: 'order-xyz' });
    mockedUseClient.mockReturnValue({ getOrderStatus } as never);

    renderHook(() => useOrderStatus({ referenceId: 'order-xyz', enabled: true, pollIntervalMs: 25 }));

    await waitFor(() => expect(getOrderStatus).toHaveBeenCalledTimes(1));

    await act(async () => {
      jest.advanceTimersByTime(25);
    });

    await waitFor(() => expect(getOrderStatus).toHaveBeenCalledTimes(2));
  });
});
