import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, typeStyles } from '../theme';
import { clubOf, formatOpens, formatTimeRange, sessionStatus, spotsLeft } from '../data';
import { Button, CapacityBar, Pill } from './ui';

// Shared status → label/tone mapping so every screen describes a session the same way.
export function statusInfo(session, reg) {
  const status = sessionStatus(session, reg);
  const left = spotsLeft(session);
  switch (status) {
    case 'registered':
      return { status, label: "You're registered", tone: 'success', icon: 'checkmark-circle' };
    case 'waitlist':
      return { status, label: `Waitlist · you're #${reg.position}`, tone: 'warn', icon: 'time' };
    case 'notOpen':
      return { status, label: `Sign-up opens ${formatOpens(session.opensAt)}`, tone: 'info', icon: 'lock-closed' };
    case 'full':
      return { status, label: `Full · ${session.waitlist} on waitlist`, tone: 'danger', icon: 'alert-circle' };
    default:
      return {
        status,
        label: session.capacity === 1 ? 'Available' : `${left} of ${session.capacity} spots left`,
        tone: left <= 2 ? 'warn' : 'primary',
        icon: 'people',
      };
  }
}

export default function SessionCard({ session, reg, reminded, onPress, onAction, showDay, group }) {
  const t = typeStyles[session.type];
  const info = statusInfo(session, reg);

  let action = null;
  if (info.status === 'open') action = { title: session.type === 'Lesson' ? 'Book' : 'Register', variant: 'primary' };
  if (info.status === 'full') action = { title: 'Join waitlist', variant: 'warn' };
  if (info.status === 'notOpen')
    action = reminded
      ? { title: 'Reminder on', variant: 'soft', icon: 'notifications' }
      : { title: 'Remind me', variant: 'secondary', icon: 'notifications-outline' };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${session.title}, ${session.level}, ${formatTimeRange(session.start, session.durationMin)}. ${info.label}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={[styles.stripe, { backgroundColor: t.color }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.typeTag, { backgroundColor: t.soft }]}>
            <Ionicons name={t.icon} size={13} color={t.color} />
            <Text style={[styles.typeText, { color: t.color }]}>{session.type}</Text>
          </View>
          <Text style={styles.level}>{session.level}</Text>
        </View>

        <Text style={styles.title}>{session.title}</Text>
        {group ? (
          <View style={styles.groupRow}>
            <View style={[styles.groupDot, { backgroundColor: group.color }]} />
            <Text style={styles.groupText} numberOfLines={1}>{group.short} · {clubOf(group).name}</Text>
          </View>
        ) : null}
        <Text style={styles.time}>
          {showDay ? `${showDay} · ` : ''}
          {formatTimeRange(session.start, session.durationMin)}
        </Text>
        {session.coach ? <Text style={styles.meta}>{session.coach}{session.price ? ` · $${session.price}` : ''}</Text> : null}

        {info.status === 'open' && session.capacity > 1 ? (
          <View style={{ marginTop: 10 }}>
            <CapacityBar taken={session.taken} capacity={session.capacity} height={6} />
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          <Pill label={info.label} tone={info.tone} icon={info.icon} style={{ flexShrink: 1 }} />
          {action ? (
            <Button
              small
              title={action.title}
              variant={action.variant}
              icon={action.icon}
              onPress={() => onAction?.(info.status)}
              style={{ marginLeft: 8 }}
            />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={colors.faint} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, marginBottom: 12, overflow: 'hidden', ...shadow },
  stripe: { width: 5 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  typeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  level: { fontSize: 14, fontWeight: '700', color: colors.muted },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 8 },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  groupDot: { width: 9, height: 9, borderRadius: 5 },
  groupText: { fontSize: 13, fontWeight: '700', color: colors.muted, flexShrink: 1 },
  time: { fontSize: 15, color: colors.text, marginTop: 3, fontWeight: '500' },
  meta: { fontSize: 14, color: colors.muted, marginTop: 2 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
});
