# Tapsilat React Native SDK Playground

This Expo-powered React Native app demonstrates how to integrate the [`@tapsilat/tapsilat-js`](https://www.npmjs.com/package/@tapsilat/tapsilat-js) TypeScript SDK on mobile. It ships with:

- A `TapsilatProvider` that bootstraps a singleton `TapsilatSDK` instance and exposes it via React context.
- Hooks (`useCreateOrder`, `useOrderStatus`) that wrap common payment lifecycle actions with loading/error state.
- A demo screen showing order creation, hosted checkout deep-linking, and status polling flows you can adapt in your product.

## Installation

```bash
npm i @tapsilat/tapsilat-react-native
```


## Getting started

```bash
npm install
export EXPO_PUBLIC_TAPSILAT_BEARER_TOKEN="<sandbox-or-prod-token>"
npm run start
```

> On Windows, set the environment variable with `setx EXPO_PUBLIC_TAPSILAT_BEARER_TOKEN "value"` or add it to `.env` via your preferred shell. You can also place the token inside `app.json > expo.extra.tapsilat.bearerToken`.

## Key files

- `src/config/tapsilat.ts` – reads runtime configuration (base URL, bearer token, retries) from Expo `extra` or env vars and validates the token.
- `src/sdk/TapsilatProvider.tsx` – instantiates `TapsilatSDK` once and shares it via React context.
- `src/hooks/useCreateOrder.ts` – helper hook for `createOrder` with loading/error handling.
- `src/hooks/useOrderStatus.ts` – configurable polling hook for `getOrderStatus`.
- `src/screens/DemoScreen.tsx` – reference UI that wires hooks together and demonstrates checkout/status flows.

## Customizing the SDK client

```tsx
import { TapsilatProvider } from './src/sdk/TapsilatProvider';

const App = () => (
  <TapsilatProvider
    overrideConfig={{
      baseURL: 'https://panel.tapsilat.dev/api/v1',
      bearerToken: '<your-token>',
      timeout: 45000,
      retryAttempts: 3,
      debug: true
    }}
  >
    <YourNavigationTree />
  </TapsilatProvider>
);
```

Override values are merged with the defaults in `tapsilatConfig`, so you can supply only what you need.

## Using the hooks in your screens

```tsx
import { useCreateOrder } from './src/hooks/useCreateOrder';

const CheckoutScreen = () => {
  const { createOrder, loading, error, data } = useCreateOrder();

  const handleCheckout = async () => {
    const order = await createOrder({
      amount: 199.9,
      currency: 'TRY',
      locale: 'tr',
      description: 'Pro plan',
      buyer: {
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '+905551234567'
      }
    });

    if (order?.checkout_url) {
      // Use Linking to open the hosted checkout page.
    }
  };

  return null;
};
```

Pair `useCreateOrder` with `useOrderStatus` to poll for completion, trigger refunds, or show payment timelines directly inside your RN experience.

## Project scripts

| Script | Description |
| --- | --- |
| `npm run start` | Launch Metro/Expo dev server |
| `npm run android` | Build/run the native Android binary (requires Android Studio) |
| `npm run ios` | Build/run the native iOS binary (requires Xcode) |
| `npm run web` | Run the experience on web via Expo |
| `npm run typecheck` | Validate TypeScript types without emitting artifacts |

## Next steps

- Replace the demo screen with your navigation stack and extract the hooks/components you need.
- Persist reference IDs securely (e.g., to AsyncStorage or your backend) before redirecting users to the hosted checkout.
- Explore more `@tapsilat/tapsilat-js` endpoints (refunds, subscriptions, webhook verification) following the same provider/hook pattern established here.
