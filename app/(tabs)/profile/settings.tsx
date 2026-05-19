import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

// ─── SettingRow types ─────────────────────────────────────────────────────────

interface NavRowProps {
  kind: 'nav';
  label: string;
  onPress: () => void;
}

interface ToggleRowProps {
  kind: 'toggle';
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

interface LabelRowProps {
  kind: 'label';
  label: string;
  value: string;
}

interface DangerRowProps {
  kind: 'danger';
  label: string;
  onPress: () => void;
}

type SettingRowProps = NavRowProps | ToggleRowProps | LabelRowProps | DangerRowProps;

// ─── SettingRow component ─────────────────────────────────────────────────────

function SettingRow(props: SettingRowProps) {
  if (props.kind === 'toggle') {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{props.label}</Text>
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          trackColor={{ false: '#E5E7EB', true: '#DDD6FE' }}
          thumbColor={props.value ? '#7C3AED' : '#9CA3AF'}
        />
      </View>
    );
  }

  if (props.kind === 'label') {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{props.label}</Text>
        <Text style={styles.rowValue}>{props.value}</Text>
      </View>
    );
  }

  if (props.kind === 'danger') {
    return (
      <TouchableOpacity style={styles.row} onPress={props.onPress} activeOpacity={0.8}>
        <Text style={styles.rowLabelDanger}>{props.label}</Text>
      </TouchableOpacity>
    );
  }

  // nav
  return (
    <TouchableOpacity style={styles.row} onPress={props.onPress} activeOpacity={0.8}>
      <Text style={styles.rowLabel}>{props.label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const [emailPrefs, setEmailPrefs] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // No-op for now
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Account */}
      <Section title="Account">
        <SettingRow
          kind="nav"
          label="Change Password"
          onPress={() => router.push('/(auth)/forgot-password')}
        />
        <View style={styles.divider} />
        <SettingRow
          kind="toggle"
          label="Email Preferences"
          value={emailPrefs}
          onValueChange={setEmailPrefs}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow
          kind="toggle"
          label="Push Notifications"
          value={pushNotifications}
          onValueChange={setPushNotifications}
        />
        <View style={styles.divider} />
        <SettingRow
          kind="toggle"
          label="Order Updates"
          value={orderUpdates}
          onValueChange={setOrderUpdates}
        />
      </Section>

      {/* App */}
      <Section title="App">
        <SettingRow kind="label" label="Version" value="1.0.0" />
        <View style={styles.divider} />
        <SettingRow
          kind="nav"
          label="Privacy Policy"
          onPress={() => Linking.openURL('https://vibehub.com.tr/privacy')}
        />
        <View style={styles.divider} />
        <SettingRow
          kind="nav"
          label="Terms of Service"
          onPress={() => Linking.openURL('https://vibehub.com.tr/terms')}
        />
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone">
        <SettingRow
          kind="danger"
          label="Delete Account"
          onPress={handleDeleteAccount}
        />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7FF' },
  content: { padding: 16, gap: 24, paddingBottom: 40 },

  section: { gap: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#111827' },
  rowLabelDanger: { flex: 1, fontSize: 15, fontWeight: '600', color: '#EF4444' },
  rowValue: { fontSize: 14, color: '#9CA3AF' },
  chevron: { fontSize: 22, color: '#D1D5DB' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
});
