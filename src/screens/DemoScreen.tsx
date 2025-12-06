import { useEffect, useMemo, useState } from 'react';
import type { Currency, Locale, OrderCreateRequest } from '@tapsilat/tapsilat-js';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { colors } from '../theme/colors';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { useOrderStatus } from '../hooks/useOrderStatus';

const currencyOptions: Currency[] = ['TRY', 'USD', 'EUR', 'GBP'];
const defaultLocale: Locale = 'tr';

const normalizeCurrency = (value: string): Currency => {
  const candidate = value.toUpperCase() as Currency;
  return currencyOptions.includes(candidate) ? candidate : 'TRY';
};

const normalizeLocale = (value: string): Locale => {
  const candidate = value.toLowerCase();
  return candidate === 'en' ? 'en' : defaultLocale;
};

const parseMetadata = (value: string) => {
  if (!value.trim()) {
    return {} as Record<string, string>;
  }
  return value.split(',').reduce<Record<string, string>>((acc, pair) => {
    const [key, rawValue] = pair.split(':').map((segment) => segment.trim());
    if (key && rawValue) {
      acc[key] = rawValue;
    }
    return acc;
  }, {});
};

const DemoScreen = () => {
  const [amount, setAmount] = useState('150.75');
  const [currency, setCurrency] = useState('TRY');
  const [locale, setLocale] = useState('tr');
  const [name, setName] = useState('Ayse');
  const [surname, setSurname] = useState('Kaya');
  const [email, setEmail] = useState('ayse.kaya@example.com');
  const [phone, setPhone] = useState('+905551112233');
  const [description, setDescription] = useState('Premium subscription - Monthly plan');
  const [metadata, setMetadata] = useState('plan:PREMIUM-MONTHLY,segment:new');
  const [orderSnapshot, setOrderSnapshot] = useState<{ amount: number; currency: Currency } | null>(null);

  const { createOrder, data: order, loading: creating, error: createError } = useCreateOrder();
  const [statusReference, setStatusReference] = useState('');
  const {
    status,
    fetchStatus,
    loading: statusLoading,
    error: statusError
  } = useOrderStatus({ referenceId: statusReference, enabled: Boolean(statusReference) });

  useEffect(() => {
    if (order?.reference_id) {
      setStatusReference(order.reference_id);
    }
  }, [order?.reference_id]);

  const handleSubmit = async () => {
    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive number.');
      return;
    }

    const metadataRecord = parseMetadata(metadata);
    if (description.trim().length > 0) {
      metadataRecord.description = description.trim();
    }

    const orderPayload: OrderCreateRequest = {
      amount: normalizedAmount,
      currency: normalizeCurrency(currency),
      locale: normalizeLocale(locale),
      buyer: {
        name,
        surname,
        email,
        gsm_number: phone
      },
      basket_items: [
        {
          id: 'subscription_1',
          name: 'Subscription',
          category1: 'Service',
          category2: 'Digital',
          item_type: 'VIRTUAL',
          price: normalizedAmount,
          quantity: 1
        }
      ],
      billing_address: {
        billing_type: 'PERSONAL',
        address: 'Demo Billing Address',
        city: 'Istanbul',
        contact_name: `${name} ${surname}`,
        country: 'TR',
        zip_code: '34000'
      },
      ...(Object.keys(metadataRecord).length ? { metadata: metadataRecord } : {})
    };

    const response = await createOrder(orderPayload);
    if (response?.reference_id) {
      setStatusReference(response.reference_id);
      setOrderSnapshot({ amount: normalizedAmount, currency: orderPayload.currency });
    }
  };

  const checkoutUrl = order?.checkout_url;

  const statusBadge = useMemo(() => {
    if (!status?.status) {
      return null;
    }
    const palette = {
      completed: colors.success,
      failed: colors.danger,
      canceled: colors.danger,
      pending: colors.primary
    } as const;

    const background = palette[status.status as keyof typeof palette] ?? colors.primary;
    return (
      <View style={[styles.badge, { backgroundColor: background }]}>
        <Text style={styles.badgeText}>{status.status.toUpperCase()}</Text>
      </View>
    );
  }, [status?.status]);

  return (
    <View style={styles.wrapper}>
      <Section title="Create checkout order" description="Generate a hosted checkout URL directly from your device.">
        <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <Field label="Currency" value={currency} onChangeText={setCurrency} helper={`Options: ${currencyOptions.join(', ')}`} />
        <Field label="Locale" value={locale} onChangeText={setLocale} />
        <Field label="Buyer name" value={name} onChangeText={setName} />
        <Field label="Buyer surname" value={surname} onChangeText={setSurname} />
        <Field label="Buyer email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label="Buyer phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Description" value={description} onChangeText={setDescription} multiline />
        <Field label="Metadata" value={metadata} onChangeText={setMetadata} helper="Comma separated key:value pairs" />

        {createError ? <Text style={styles.errorText}>{createError}</Text> : null}

        <PrimaryButton
          label={creating ? 'Creating order...' : 'Create order'}
          onPress={handleSubmit}
          disabled={creating}
        />
      </Section>

      {order ? (
        <Section title="Latest order" description="Use this data to drive client-side redirects or server calls.">
          <InfoRow label="Reference ID" value={order.reference_id} />
          {orderSnapshot ? (
            <InfoRow label="Amount" value={`${orderSnapshot.amount} ${orderSnapshot.currency}`} />
          ) : null}
          <InfoRow label="Conversation ID" value={order.conversation_id ?? '—'} />
          <InfoRow label="Checkout URL" value={order.checkout_url ?? 'Not generated yet'} numberOfLines={2} />
          {checkoutUrl ? (
            <PrimaryButton label="Open checkout" variant="secondary" onPress={() => Linking.openURL(checkoutUrl)} />
          ) : null}
        </Section>
      ) : null}

      <Section title="Track order status" description="Poll the Tapsilat API for real-time state.">
        <Field label="Reference ID" value={statusReference} onChangeText={setStatusReference} />
        {statusError ? <Text style={styles.errorText}>{statusError}</Text> : null}
        <PrimaryButton
          label={statusLoading ? 'Checking status...' : 'Check status'}
          onPress={() => fetchStatus(statusReference)}
          disabled={!statusReference || statusLoading}
        />
        {statusBadge}
        {status?.status && (
          <View style={styles.statusContainer}>
            <InfoRow label="Status" value={status.status} />
            <InfoRow label="Reference ID" value={status.referenceId ?? '—'} />
            <InfoRow label="Updated at" value={status.lastUpdatedAt ?? 'n/a'} />
          </View>
        )}
      </Section>
    </View>
  );
};

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const Field = ({
  label,
  helper,
  ...textInputProps
}: {
  label: string;
  helper?: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, textInputProps.multiline && styles.multilineInput]}
      placeholder={label}
      placeholderTextColor={colors.muted}
      {...textInputProps}
    />
    {helper ? <Text style={styles.helper}>{helper}</Text> : null}
  </View>
);

