import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';
import { CALENDARS, LEVELS, clubOf, initials } from '../data';
import { useStore } from '../store';
import { Button, Chip, ConfirmDialog, SectionTitle, haptic, useToast } from '../components/ui';
import JoinGroupSheet, { GroupIcon } from '../components/JoinGroupSheet';

function ToggleRow({ icon, label, sub, value, onChange }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: '#CBD3D0' }} thumbColor="#fff" accessibilityLabel={label} />
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { user } = state;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [confirmReset, setConfirmReset] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [leaving, setLeaving] = useState(null);
  const myGroups = state.groups.filter((g) => g.joined);

  const now = new Date();
  const upcoming = Object.entries(state.registrations).filter(([id, r]) => {
    const s = state.sessions.find((x) => x.id === id);
    return s && new Date(s.start) > now && r.status === 'registered';
  }).length;
  const waits = Object.values(state.registrations).filter((r) => r.status === 'waitlist').length;

  const saveName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'UPDATE_USER', patch: { name: trimmed } });
    setEditing(false);
    toast.show('Profile saved');
  };

  const simulateSpot = () => {
    if (!waits) return toast.show('Join a waitlist first, then try this', { icon: 'information-circle' });
    dispatch({ type: 'SIMULATE_SPOT' });
    haptic();
    toast.show('A spot opened! Check Alerts', { icon: 'sparkles' });
  };

  const simulateOpen = () => {
    const pending = Object.keys(state.reminders).filter((k) => state.reminders[k] && state.sessions.find((s) => s.id === k)?.opensAt);
    if (!pending.length) return toast.show('Tap "Remind me" on a session first', { icon: 'information-circle' });
    dispatch({ type: 'SIMULATE_OPEN' });
    haptic();
    toast.show('Sign-up opened! Check Alerts', { icon: 'megaphone' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Profile</Text>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(user.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {editing ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={saveName}
                  accessibilityLabel="Your name"
                  placeholder="Your name"
                />
              ) : (
                <Text style={styles.name}>{user.name}</Text>
              )}
              <Text style={styles.member}>
                {myGroups.length} group{myGroups.length === 1 ? '' : 's'} at {new Set(myGroups.map((g) => g.clubId)).size} club{new Set(myGroups.map((g) => g.clubId)).size === 1 ? '' : 's'} · Playing since {user.memberSince}
              </Text>
            </View>
          </View>
          {editing ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button small title="Cancel" variant="ghost" onPress={() => { setName(user.name); setEditing(false); }} style={{ flex: 1 }} />
              <Button small title="Save" onPress={saveName} disabled={!name.trim()} style={{ flex: 1 }} />
            </View>
          ) : (
            <Button small title="Edit name" variant="secondary" icon="create-outline" onPress={() => setEditing(true)} style={{ marginTop: 14, alignSelf: 'flex-start' }} />
          )}

          <View style={styles.stats}>
            <Pressable style={styles.stat} onPress={() => navigation.navigate('MySessions', { tab: 'registered' })}>
              <Text style={styles.statNum}>{upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.stat} onPress={() => navigation.navigate('MySessions', { tab: 'waitlist' })}>
              <Text style={styles.statNum}>{waits}</Text>
              <Text style={styles.statLabel}>Waitlists</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{user.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>

        <SectionTitle>My skill level</SectionTitle>
        <View style={styles.wrapRow}>
          {LEVELS.map((l) => (
            <View key={l} style={{ marginBottom: 8 }}>
              <Chip label={l} selected={user.level === l} onPress={() => { dispatch({ type: 'UPDATE_USER', patch: { level: l } }); toast.show(`Level set to ${l}`); }} />
            </View>
          ))}
        </View>
        <Text style={styles.help}>Used to highlight sessions at your level and pick which sign-up to remind you about.</Text>

        <SectionTitle>My groups ({myGroups.length})</SectionTitle>
        <View style={styles.card}>
          {myGroups.length === 0 ? <Text style={styles.help}>You're not in any groups yet. Join one to see its sessions on Find.</Text> : null}
          {myGroups.map((g, i) => (
            <View key={g.id}>
              {i > 0 ? <View style={styles.sep} /> : null}
              <View style={styles.row}>
                <GroupIcon group={g} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{g.name}</Text>
                  <Text style={styles.rowSub}>{clubOf(g).name} · {g.memberCount} members · code {g.code}</Text>
                </View>
                <Button small title="Leave" variant="danger" onPress={() => setLeaving(g)} accessibilityLabel={`Leave ${g.name}`} />
              </View>
            </View>
          ))}
          <Button title="Join a group" icon="add-circle-outline" variant="secondary" onPress={() => setJoinOpen(true)} style={{ marginTop: 12 }} />
        </View>

        <SectionTitle>Notifications</SectionTitle>
        <View style={styles.card}>
          <ToggleRow icon="megaphone-outline" label="New sessions posted" sub="When sign-up opens for sessions you follow" value={user.notify.newSessions} onChange={(v) => dispatch({ type: 'UPDATE_NOTIFY', patch: { newSessions: v } })} />
          <View style={styles.sep} />
          <ToggleRow icon="time-outline" label="Waitlist updates" sub="When a spot opens and you're moved in" value={user.notify.waitlist} onChange={(v) => dispatch({ type: 'UPDATE_NOTIFY', patch: { waitlist: v } })} />
          <View style={styles.sep} />
          <ToggleRow icon="alarm-outline" label="Session reminders" sub="The day before each session" value={user.notify.reminders} onChange={(v) => dispatch({ type: 'UPDATE_NOTIFY', patch: { reminders: v } })} />
        </View>

        <SectionTitle>Default calendar</SectionTitle>
        <View style={styles.wrapRow}>
          {Object.entries(CALENDARS).map(([k, c]) => (
            <View key={k} style={{ marginBottom: 8 }}>
              <Chip label={c.label} selected={user.defaultCalendar === k} onPress={() => dispatch({ type: 'UPDATE_USER', patch: { defaultCalendar: k } })} />
            </View>
          ))}
        </View>

        <SectionTitle>Prototype controls</SectionTitle>
        <View style={[styles.card, { borderWidth: 1.5, borderColor: colors.accent, borderStyle: 'dashed' }]}>
          <Text style={styles.help}>For demos: trigger events that would normally come from the club. Group codes to try under Join a group: CRCBEG, MPLMIX.</Text>
          <Button title="Simulate: waitlist spot opens" variant="secondary" icon="sparkles-outline" onPress={simulateSpot} style={{ marginTop: 12 }} />
          <Button title="Simulate: sign-up opens" variant="secondary" icon="megaphone-outline" onPress={simulateOpen} style={{ marginTop: 10 }} />
          <Button title="Reset prototype data" variant="danger" icon="refresh" onPress={() => setConfirmReset(true)} style={{ marginTop: 10 }} />
        </View>
      </ScrollView>

      <JoinGroupSheet visible={joinOpen} onClose={() => setJoinOpen(false)} />
      <ConfirmDialog
        visible={!!leaving}
        title={leaving ? `Leave ${leaving.name}?` : ''}
        message={leaving ? `Its sessions will no longer show on Find. Anything you're already registered for stays in My Sessions. You can rejoin anytime with code ${leaving.code}.` : ''}
        confirmLabel="Leave group"
        cancelLabel="Stay in group"
        destructive
        onConfirm={() => {
          dispatch({ type: 'LEAVE_GROUP', groupId: leaving.id });
          toast.show(`You left ${leaving.name}`, { icon: 'exit' });
          setLeaving(null);
        }}
        onCancel={() => setLeaving(null)}
      />

      <ConfirmDialog
        visible={confirmReset}
        title="Reset the prototype?"
        message="This restores the original sessions, registrations and alerts. Use it between testers."
        confirmLabel="Reset everything"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          dispatch({ type: 'RESET' });
          setName('Sam Bryan');
          setConfirmReset(false);
          toast.show('Prototype reset', { icon: 'refresh' });
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  h1: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 8, marginBottom: 12 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, ...shadow },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800', color: colors.primaryDark },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  member: { fontSize: 14, color: colors.muted, marginTop: 2 },
  input: { fontSize: 20, fontWeight: '700', color: colors.text, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  stats: { flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 13, color: colors.muted, marginTop: 2, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: colors.border },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap' },
  help: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  rowLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: 13, color: colors.muted, marginTop: 1 },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
});
