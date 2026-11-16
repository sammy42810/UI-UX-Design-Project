// "Add to calendar" flow. Usability feedback (Bob D., Kerry) asked us to let people
// pick WHICH calendar app and then show a clear confirmation — so this is two steps.
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { CALENDARS, REMINDERS, formatDayLong, formatTimeRange } from '../data';
import { useStore } from '../store';
import { Button, Sheet, haptic } from './ui';

export default function CalendarSheet({ session, visible, onClose }) {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState('pick');
  const [calendar, setCalendar] = useState(null);
  const [reminder, setReminder] = useState('1 hour before');

  useEffect(() => {
    if (visible) {
      setStep('pick');
      setCalendar(state.user.defaultCalendar || null);
      setReminder('1 hour before');
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null;

  const add = () => {
    dispatch({ type: 'ADD_TO_CALENDAR', id: session.id, calendar, reminder });
    haptic();
    setStep('done');
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      {step === 'pick' ? (
        <View>
          <Text style={styles.h1}>Add to calendar</Text>
          <Text style={styles.sub}>
            {session.title} · {formatDayLong(session.start)}, {formatTimeRange(session.start, session.durationMin)}
          </Text>

          <Text style={styles.label}>Which calendar?</Text>
          {Object.entries(CALENDARS).map(([key, c]) => {
            const on = calendar === key;
            return (
              <Pressable
                key={key}
                onPress={() => setCalendar(key)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={[styles.option, on && styles.optionOn]}
              >
                <Ionicons name={c.icon} size={22} color={on ? colors.primary : colors.muted} />
                <Text style={[styles.optionText, on && { color: colors.primaryDark }]}>{c.label}</Text>
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? colors.primary : colors.faint} />
              </Pressable>
            );
          })}

          <Text style={styles.label}>Remind me</Text>
          <View style={styles.reminderRow}>
            {REMINDERS.map((r) => (
              <Pressable
                key={r}
                onPress={() => setReminder(r)}
                style={[styles.rChip, reminder === r && styles.rChipOn]}
                accessibilityRole="radio"
                accessibilityState={{ checked: reminder === r }}
              >
                <Text style={[styles.rChipText, reminder === r && { color: '#fff' }]}>{r}</Text>
              </Pressable>
            ))}
          </View>

          <Button title={calendar ? `Add to ${CALENDARS[calendar].label}` : 'Choose a calendar'} icon="calendar" disabled={!calendar} onPress={add} style={{ marginTop: 22 }} />
          <Button title="Not now" variant="ghost" onPress={onClose} style={{ marginTop: 6 }} />
        </View>
      ) : (
        <View style={{ alignItems: 'center', paddingTop: 8 }}>
          <View style={styles.doneIcon}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
          <Text style={[styles.h1, { textAlign: 'center' }]}>Added to {CALENDARS[calendar].label}</Text>
          <Text style={[styles.sub, { textAlign: 'center' }]}>
            {session.title}
            {'\n'}
            {formatDayLong(session.start)} · {formatTimeRange(session.start, session.durationMin)}
            {reminder !== 'None' ? `\nReminder: ${reminder}` : ''}
          </Text>
          <Button title="Done" onPress={onClose} style={{ alignSelf: 'stretch', marginTop: 20 }} />
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: colors.muted, marginTop: 6, lineHeight: 21 },
  label: { fontSize: 14, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 20, marginBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 8,
  },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionText: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.text },
  reminderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rChip: { paddingHorizontal: 12, height: 38, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  rChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  rChipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  doneIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
});
