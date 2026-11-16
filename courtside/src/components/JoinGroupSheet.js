// Join another group at the club, by code or from a list. Joined groups' sessions
// appear on Find right away, merged with your other groups (no switching groups).
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { useStore } from '../store';
import { clubOf } from '../data';
import { Button, Sheet, haptic } from './ui';

export function GroupIcon({ group, size = 44 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: group.color, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={group.icon} size={size * 0.5} color="#fff" />
    </View>
  );
}

export default function JoinGroupSheet({ visible, onClose }) {
  const { state, dispatch } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // group being previewed
  const [joined, setJoined] = useState(null); // group just joined

  useEffect(() => {
    if (visible) {
      setCode('');
      setError('');
      setSelected(null);
      setJoined(null);
    }
  }, [visible]);

  const others = state.groups.filter((g) => !g.joined);

  const lookUp = () => {
    const c = code.trim().toUpperCase();
    if (!c) return setError('Enter the code your group organizer gave you.');
    const g = state.groups.find((x) => x.code === c);
    if (!g) return setError(`No group found with code "${c}". Double-check it with your organizer.`);
    if (g.joined) return setError(`You're already in ${g.name}.`);
    setError('');
    setSelected(g);
  };

  const join = () => {
    dispatch({ type: 'JOIN_GROUP', groupId: selected.id });
    haptic();
    setJoined(selected);
    setSelected(null);
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      {joined ? (
        <View style={{ alignItems: 'center' }}>
          <View style={styles.doneIcon}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
          <Text style={[styles.h1, { textAlign: 'center' }]}>You joined {joined.name}</Text>
          <Text style={[styles.sub, { textAlign: 'center' }]}>Its sessions now show up on Find with the rest of your groups.</Text>
          <Button title="Done" onPress={onClose} style={{ alignSelf: 'stretch', marginTop: 20 }} />
        </View>
      ) : selected ? (
        <View>
          <View style={{ alignItems: 'center' }}>
            <GroupIcon group={selected} size={64} />
            <Text style={[styles.h1, { textAlign: 'center', marginTop: 10 }]}>{selected.name}</Text>
            <Text style={[styles.optionClub, { textAlign: 'center', marginTop: 4 }]}>{clubOf(selected).name}</Text>
            <Text style={styles.meta}>
              {selected.memberCount} members · Organized by {selected.organizer}
            </Text>
          </View>
          <Text style={styles.desc}>{selected.description}</Text>
          <Button title="Join group" icon="person-add" onPress={join} style={{ marginTop: 18 }} />
          <Button title="Back" variant="ghost" onPress={() => setSelected(null)} style={{ marginTop: 6 }} />
        </View>
      ) : (
        <View>
          <Text style={styles.h1}>Join a group</Text>
          <Text style={styles.sub}>Enter the code from your group's organizer.</Text>
          <View style={styles.row}>
            <TextInput
              value={code}
              onChangeText={(t) => {
                setCode(t.toUpperCase());
                if (error) setError('');
              }}
              placeholder="Group code"
              placeholderTextColor={colors.faint}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              returnKeyType="go"
              onSubmitEditing={lookUp}
              style={[styles.input, error ? { borderColor: colors.danger } : null]}
              accessibilityLabel="Group code"
            />
            <Button title="Find" onPress={lookUp} style={{ paddingHorizontal: 20 }} />
          </View>
          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          {others.length ? (
            <>
              <Text style={styles.label}>Or browse groups near you</Text>
              {others.map((g) => (
                <Pressable key={g.id} onPress={() => setSelected(g)} style={styles.option} accessibilityRole="button" accessibilityLabel={`${g.name}, ${g.memberCount} members`}>
                  <GroupIcon group={g} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionName}>{g.name}</Text>
                    <Text style={styles.optionClub}>{clubOf(g).name}</Text>
                    <Text style={styles.optionMeta}>{g.memberCount} members · {g.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.faint} />
                </Pressable>
              ))}
            </>
          ) : null}
          <Button title="Cancel" variant="ghost" onPress={onClose} style={{ marginTop: 8 }} />
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: colors.muted, marginTop: 4, lineHeight: 21 },
  meta: { fontSize: 14, color: colors.muted, marginTop: 2, textAlign: 'center' },
  desc: { fontSize: 16, color: colors.text, lineHeight: 23, marginTop: 14 },
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
  input: {
    flex: 1,
    minWidth: 0,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  errorRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', backgroundColor: colors.dangerSoft, borderRadius: 8, padding: 8, marginTop: 10 },
  error: { flex: 1, color: colors.danger, fontSize: 14, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 22, marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, marginBottom: 8 },
  optionName: { fontSize: 16, fontWeight: '700', color: colors.text },
  optionClub: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 1 },
  optionMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  doneIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
});
