import { act, renderHook } from '@testing-library/react';
import { useCreateOrder } from '../useCreateOrder';
import { useTapsilatClient } from '../../sdk/useTapsilatClient';

jest.mock('../../sdk/useTapsilatClient', () => ({
  useTapsilatClient: jest.fn()
}));

const mockedUseClient = useTapsilatClient as jest.MockedFunction<typeof useTapsilatClient>;

describe('useCreateOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an order and stores the response', async () => {
    const mockOrder = { reference_id: 'order-123', checkout_url: 'https://checkout' } as const;
    const payload = { amount: 42 } as const;
    const createOrder = jest.fn().mockResolvedValue(mockOrder);
    mockedUseClient.mockReturnValue({ createOrder } as never);

    const { result } = renderHook(() => useCreateOrder());

    await act(async () => {
      const response = await result.current.createOrder(payload as any);
      expect(response).toEqual(mockOrder);
    });

    expect(createOrder).toHaveBeenCalledWith(payload);
    expect(result.current.data).toEqual(mockOrder);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('surfaces the underlying error message when creation fails', async () => {
    const createOrder = jest.fn().mockRejectedValue(new Error('Request failed'));
    mockedUseClient.mockReturnValue({ createOrder } as never);

    const { result } = renderHook(() => useCreateOrder());

    await act(async () => {
      const response = await result.current.createOrder({} as any);
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe('Request failed');
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('falls back to a generic error when a non-Error is thrown', async () => {
    const createOrder = jest.fn().mockRejectedValue('kaput');
    mockedUseClient.mockReturnValue({ createOrder } as never);

    const { result } = renderHook(() => useCreateOrder());

    await act(async () => {
      const response = await result.current.createOrder({} as any);
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe('Unable to create order.');
    expect(result.current.data).toBeNull();
  });
});
