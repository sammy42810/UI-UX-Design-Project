import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadow } from '../theme';

export function haptic(kind = 'success') {
  try {
    if (kind === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (kind === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (e) {
    // haptics are a nice-to-have
  }
}

// ---------- Button ----------
const VARIANTS = {
  primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
  secondary: { bg: colors.card, fg: colors.primary, border: colors.primary },
  soft: { bg: colors.primarySoft, fg: colors.primaryDark, border: colors.primarySoft },
  danger: { bg: colors.card, fg: colors.danger, border: '#F1B8B2' },
  dangerSolid: { bg: colors.danger, fg: '#fff', border: colors.danger },
  warn: { bg: colors.warn, fg: '#fff', border: colors.warn },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
};

export function Button({ title, onPress, variant = 'primary', icon, small, disabled, loading, style, accessibilityLabel }) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 19} color={v.fg} style={{ marginRight: 6 }} /> : null}
          <Text style={[styles.btnText, small && styles.btnTextSmall, { color: v.fg }]} numberOfLines={1}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// ---------- Pill ----------
const TONES = {
  neutral: [colors.bg, colors.muted],
  primary: [colors.primarySoft, colors.primaryDark],
  success: [colors.successSoft, colors.success],
  warn: [colors.warnSoft, colors.warn],
  danger: [colors.dangerSoft, colors.danger],
  info: [colors.infoSoft, colors.info],
};

export function Pill({ label, tone = 'neutral', icon, style }) {
  const [bg, fg] = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      {icon ? <Ionicons name={icon} size={13} color={fg} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// ---------- Chip (filter toggle) ----------
export function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

// ---------- Capacity bar ----------
export function CapacityBar({ taken, capacity, height = 8 }) {
  const pct = Math.min(1, taken / capacity);
  const color = pct >= 1 ? colors.danger : pct >= 0.8 ? colors.warn : colors.primary;
  return (
    <View style={[styles.barTrack, { height, borderRadius: height / 2 }]}>
      <View style={{ width: `${pct * 100}%`, height, backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

// ---------- Bottom sheet ----------
export function Sheet({ visible, onClose, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetWrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.grabber} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

// ---------- Confirm dialog (styled to match the app, with large tap targets) ----------
export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Go back', destructive, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogWrap}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>{title}</Text>
          {message ? <Text style={styles.dialogMsg}>{message}</Text> : null}
          <View style={{ gap: 10, marginTop: 18 }}>
            <Button title={confirmLabel} variant={destructive ? 'dangerSolid' : 'primary'} onPress={onConfirm} />
            <Button title={cancelLabel} variant="ghost" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------- Toast ----------
const ToastContext = createContext({ show: () => {} });

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setToast(null));
  }, [opacity]);

  const show = useCallback(
    (message, opts = {}) => {
      clearTimeout(timer.current);
      setToast({ message, ...opts, key: Date.now() });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, opts.actionLabel ? 5000 : 2600);
    },
    [hide, opacity]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View pointerEvents="box-none" style={[styles.toastWrap, { bottom: insets.bottom + 72, opacity }]}>
          <View style={styles.toast} accessibilityLiveRegion="polite">
            <Ionicons name={toast.icon || 'checkmark-circle'} size={20} color={colors.accent} />
            <Text style={styles.toastText}>{toast.message}</Text>
            {toast.actionLabel ? (
              <Pressable
                onPress={() => {
                  toast.onAction?.();
                  hide();
                }}
                hitSlop={10}
                accessibilityRole="button"
              >
                <Text style={styles.toastAction}>{toast.actionLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// ---------- Empty state ----------
export function EmptyState({ icon, title, body, actionLabel, onAction }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
      {actionLabel ? <Button title={actionLabel} onPress={onAction} style={{ marginTop: 16, alignSelf: 'center', paddingHorizontal: 24 }} /> : null}
    </View>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export const styles = StyleSheet.create({
  btn: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnSmall: { minHeight: 40, paddingHorizontal: 12, borderRadius: 10 },
  btnText: { fontSize: 17, fontWeight: '700' },
  btnTextSmall: { fontSize: 15 },

  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: 13, fontWeight: '700' },

  chip: {
    paddingHorizontal: 14,
    height: 38,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 15, fontWeight: '600', color: colors.text },
  chipTextOn: { color: '#fff' },

  barTrack: { backgroundColor: '#E7ECEA', overflow: 'hidden' },

  sheetWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10,25,22,0.45)' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, maxHeight: '92%' },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 12 },

  dialogWrap: { flex: 1, backgroundColor: 'rgba(10,25,22,0.5)', justifyContent: 'center', padding: 28 },
  dialog: { backgroundColor: colors.card, borderRadius: 20, padding: 22, ...shadow },
  dialogTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  dialogMsg: { fontSize: 16, color: colors.muted, marginTop: 8, lineHeight: 22 },

  toastWrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#13231F',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    maxWidth: 520,
    width: '100%',
    ...shadow,
  },
  toastText: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  toastAction: { color: colors.accent, fontSize: 15, fontWeight: '800' },

  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 28 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: '800', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 21 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
});
