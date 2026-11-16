// Task 1 & 3 start here. Revision 2 from our usability test: show many sessions
// across levels/dates/types with filters, and show Full sessions + waitlist inline
// (Revision 3) instead of hiding the waitlist flow.
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';
import { ALL_LEVELS, LEVELS, TYPES, dayChip, dayKey, formatDay, formatOpens } from '../data';
import { useStore } from '../store';
import SessionCard from '../components/SessionCard';
import PickleballLogo from '../components/PickleballLogo';
import { Button, Chip, EmptyState, haptic, useToast } from '../components/ui';
import JoinGroupSheet from '../components/JoinGroupSheet';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function FindScreen({ navigation }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [type, setType] = useState('All');
  const [level, setLevel] = useState('All');
  const [day, setDay] = useState('All');
  const [groupF, setGroupF] = useState('All');
  const [joinOpen, setJoinOpen] = useState(false);
  const now = new Date();

  // Sessions from every group you're in, merged into one list.
  const myGroups = state.groups.filter((g) => g.joined);
  const myGroupIds = myGroups.map((g) => g.id).join(',');
  const upcoming = useMemo(
    () => state.sessions.filter((s) => myGroupIds.split(',').includes(s.groupId) && new Date(s.start) > now),
    [state.sessions, myGroupIds] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const activeGroup = myGroups.some((g) => g.id === groupF) ? groupF : 'All';
  const groupOf = (s) => state.groups.find((g) => g.id === s.groupId);

  const days = useMemo(() => {
    const keys = [];
    upcoming.forEach((s) => {
      const k = dayKey(s.start);
      if (!keys.includes(k)) keys.push(k);
    });
    return keys.slice(0, 10).map((k) => ({ key: k, date: upcoming.find((s) => dayKey(s.start) === k).start }));
  }, [upcoming]);

  const filtered = upcoming.filter(
    (s) =>
      (activeGroup === 'All' || s.groupId === activeGroup) &&
      (type === 'All' || s.type === type) &&
      (level === 'All' || s.level === level || s.level === ALL_LEVELS) &&
      (day === 'All' || dayKey(s.start) === day)
  );

  const sections = [];
  filtered.forEach((s) => {
    const k = dayKey(s.start);
    let sec = sections.find((x) => x.key === k);
    if (!sec) {
      sec = { key: k, title: formatDay(s.start), data: [] };
      sections.push(sec);
    }
    sec.data.push(s);
  });

  // "Next sign-up opens" banner — the #1 frustration from our discovery study was
  // not knowing when open play gets posted.
  const nextLocked =
    upcoming.find((s) => s.opensAt && s.type === 'Open Play' && s.level === state.user.level) ||
    upcoming.find((s) => s.opensAt && s.type === 'Open Play' && s.level === ALL_LEVELS) ||
    upcoming.find((s) => s.opensAt);

  const toggleRemind = (s) => {
    const on = !state.reminders[s.id];
    dispatch({ type: 'TOGGLE_REMIND', id: s.id });
    haptic('light');
    toast.show(on ? `We'll notify you when sign-up opens ${formatOpens(s.opensAt)}` : 'Reminder turned off', { icon: on ? 'notifications' : 'notifications-off' });
  };

  const onAction = (s, status) => {
    if (status === 'notOpen') return toggleRemind(s);
    navigation.navigate('Session', { id: s.id, intent: status === 'full' ? 'waitlist' : 'register' });
  };

  const filtersActive = activeGroup !== 'All' || type !== 'All' || level !== 'All' || day !== 'All';
  const clearFilters = () => {
    setGroupF('All');
    setType('All');
    setLevel('All');
    setDay('All');
  };

  const header = (
    <View>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greet}>
            {greeting()}, {state.user.name.split(' ')[0]}
          </Text>
          <Text style={styles.h1}>Find a Session</Text>
        </View>
        <PickleballLogo size={46} />
      </View>

      {nextLocked ? (
        <View style={styles.banner}>
          <Text style={styles.bannerKicker}>NEXT SIGN-UP OPENS</Text>
          <Text style={styles.bannerTime}>{formatOpens(nextLocked.opensAt)}</Text>
          <Text style={styles.bannerSub}>
            for {nextLocked.title} · {formatDay(nextLocked.start)} ({nextLocked.level})
          </Text>
          <Button
            title={state.reminders[nextLocked.id] ? "Reminder on — we'll notify you" : 'Remind me'}
            icon={state.reminders[nextLocked.id] ? 'notifications' : 'notifications-outline'}
            variant={state.reminders[nextLocked.id] ? 'soft' : 'secondary'}
            onPress={() => toggleRemind(nextLocked)}
            style={{ marginTop: 12, backgroundColor: state.reminders[nextLocked.id] ? colors.accent : colors.card, borderColor: 'transparent' }}
          />
        </View>
      ) : null}

      <View style={styles.groupHead}>
        <Text style={[styles.filterLabel, { marginTop: 0, marginBottom: 0 }]}>My groups ({myGroups.length})</Text>
        <Pressable onPress={() => setJoinOpen(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Join a group" style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Ionicons name="add-circle" size={18} color={colors.primary} />
          <Text style={styles.clear}>Join a group</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        <Chip label="All my groups" selected={activeGroup === 'All'} onPress={() => setGroupF('All')} />
        {myGroups.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => setGroupF(g.id)}
            style={[styles.groupChip, activeGroup === g.id && { backgroundColor: g.color, borderColor: g.color }]}
            accessibilityRole="button"
            accessibilityLabel={g.name}
            accessibilityState={{ selected: activeGroup === g.id }}
          >
            <View style={[styles.groupChipDot, { backgroundColor: activeGroup === g.id ? '#fff' : g.color }]} />
            <Text style={[styles.groupChipText, activeGroup === g.id && { color: '#fff' }]}>{g.short}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setJoinOpen(true)} style={styles.joinChip} accessibilityRole="button" accessibilityLabel="Join a group">
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.joinChipText}>Join group</Text>
        </Pressable>
      </ScrollView>

      <Text style={styles.filterLabel}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {['All', ...TYPES].map((t) => (
          <Chip key={t} label={t === 'All' ? 'All types' : t === 'Clinic' ? 'Clinics' : t === 'Lesson' ? 'Lessons' : t} selected={type === t} onPress={() => setType(t)} />
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>Level</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {['All', ...LEVELS].map((l) => (
          <Chip key={l} label={l === 'All' ? 'All levels' : l === state.user.level ? `${l} (you)` : l} selected={level === l} onPress={() => setLevel(l)} />
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>Day</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        <Pressable onPress={() => setDay('All')} style={[styles.dayChip, day === 'All' && styles.dayChipOn]} accessibilityRole="button" accessibilityState={{ selected: day === 'All' }}>
          <Text style={[styles.dayDow, day === 'All' && styles.dayOnText]}>All</Text>
          <Text style={[styles.dayAll, day === 'All' && styles.dayOnText]}>days</Text>
        </Pressable>
        {days.map((d) => {
          const c = dayChip(d.date);
          const on = day === d.key;
          return (
            <Pressable key={d.key} onPress={() => setDay(d.key)} style={[styles.dayChip, on && styles.dayChipOn]} accessibilityRole="button" accessibilityLabel={formatDay(d.date)} accessibilityState={{ selected: on }}>
              <Text style={[styles.dayDow, on && styles.dayOnText]}>{c.dow}</Text>
              <Text style={[styles.dayNum, on && styles.dayOnText]}>{c.num}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.countRow}>
        <Text style={styles.count}>
          {filtered.length} session{filtered.length === 1 ? '' : 's'}
        </Text>
        {filtersActive ? (
          <Pressable
            onPress={clearFilters}
            hitSlop={10}
          >
            <Text style={styles.clear}>Clear filters</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(s) => s.id}
        ListHeaderComponent={header}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => <Text style={styles.dayHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            reg={state.registrations[item.id]}
            reminded={!!state.reminders[item.id]}
            group={groupOf(item)}
            onPress={() => navigation.navigate('Session', { id: item.id })}
            onAction={(status) => onAction(item, status)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="No sessions match"
            body="Try a different day or level — new sessions are posted every week."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        }
      />
      <JoinGroupSheet visible={joinOpen} onClose={() => setJoinOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 14 },
  greet: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  h1: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 2 },

  banner: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: 18, ...shadow },
  bannerKicker: { color: colors.accent, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  bannerTime: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  bannerSub: { color: '#D5E7E4', fontSize: 15, marginTop: 2 },

  filterLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.7, marginTop: 16, marginBottom: 8 },
  chipRow: { paddingRight: 16 },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  groupChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 38, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  groupChipDot: { width: 10, height: 10, borderRadius: 5 },
  groupChipText: { fontSize: 15, fontWeight: '600', color: colors.text },
  joinChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, height: 38, borderRadius: 999, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', marginRight: 8 },
  joinChipText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  dayChip: { width: 54, height: 60, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  dayChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayDow: { fontSize: 13, fontWeight: '700', color: colors.muted },
  dayNum: { fontSize: 18, fontWeight: '800', color: colors.text },
  dayOnText: { color: '#fff' },
  dayAll: { fontSize: 14, fontWeight: '800', color: colors.text },

  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  count: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  clear: { fontSize: 15, color: colors.primary, fontWeight: '800' },
  dayHeader: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 14, marginBottom: 10 },
});
