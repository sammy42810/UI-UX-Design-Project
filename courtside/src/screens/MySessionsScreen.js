// Task 2 lives here. Revision 1 from our usability test: the old "Schedule" tab was
// mistaken for the club schedule and "Manage" looked like an employee control, so
// this tab is called "My Sessions" and Cancel / Add to calendar sit right on each card.
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, typeStyles } from '../theme';
import { CALENDARS, clubOf, dayChip, formatDayLong, formatTimeRange } from '../data';
import { useStore } from '../store';
import CalendarSheet from '../components/CalendarSheet';
import { Button, ConfirmDialog, EmptyState, Pill, haptic, useToast } from '../components/ui';

function countdown(iso) {
  const ms = new Date(iso) - new Date();
  const h = Math.round(ms / 3600e3);
  if (h < 1) return 'Starting soon';
  if (h < 24) return `In ${h} hour${h === 1 ? '' : 's'}`;
  const d = Math.round(h / 24);
  return `In ${d} day${d === 1 ? '' : 's'}`;
}

export default function MySessionsScreen({ navigation, route }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState(route.params?.tab || 'registered');
  const [calSession, setCalSession] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind, session }

  useEffect(() => {
    if (route.params?.tab) setTab(route.params.tab);
  }, [route.params?.tab]);

  const now = new Date();
  const mine = state.sessions
    .filter((s) => state.registrations[s.id] && new Date(s.start) > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const registered = mine.filter((s) => state.registrations[s.id].status === 'registered');
  const waitlisted = mine.filter((s) => state.registrations[s.id].status === 'waitlist');
  const list = tab === 'registered' ? registered : waitlisted;

  const doCancel = () => {
    const s = confirm.session;
    const prev = state.registrations[s.id];
    setConfirm(null);
    dispatch({ type: 'CANCEL', id: s.id });
    haptic('warning');
    toast.show(`Cancelled ${s.title}`, {
      icon: 'close-circle',
      actionLabel: 'Undo',
      onAction: () => dispatch({ type: 'RESTORE', id: s.id, reg: prev }),
    });
  };

  const doLeave = () => {
    const s = confirm.session;
    setConfirm(null);
    dispatch({ type: 'LEAVE_WAITLIST', id: s.id });
    toast.show('You left the waitlist', { icon: 'exit' });
  };

  const groupOf = (s) => state.groups.find((g) => g.id === s.groupId);

  const renderItem = ({ item: s, index }) => {
    const reg = state.registrations[s.id];
    const t = typeStyles[s.type];
    const isNext = tab === 'registered' && index === 0;
    return (
      <View style={[styles.card, isNext && styles.cardNext]}>
        <Pressable onPress={() => navigation.navigate('Session', { id: s.id })} accessibilityRole="button" accessibilityLabel={`${s.title} details`}>
          <View style={styles.cardTop}>
            <View style={[styles.dateBox, { backgroundColor: t.soft }]}>
              <Text style={[styles.dateDow, { color: t.color }]}>{dayChip(s.start).dow.toUpperCase()}</Text>
              <Text style={[styles.dateNum, { color: t.color }]}>{new Date(s.start).getDate()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {isNext ? <Text style={styles.nextLabel}>NEXT UP · {countdown(s.start).toUpperCase()}</Text> : null}
              <Text style={styles.title}>{s.title}</Text>
              {groupOf(s) ? (
                <View style={styles.groupRow}>
                  <View style={[styles.groupDot, { backgroundColor: groupOf(s).color }]} />
                  <Text style={styles.groupName} numberOfLines={1}>{groupOf(s).short} · {clubOf(groupOf(s)).name}</Text>
                </View>
              ) : null}
              <Text style={styles.line}>{formatDayLong(s.start)}</Text>
              <Text style={styles.line}>
                {formatTimeRange(s.start, s.durationMin)} · {s.level}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.faint} />
          </View>
          <View style={styles.pills}>
            {reg.status === 'waitlist' ? (
              <Pill label={`#${reg.position} on waitlist`} tone="warn" icon="time" />
            ) : (
              <Pill label="Registered" tone="success" icon="checkmark-circle" />
            )}
            {reg.calendar ? <Pill label={`In ${CALENDARS[reg.calendar].label}`} tone="primary" icon="calendar" /> : null}
            {reg.fromWaitlist ? <Pill label="From waitlist" tone="info" icon="arrow-up-circle" /> : null}
          </View>
        </Pressable>

        <View style={styles.actions}>
          {reg.status === 'registered' ? (
            <>
              <Button small title="Cancel" variant="danger" icon="close-circle-outline" onPress={() => setConfirm({ kind: 'cancel', session: s })} style={{ flex: 1 }} />
              <Button
                small
                title={reg.calendar ? 'Calendar ✓' : 'Add to calendar'}
                variant={reg.calendar ? 'soft' : 'secondary'}
                icon="calendar-outline"
                onPress={() => setCalSession(s)}
                style={{ flex: 1.5 }}
              />
            </>
          ) : (
            <>
              <Button small title="Leave waitlist" variant="danger" onPress={() => setConfirm({ kind: 'leave', session: s })} style={{ flex: 1 }} />
              <Button small title="Details" variant="secondary" onPress={() => navigation.navigate('Session', { id: s.id })} style={{ flex: 1 }} />
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.h1}>My Sessions</Text>
        <Text style={styles.sub}>Everything you've signed up for</Text>
        <View style={styles.segment} accessibilityRole="tablist">
          {[
            ['registered', `Registered (${registered.length})`],
            ['waitlist', `Waitlists (${waitlisted.length})`],
          ].map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[styles.segBtn, tab === key && styles.segOn]}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === key }}
            >
              <Text style={[styles.segText, tab === key && styles.segTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 40 }}
        ListEmptyComponent={
          tab === 'registered' ? (
            <EmptyState icon="calendar-clear-outline" title="No upcoming sessions" body="When you register for open play, a clinic, or a lesson, it shows up here." actionLabel="Find a session" onAction={() => navigation.navigate('Find')} />
          ) : (
            <EmptyState icon="time-outline" title="You're not on any waitlists" body="When a session is full, you can join its waitlist and we'll move you in if a spot opens." actionLabel="Find a session" onAction={() => navigation.navigate('Find')} />
          )
        }
      />

      <CalendarSheet session={calSession} visible={!!calSession} onClose={() => setCalSession(null)} />
      <ConfirmDialog
        visible={confirm?.kind === 'cancel'}
        title="Cancel this registration?"
        message={confirm ? `${confirm.session.title}\n${formatDayLong(confirm.session.start)} · ${formatTimeRange(confirm.session.start, confirm.session.durationMin)}\n\nYour spot will be released to other members.` : ''}
        confirmLabel="Yes, cancel registration"
        cancelLabel="Keep my spot"
        destructive
        onConfirm={doCancel}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm?.kind === 'leave'}
        title="Leave the waitlist?"
        message="You'll lose your place in line."
        confirmLabel="Leave waitlist"
        cancelLabel="Stay on waitlist"
        destructive
        onConfirm={doLeave}
        onCancel={() => setConfirm(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  h1: { fontSize: 30, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: colors.muted, marginTop: 2 },
  segment: { flexDirection: 'row', backgroundColor: '#E4E9E7', borderRadius: 12, padding: 4, marginTop: 14 },
  segBtn: { flex: 1, height: 42, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.card, ...shadow },
  segText: { fontSize: 15, fontWeight: '700', color: colors.muted },
  segTextOn: { color: colors.text },

  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, marginBottom: 12, ...shadow },
  cardNext: { borderWidth: 2, borderColor: colors.accent },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBox: { width: 56, height: 62, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dateDow: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  dateNum: { fontSize: 24, fontWeight: '800' },
  nextLabel: { fontSize: 12, fontWeight: '800', color: colors.warn, letterSpacing: 0.6, marginBottom: 2 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  line: { fontSize: 14, color: colors.muted, marginTop: 2 },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupName: { fontSize: 13, fontWeight: '700', color: colors.muted, flexShrink: 1 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
});
