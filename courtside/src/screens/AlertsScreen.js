// "Meaningful notifications" — the discovery study's top request was being told
// when sign-up opens or a spot frees up, instead of refreshing the app.
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';
import { timeAgo } from '../data';
import { useStore } from '../store';
import { EmptyState } from '../components/ui';

const KIND = {
  new: { icon: 'megaphone', color: colors.info, bg: colors.infoSoft },
  info: { icon: 'notifications', color: colors.primary, bg: colors.primarySoft },
  confirm: { icon: 'checkmark-circle', color: colors.success, bg: colors.successSoft },
  spot: { icon: 'sparkles', color: colors.success, bg: colors.successSoft },
  waitlist: { icon: 'time', color: colors.warn, bg: colors.warnSoft },
  cancel: { icon: 'close-circle', color: colors.danger, bg: colors.dangerSoft },
  calendar: { icon: 'calendar', color: colors.primary, bg: colors.primarySoft },
  group: { icon: 'people', color: colors.primary, bg: colors.primarySoft },
};

export default function AlertsScreen({ navigation }) {
  const { state, dispatch } = useStore();
  const unread = state.alerts.filter((a) => !a.read).length;

  const open = (a) => {
    dispatch({ type: 'MARK_READ', alertId: a.id });
    if (a.sessionId && state.sessions.some((s) => s.id === a.sessionId)) navigation.navigate('Session', { id: a.sessionId });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Alerts</Text>
          <Text style={styles.sub}>{unread ? `${unread} unread` : "You're all caught up"}</Text>
        </View>
        {unread ? (
          <Pressable onPress={() => dispatch({ type: 'MARK_ALL_READ' })} hitSlop={10} accessibilityRole="button">
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={state.alerts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 40 }}
        renderItem={({ item: a }) => {
          const k = KIND[a.kind] || KIND.info;
          return (
            <Pressable onPress={() => open(a)} style={[styles.item, !a.read && styles.itemUnread]} accessibilityRole="button" accessibilityLabel={`${a.read ? '' : 'Unread. '}${a.title}. ${a.body}`}>
              <View style={[styles.icon, { backgroundColor: k.bg }]}>
                <Ionicons name={k.icon} size={22} color={k.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !a.read && { fontWeight: '800' }]} numberOfLines={2}>
                    {a.title}
                  </Text>
                  {!a.read ? <View style={styles.dot} /> : null}
                </View>
                <Text style={styles.body}>{a.body}</Text>
                <Text style={styles.time}>{timeAgo(a.time)}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="No alerts yet" body="We'll let you know when sign-up opens, when a waitlist spot frees up, and before your sessions." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  h1: { fontSize: 30, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: colors.muted, marginTop: 2 },
  markAll: { fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  item: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, marginBottom: 10, ...shadow },
  itemUnread: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  body: { fontSize: 15, color: colors.muted, marginTop: 3, lineHeight: 21 },
  time: { fontSize: 13, color: colors.faint, marginTop: 6, fontWeight: '600' },
});
