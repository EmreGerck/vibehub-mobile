import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

type Mode = 'qr' | 'nfc';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode]         = useState<Mode>('qr');
  const [scanning, setScanning] = useState(false);
  const [nfcReady, setNfcReady] = useState(false);
  const scannedRef = useRef(false);

  // NFC init
  useEffect(() => {
    NfcManager.isSupported().then((supported) => {
      if (supported) {
        NfcManager.start().then(() => setNfcReady(true));
      }
    });
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  // ─── QR handler ──────────────────────────────────────────────────────────
  function handleQrScan({ data }: { data: string }) {
    if (scannedRef.current) return;
    scannedRef.current = true;
    resolveDeepLink(data);
    // Reset after 2s so user can scan again
    setTimeout(() => { scannedRef.current = false; }, 2000);
  }

  // ─── NFC handler ─────────────────────────────────────────────────────────
  async function startNfcScan() {
    if (!nfcReady) {
      Alert.alert('NFC not available', 'Your device does not support NFC or it is disabled.');
      return;
    }
    setScanning(true);
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if (tag?.ndefMessage?.[0]) {
        const payload = Ndef.text.decodePayload(tag.ndefMessage[0].payload as any);
        resolveDeepLink(payload);
      } else {
        Alert.alert('Unknown tag', 'This NFC tag does not contain Vibeworks data.');
      }
    } catch (err: any) {
      if (err?.message !== 'cancelled') {
        Alert.alert('Scan failed', 'Could not read the NFC tag. Try again.');
      }
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setScanning(false);
    }
  }

  // ─── Deep link resolver ───────────────────────────────────────────────────
  function resolveDeepLink(raw: string) {
    try {
      // vibeworks://product/ID  or  vibeworks://vendor/SLUG
      const url = raw.startsWith('vibeworks://') ? raw : `vibeworks://${raw.replace(/^https?:\/\/[^/]+\//, '')}`;
      const [, type, param] = url.replace('vibeworks://', '').split('/');
      if (type === 'product') router.push(`/product/${param}`);
      else if (type === 'vendor') router.push(`/vendor/${param}`);
      else Alert.alert('Unrecognized code', raw);
    } catch {
      Alert.alert('Unrecognized code', raw);
    }
  }

  if (!permission) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan</Text>
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'qr' && styles.modeTabActive]}
            onPress={() => setMode('qr')}
          >
            <Text style={[styles.modeTabText, mode === 'qr' && styles.modeTabTextActive]}>
              QR Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'nfc' && styles.modeTabActive]}
            onPress={() => setMode('nfc')}
          >
            <Text style={[styles.modeTabText, mode === 'nfc' && styles.modeTabTextActive]}>
              NFC Tag
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QR mode */}
      {mode === 'qr' && (
        <View style={styles.cameraContainer}>
          {permission.granted ? (
            <>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleQrScan}
              />
              <View style={styles.overlay}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <Text style={styles.scanHint}>Point at a QR code</Text>
              </View>
            </>
          ) : (
            <View style={styles.permissionBox}>
              <Text style={styles.permissionText}>
                Camera access is required to scan QR codes.
              </Text>
              <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
                <Text style={styles.grantBtnText}>Grant access</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* NFC mode */}
      {mode === 'nfc' && (
        <View style={styles.nfcContainer}>
          <View style={styles.nfcCard}>
            <Text style={styles.nfcIcon}>⦿</Text>
            <Text style={styles.nfcTitle}>Tap a Vibeworks NFC tag</Text>
            <Text style={styles.nfcSubtext}>
              Hold your phone near a printed Vibeworks NFC tag to instantly open the artist page.
            </Text>
            {Platform.OS === 'ios' && (
              <Text style={styles.nfcNote}>
                Tap the button below to start scanning. iOS requires an explicit tap to start.
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.nfcScanBtn, scanning && styles.nfcScanBtnActive]}
            onPress={scanning ? undefined : startNfcScan}
            activeOpacity={0.85}
          >
            {scanning ? (
              <>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.nfcScanBtnText}>Scanning…</Text>
              </>
            ) : (
              <Text style={styles.nfcScanBtnText}>
                {Platform.OS === 'ios' ? 'Start NFC Scan' : 'Ready — tap a tag'}
              </Text>
            )}
          </TouchableOpacity>

          {!nfcReady && (
            <Text style={styles.nfcUnavail}>NFC is not available on this device.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const FRAME = 240;
const CORNER = 24;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modeTabActive: { backgroundColor: '#7C3AED' },
  modeTabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  modeTabTextActive: { color: '#FFFFFF' },

  // QR
  cameraContainer: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: FRAME,
    height: FRAME,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#7C3AED',
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  scanHint: { color: '#FFFFFF', fontSize: 15, marginTop: 24, fontWeight: '500' },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  permissionText: { color: '#9CA3AF', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  grantBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  grantBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  // NFC
  nfcContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  nfcCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  nfcIcon: { fontSize: 72, color: '#7C3AED' },
  nfcTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  nfcSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  nfcNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  nfcScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  nfcScanBtnActive: { backgroundColor: '#6D28D9' },
  nfcScanBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  nfcUnavail: { color: '#EF4444', fontSize: 13 },
});
