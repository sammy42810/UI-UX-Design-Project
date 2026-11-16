import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, typeStyles } from '../theme';
import { CALENDARS, clubOf, formatDayLong, formatOpens, formatTimeRange, initials, spotsLeft } from '../data';
import { useStore } from '../store';
import { statusInfo } from '../components/SessionCard';
import CalendarSheet from '../components/CalendarSheet';
import { Button, CapacityBar, ConfirmDialog, EmptyState, Pill, Sheet, haptic, useToast } from '../components/ui';

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function SessionDetailScreen({ route, navigation }) {
  const { id, intent } = route.params;
  const { state, dispatch } = useStore();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const session = state.sessions.find((s) => s.id === id);
  const reg = state.registrations[id];
  const group = session ? state.groups.find((g) => g.id === session.groupId) : null;

  // sheet: null | 'register' | 'registered' | 'waitlist' | 'waitlisted'
  const [sheet, setSheet] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'cancel' | 'leave'
  const handledIntent = useRef(false);

  const info = session ? statusInfo(session, reg) : null;

  useEffect(() => {
    if (!session || handledIntent.current) return;
    handledIntent.current = true;
    if (intent === 'register' && info.status === 'open') setSheet('register');
    if (intent === 'waitlist' && info.status === 'full') setSheet('waitlist');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) {
    return <EmptyState icon="alert-circle" title="Session not found" body="It may have already happened." actionLabel="Back" onAction={() => navigation.goBack()} />;
  }

  const t = typeStyles[session.type];
  const when = `${formatDayLong(session.start)}\n${formatTimeRange(session.start, session.durationMin)}`;
  const left = spotsLeft(session);
  const isLesson = session.type === 'Lesson';

  const register = () => {
    dispatch({ type: 'REGISTER', id });
    haptic();
    setSheet('registered');
  };

  const joinWaitlist = () => {
    dispatch({ type: 'JOIN_WAITLIST', id });
    haptic();
    setSheet('waitlisted');
  };

  const doCancel = () => {
    const prev = reg;
    setConfirm(null);
    dispatch({ type: 'CANCEL', id });
    haptic('warning');
    toast.show('Registration cancelled', {
      icon: 'close-circle',
      actionLabel: 'Undo',
      onAction: () => dispatch({ type: 'RESTORE', id, reg: prev }),
    });
  };

  const doLeave = () => {
    setConfirm(null);
    dispatch({ type: 'LEAVE_WAITLIST', id });
    toast.show('You left the waitlist', { icon: 'exit' });
  };

  const toggleRemind = () => {
    const on = !state.reminders[id];
    dispatch({ type: 'TOGGLE_REMIND', id });
    haptic('light');
    toast.show(on ? `We'll notify you ${formatOpens(session.opensAt)}` : 'Reminder turned off', { icon: on ? 'notifications' : 'notifications-off' });
  };

  // Who's going (social feature members asked for in discovery interviews)
  const others = session.players.slice(0, Math.max(0, session.taken - (reg?.status === 'registered' ? 1 : 0)));
  const shown = [...(reg?.status === 'registered' ? [state.user.name.split(' ')[0] + ' (you)'] : []), ...others].slice(0, 7);
  const more = session.taken - shown.length;

  // ---------- bottom action bar ----------
  let actionBar;
  switch (info.status) {
    case 'open':
      actionBar = (
        <>
          <Text style={styles.barHint}>{isLesson ? `$${session.price} · billed to your member account` : session.price ? `$${session.price} · billed to your member account` : 'Included with your membership'}</Text>
          <Button title={isLesson ? 'Book this lesson' : 'Register'} icon="add-circle" onPress={() => setSheet('register')} />
        </>
      );
      break;
    case 'full':
      actionBar = (
        <>
          <Text style={styles.barHint}>This session is full. Join the waitlist and we'll move you in automatically if a spot opens.</Text>
          <Button title={`Join waitlist (you'd be #${session.waitlist + 1})`} variant="warn" icon="time" onPress={() => setSheet('waitlist')} />
        </>
      );
      break;
    case 'registered':
      actionBar = (
        <>
          <View style={styles.statusLine}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.statusText, { color: colors.success }]}>You're registered</Text>
            {reg.calendar ? <Pill label={`In ${CALENDARS[reg.calendar].label}`} tone="success" icon="calendar" style={{ marginLeft: 'auto' }} /> : null}
          </View>
          <View style={styles.row2}>
            <Button title="Cancel" variant="danger" icon="close-circle-outline" onPress={() => setConfirm('cancel')} style={{ flex: 1 }} />
            <Button
              title={reg.calendar ? 'Calendar ✓' : 'Add to calendar'}
              variant={reg.calendar ? 'soft' : 'primary'}
              icon="calendar-outline"
              onPress={() => setCalendarOpen(true)}
              style={{ flex: 1.4 }}
            />
          </View>
        </>
      );
      break;
    case 'waitlist':
      actionBar = (
        <>
          <View style={styles.statusLine}>
            <Ionicons name="time" size={20} color={colors.warn} />
            <Text style={[styles.statusText, { color: colors.warn }]}>You're #{reg.position} on the waitlist</Text>
          </View>
          <Button title="Leave waitlist" variant="danger" onPress={() => setConfirm('leave')} />
        </>
      );
      break;
    case 'notOpen':
      actionBar = (
        <>
          <Text style={styles.barHint}>Sign-up opens {formatOpens(session.opensAt)}.</Text>
          <Button
            title={state.reminders[id] ? "Reminder on — we'll notify you" : 'Remind me when sign-up opens'}
            icon={state.reminders[id] ? 'notifications' : 'notifications-outline'}
            variant={state.reminders[id] ? 'soft' : 'primary'}
            onPress={toggleRemind}
          />
        </>
      );
      break;
    default:
      actionBar = null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[styles.hero, { backgroundColor: t.soft }]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: t.color }]}>
              <Ionicons name={t.icon} size={22} color="#fff" />
            </View>
            <Text style={[styles.heroType, { color: t.color }]}>{session.type.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>{session.title}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Pill label={session.level} tone="neutral" icon="podium" style={{ backgroundColor: '#fff' }} />
            <Pill label={info.label} tone={info.tone} icon={info.icon} />
          </View>
        </View>

        <View style={styles.card}>
          <InfoRow icon="calendar" label="When" value={when} />
          <InfoRow icon="location" label="Where" value={`${clubOf(group)?.name || 'Club'} · ${session.court}`} />
          {group ? <InfoRow icon="people" label="Group" value={group.name} /> : null}
          {session.coach ? <InfoRow icon="person-circle" label="Coach" value={session.coach} /> : null}
          <InfoRow icon="card" label="Cost" value={session.price ? `$${session.price}` : 'Included with membership'} />
        </View>

        {session.capacity > 1 ? (
          <View style={styles.card}>
            <View style={styles.spotsTop}>
              <Text style={styles.cardTitle}>Spots</Text>
              <Text style={styles.spotsNum}>
                {session.opensAt ? `${session.capacity} spots` : `${session.taken} / ${session.capacity} filled`}
              </Text>
            </View>
            <CapacityBar taken={session.taken} capacity={session.capacity} height={10} />
            <Text style={styles.spotsSub}>
              {session.opensAt
                ? `Sign-up opens ${formatOpens(session.opensAt)}.`
                : left > 0
                ? `${left} spot${left === 1 ? '' : 's'} left`
                : `Full · ${session.waitlist} ${session.waitlist === 1 ? 'person' : 'people'} on the waitlist`}
            </Text>
          </View>
        ) : null}

        {session.capacity > 1 && session.taken > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Who's playing</Text>
            <View style={styles.avatars}>
              {shown.map((n) => (
                <View key={n} style={styles.avatarWrap}>
                  <View style={[styles.avatar, n.includes('(you)') && { backgroundColor: colors.accent }]}>
                    <Text style={styles.avatarText}>{initials(n.replace(' (you)', ''))}</Text>
                  </View>
                  <Text style={styles.avatarName} numberOfLines={1}>
                    {n.includes('(you)') ? 'You' : n}
                  </Text>
                </View>
              ))}
              {more > 0 ? (
                <View style={styles.avatarWrap}>
                  <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                    <Text style={[styles.avatarText, { color: colors.muted }]}>+{more}</Text>
                  </View>
                  <Text style={styles.avatarName}>more</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.about}>{session.description}</Text>
          <Text style={[styles.about, { marginTop: 10, color: colors.muted }]}>Free cancellation up to 24 hours before start.</Text>
        </View>
      </ScrollView>

      {actionBar ? <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>{actionBar}</View> : null}

      {/* Register: confirm → success (offers Add to calendar, task 3) */}
      <Sheet visible={sheet === 'register'} onClose={() => setSheet(null)}>
        <Text style={styles.sheetTitle}>{isLesson ? 'Book this lesson?' : 'Confirm registration'}</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{session.title}</Text>
          <Text style={styles.summaryLine}>{formatDayLong(session.start)}</Text>
          <Text style={styles.summaryLine}>{formatTimeRange(session.start, session.durationMin)} · {session.court}</Text>
          <Text style={styles.summaryLine}>{session.level}{session.coach ? ` · ${session.coach}` : ''}</Text>
          <Text style={[styles.summaryLine, { fontWeight: '700', color: colors.text, marginTop: 6 }]}>{session.price ? `$${session.price} to member account` : 'Included with membership'}</Text>
        </View>
        <Text style={styles.sheetNote}>You can cancel for free up to 24 hours before.</Text>
        <Button title={isLesson ? 'Confirm booking' : 'Confirm registration'} icon="checkmark-circle" onPress={register} style={{ marginTop: 16 }} />
        <Button title="Go back" variant="ghost" onPress={() => setSheet(null)} style={{ marginTop: 6 }} />
      </Sheet>

      <Sheet visible={sheet === 'registered'} onClose={() => setSheet(null)}>
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.bigIcon, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={42} color="#fff" />
          </View>
          <Text style={[styles.sheetTitle, { textAlign: 'center' }]}>You're in!</Text>
          <Text style={styles.sheetBody}>
            {session.title}
            {'\n'}
            {formatDayLong(session.start)} · {formatTimeRange(session.start, session.durationMin)}
          </Text>
          <Text style={styles.sheetNote}>Find it anytime under the My Sessions tab.</Text>
        </View>
        <Button
          title="Add to calendar"
          icon="calendar"
          onPress={() => {
            setSheet(null);
            setTimeout(() => setCalendarOpen(true), 350);
          }}
          style={{ marginTop: 18 }}
        />
        <Button title="Done" variant="ghost" onPress={() => setSheet(null)} style={{ marginTop: 6 }} />
      </Sheet>

      {/* Waitlist: confirm → success */}
      <Sheet visible={sheet === 'waitlist'} onClose={() => setSheet(null)}>
        <Text style={styles.sheetTitle}>Join the waitlist?</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{session.title}</Text>
          <Text style={styles.summaryLine}>{formatDayLong(session.start)} · {formatTimeRange(session.start, session.durationMin)}</Text>
          <Text style={[styles.summaryLine, { color: colors.danger, fontWeight: '700', marginTop: 6 }]}>
            Full · {session.waitlist} ahead of you
          </Text>
        </View>
        <View style={styles.howItWorks}>
          <Ionicons name="notifications" size={20} color={colors.primary} />
          <Text style={styles.howText}>If someone cancels, we'll move you in automatically and send you a notification. No need to keep checking.</Text>
        </View>
        <Button title={`Join waitlist as #${session.waitlist + 1}`} variant="warn" icon="time" onPress={joinWaitlist} style={{ marginTop: 16 }} />
        <Button title="Go back" variant="ghost" onPress={() => setSheet(null)} style={{ marginTop: 6 }} />
      </Sheet>

      <Sheet visible={sheet === 'waitlisted'} onClose={() => setSheet(null)}>
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.bigIcon, { backgroundColor: colors.warn }]}>
            <Ionicons name="time" size={40} color="#fff" />
          </View>
          <Text style={[styles.sheetTitle, { textAlign: 'center' }]}>You're #{reg?.position} on the waitlist</Text>
          <Text style={styles.sheetBody}>
            {session.title}
            {'\n'}
            {formatDayLong(session.start)} · {formatTimeRange(session.start, session.durationMin)}
          </Text>
          <Text style={styles.sheetNote}>We'll notify you the moment a spot opens.</Text>
        </View>
        <Button
          title="View my waitlists"
          variant="secondary"
          onPress={() => {
            setSheet(null);
            navigation.navigate('Tabs', { screen: 'MySessions', params: { tab: 'waitlist' } });
          }}
          style={{ marginTop: 18 }}
        />
        <Button title="Done" onPress={() => setSheet(null)} style={{ marginTop: 10 }} />
      </Sheet>

      <CalendarSheet session={session} visible={calendarOpen} onClose={() => setCalendarOpen(false)} />

      <ConfirmDialog
        visible={confirm === 'cancel'}
        title="Cancel this registration?"
        message={`${session.title}\n${formatDayLong(session.start)} · ${formatTimeRange(session.start, session.durationMin)}\n\nYour spot will be released to other members.`}
        confirmLabel="Yes, cancel registration"
        cancelLabel="Keep my spot"
        destructive
        onConfirm={doCancel}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'leave'}
        title="Leave the waitlist?"
        message="You'll lose your place in line."
        confirmLabel="Leave waitlist"
        cancelLabel="Stay on waitlist"
        destructive
        onConfirm={doLeave}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: 18 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  heroType: { fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 12 },

  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, marginTop: 12, ...shadow },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, color: colors.text, fontWeight: '600', marginTop: 2, lineHeight: 22 },

  spotsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  spotsNum: { fontSize: 15, fontWeight: '700', color: colors.muted },
  spotsSub: { fontSize: 15, color: colors.text, marginTop: 8, fontWeight: '600' },

  avatars: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 6 },
  avatarWrap: { width: 58, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '800', color: colors.primaryDark },
  avatarName: { fontSize: 12, color: colors.muted, marginTop: 4 },

  about: { fontSize: 16, color: colors.text, lineHeight: 23, marginTop: 6 },

  actionBar: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 },
  barHint: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 16, fontWeight: '800' },
  row2: { flexDirection: 'row', gap: 10 },

  sheetTitle: { fontSize: 23, fontWeight: '800', color: colors.text },
  sheetBody: { fontSize: 16, color: colors.text, textAlign: 'center', marginTop: 8, lineHeight: 23, fontWeight: '600' },
  sheetNote: { fontSize: 15, color: colors.muted, marginTop: 10, textAlign: 'center' },
  summary: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 14, marginTop: 14 },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  summaryLine: { fontSize: 15, color: colors.muted, marginTop: 3 },
  howItWorks: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 14, marginTop: 12 },
  howText: { flex: 1, fontSize: 15, color: colors.primaryDark, lineHeight: 21 },
  bigIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
});