const InfoRow = ({ label, value, numberOfLines = 1 }: { label: string; value: string | number; numberOfLines?: number }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={numberOfLines}>
      {value}
    </Text>
  </View>
);

const PrimaryButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.button,
      variant === 'secondary' && styles.secondaryButton,
      disabled && styles.disabledButton,
      pressed && !disabled && styles.pressedButton
    ]}
  >
    <Text style={[styles.buttonLabel, variant === 'secondary' && styles.secondaryButtonLabel]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    gap: 24
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  sectionDescription: {
    color: colors.muted,
    fontSize: 14
  },
  sectionBody: {
    gap: 12
  },
  field: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text
  },
  helper: {
    fontSize: 12,
    color: colors.muted
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 16,
    backgroundColor: '#fdfdff'
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: '#e7efff'
  },
  secondaryButtonLabel: {
    color: colors.primary
  },
  disabledButton: {
    opacity: 0.6
  },
  pressedButton: {
    opacity: 0.85
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center'
  },
  infoLabel: {
    fontWeight: '500',
    color: colors.muted,
    flex: 1
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    color: colors.text,
    fontFamily: 'Courier'
  },
  errorText: {
    color: colors.danger,
    fontSize: 13
  },
  statusContainer: {
    gap: 8
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12
  }
});

export default DemoScreen;
