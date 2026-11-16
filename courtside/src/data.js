// Seed data for the prototype. There is no backend: the weekly schedule below is
// generated relative to "today" so the app always shows realistic upcoming dates.

export const LEVELS = ['Beginner', 'Adv. Beginner', 'Intermediate', 'Int/Adv'];
export const ALL_LEVELS = 'All Levels';
export const TYPES = ['Open Play', 'Clinic', 'Lesson'];

const COACH = {
  maya: 'Coach Maya Torres',
  luis: 'Coach Luis Ortega',
  priya: 'Coach Priya Nair',
};

const PLAYERS = [
  'Bob S.', 'Bob D.', 'Kerry T.', 'Ryann L.', 'Dana M.', 'Chris P.', 'Jordan K.',
  'Alex R.', 'Pat W.', 'Morgan F.', 'Taylor B.', 'Jamie C.', 'Casey N.', 'Riley H.',
  'Drew A.', 'Sky V.', 'Lee G.', 'Robin E.', 'Quinn Z.', 'Avery J.',
];

// Weekly schedule template, keyed by JS weekday (0 = Sunday).
// `taken` = spots already filled by other members; `waitlist` = others waiting.
const WEEK = {
  0: [
    { type: 'Open Play', title: 'Sunday Morning Open Play', level: 'Intermediate', h: 10, m: 0, dur: 120, cap: 16, taken: 16, waitlist: 5, court: 'Courts 1–4' },
    { type: 'Open Play', title: 'All-Levels Round Robin', level: ALL_LEVELS, h: 13, m: 0, dur: 120, cap: 16, taken: 9, court: 'Courts 1–4' },
  ],
  1: [
    { type: 'Open Play', title: 'Beginner Open Play', level: 'Beginner', h: 9, m: 0, dur: 90, cap: 12, taken: 5, court: 'Courts 1–3' },
    { type: 'Clinic', title: 'Dinking & Soft Game Clinic', level: 'Intermediate', h: 18, m: 0, dur: 60, cap: 8, taken: 6, court: 'Court 4', coach: 'maya', price: 25 },
    { type: 'Open Play', title: 'Monday Night Open Play', level: 'Int/Adv', h: 19, m: 0, dur: 120, cap: 16, taken: 13, court: 'Courts 1–4' },
  ],
  2: [
    { type: 'Clinic', title: 'Pickleball 101', level: 'Beginner', h: 10, m: 0, dur: 90, cap: 8, taken: 3, court: 'Court 2', coach: 'priya', price: 25 },
    { type: 'Lesson', title: 'Private Lesson', level: ALL_LEVELS, h: 16, m: 0, dur: 60, cap: 1, taken: 0, court: 'Court 1', coach: 'luis', price: 70 },
    { type: 'Open Play', title: 'Tuesday Night Open Play', level: 'Intermediate', h: 18, m: 30, dur: 120, cap: 16, taken: 11, court: 'Courts 1–4' },
  ],
  3: [
    { type: 'Open Play', title: 'Midweek Morning Open Play', level: 'Intermediate', h: 9, m: 0, dur: 120, cap: 16, taken: 12, court: 'Courts 1–4', seedRegistered: true },
    { type: 'Lesson', title: 'Private Lesson', level: ALL_LEVELS, h: 12, m: 0, dur: 60, cap: 1, taken: 0, court: 'Court 3', coach: 'maya', price: 70 },
    { type: 'Clinic', title: 'Advanced Beginner Drills', level: 'Adv. Beginner', h: 18, m: 0, dur: 60, cap: 8, taken: 8, waitlist: 2, court: 'Court 2', coach: 'priya', price: 25 },
  ],
  4: [
    { type: 'Open Play', title: 'Daytime Social Play', level: ALL_LEVELS, h: 10, m: 0, dur: 120, cap: 12, taken: 7, court: 'Courts 1–3' },
    { type: 'Clinic', title: 'Third Shot Drop Clinic', level: 'Int/Adv', h: 19, m: 0, dur: 75, cap: 8, taken: 5, court: 'Court 4', coach: 'luis', price: 30 },
  ],
  5: [
    { type: 'Open Play', title: 'Beginner Open Play', level: 'Beginner', h: 9, m: 0, dur: 90, cap: 12, taken: 4, court: 'Courts 1–3' },
    { type: 'Open Play', title: 'Friday Night Open Play', level: 'Intermediate', h: 18, m: 0, dur: 120, cap: 16, taken: 14, court: 'Courts 1–2' },
    { type: 'Open Play', title: 'Friday Night Open Play', level: 'Int/Adv', h: 18, m: 0, dur: 120, cap: 16, taken: 16, waitlist: 3, court: 'Courts 3–4' },
  ],
  6: [
    { type: 'Clinic', title: 'Saturday Strategy Clinic', level: 'Intermediate', h: 9, m: 0, dur: 90, cap: 8, taken: 5, court: 'Court 4', coach: 'maya', price: 30, seedRegistered: true },
    { type: 'Open Play', title: 'Saturday Open Play', level: ALL_LEVELS, h: 11, m: 0, dur: 120, cap: 16, taken: 10, court: 'Courts 1–4' },
    { type: 'Lesson', title: 'Private Lesson', level: ALL_LEVELS, h: 14, m: 0, dur: 60, cap: 1, taken: 0, court: 'Court 1', coach: 'priya', price: 70 },
  ],
};

const DESCRIPTIONS = {
  'Open Play':
    'Drop-in games with rotating partners. Paddles up when a court opens — winners split, losers stay. Balls provided. Please arrive 5 minutes early to check in at the front desk.',
  Clinic:
    'A small-group, coach-led session with drills and live-ball practice focused on one skill. Limited to 8 players so everyone gets feedback.',
  Lesson:
    'One-on-one time with a club pro. Tell your coach what you want to work on when you arrive — serves, footwork, strategy, anything.',
};

const OPEN_WINDOW_DAYS = 7; // sign-up opens 7 days before a session, at noon

// ---------- clubs & groups ----------
// Players often belong to groups at several different clubs. Courtside shows sessions
// from all of your groups, across all clubs, in one list — and you join more with a code.
const CLUBS = {
  courtside: { name: 'Courtside Racquet Club', short: 'Courtside' },
  riverbend: { name: 'Riverbend Pickleball Center', short: 'Riverbend' },
  maple: { name: 'Maple Township Rec Courts', short: 'Maple Rec' },
};

// Group colors are identity colors only. They deliberately avoid the status colors
// (green = registered, amber = waitlist, red = full) so a group never looks like a warning.
const GROUPS = [
  { id: 'events', clubId: 'courtside', name: 'Courtside Pickleball Events', short: 'Club Events', code: 'CRCPBE', color: '#0E5E57', icon: 'tennisball', memberCount: 214, organizer: 'Courtside Front Desk', joined: true, description: 'Official open play, clinics and private lessons at Courtside.' },
  { id: 'challenger', clubId: 'courtside', name: 'Courtside Challenger', short: 'Challenger', code: 'CRCCHL', color: '#4338CA', icon: 'trophy', memberCount: 38, organizer: 'Dana M.', joined: true, description: 'Competitive Int/Adv play on Tuesday and Thursday nights.' },
  { id: 'ladies', clubId: 'courtside', name: 'CourtsidePB 3.5 Ladies', short: '3.5 Ladies', code: 'CRC35L', color: '#7E22CE', icon: 'flower', memberCount: 26, organizer: 'Pat W.', joined: true, description: 'Friendly 3.5-level ladies play on Wednesday mornings.' },
  { id: 'dropin', clubId: 'riverbend', name: 'Riverbend Morning Drop-In', short: 'Morning Drop-In', code: 'RVBDRP', color: '#0369A1', icon: 'sunny', memberCount: 92, organizer: 'Riverbend Staff', joined: true, description: 'All-levels drop-in play Monday, Wednesday and Friday mornings on 6 outdoor courts.' },
  { id: 'beginners', clubId: 'courtside', name: 'Courtside Beginner Social', short: 'Beginner Social', code: 'CRCBEG', color: '#475569', icon: 'happy', memberCount: 57, organizer: 'Coach Priya Nair', joined: false, description: 'Low-key social play and simple drills every Saturday afternoon.' },
  { id: 'mixed', clubId: 'maple', name: 'Maple Mixed Doubles', short: 'Mixed Doubles', code: 'MPLMIX', color: '#4D7C0F', icon: 'swap-horizontal', memberCount: 44, organizer: 'Jordan K.', joined: false, description: 'Mixed doubles round robin on Sunday afternoons. Partners rotate every game.' },
];

export function clubOf(group) {
  return group ? CLUBS[group.clubId] : null;
}

// Weekly sessions owned by the smaller groups (the Courtside events group uses WEEK above).
const DROPIN = [{ type: 'Open Play', title: 'Morning Drop-In', level: ALL_LEVELS, h: 8, m: 0, dur: 120, cap: 24, taken: 15, court: 'Outdoor Courts 1–6' }];
const GROUP_WEEK = {
  challenger: {
    2: [{ type: 'Open Play', title: 'Challenger Night', level: 'Int/Adv', h: 19, m: 0, dur: 120, cap: 8, taken: 6, court: 'Courts 5–6' }],
    4: [{ type: 'Open Play', title: 'Challenger Night', level: 'Int/Adv', h: 19, m: 0, dur: 120, cap: 8, taken: 8, waitlist: 1, court: 'Courts 5–6' }],
  },
  ladies: {
    3: [{ type: 'Open Play', title: '3.5 Ladies Play', level: 'Intermediate', h: 10, m: 0, dur: 120, cap: 12, taken: 10, court: 'Courts 3–4' }],
  },
  dropin: { 1: DROPIN, 3: DROPIN, 5: [{ ...DROPIN[0], taken: 22 }] },
  beginners: {
    6: [{ type: 'Open Play', title: 'Beginner Social & Drills', level: 'Beginner', h: 13, m: 0, dur: 90, cap: 12, taken: 6, court: 'Courts 1–2', coach: 'priya' }],
  },
  mixed: {
    0: [{ type: 'Open Play', title: 'Mixed Doubles Round Robin', level: ALL_LEVELS, h: 15, m: 0, dur: 120, cap: 16, taken: 12, court: 'Courts A–D' }],
  },
};
const SCHEDULES = { events: WEEK, ...GROUP_WEEK };

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function buildSeed(now = new Date()) {
  const today = startOfDay(now);
  const sessions = [];
  const registrations = {};
  const seededTitles = new Set();

  for (let offset = 0; offset < 14; offset++) {
    const day = new Date(today);
    day.setDate(today.getDate() + offset);
    const templates = Object.entries(SCHEDULES).flatMap(([groupId, week]) => (week[day.getDay()] || []).map((t, idx) => ({ ...t, groupId, idx })));
    templates.forEach((t) => {
      const start = new Date(day);
      start.setHours(t.h, t.m, 0, 0);
      if (start <= now) return;

      const opens = new Date(start);
      opens.setDate(opens.getDate() - OPEN_WINDOW_DAYS);
      opens.setHours(12, 0, 0, 0);
      const isOpen = opens <= now;

      const id = `${t.groupId}-${dayKey(day)}-${t.idx}`;
      const seedNames = [...PLAYERS].sort((a, b) => hash(id + a) - hash(id + b));
      sessions.push({
        id,
        groupId: t.groupId,
        type: t.type,
        title: t.title,
        level: t.level,
        start: start.toISOString(),
        durationMin: t.dur,
        court: t.court,
        coach: t.coach ? COACH[t.coach] : null,
        price: t.price || 0,
        capacity: t.cap,
        taken: isOpen ? t.taken : 0,
        waitlist: isOpen ? t.waitlist || 0 : 0,
        opensAt: isOpen ? null : opens.toISOString(),
        players: seedNames,
        description: DESCRIPTIONS[t.type],
      });

      // Give the default member a couple of existing registrations so the
      // "My Sessions" tab (task 2: cancel a session) has something in it.
      if (t.seedRegistered && isOpen && offset >= 1 && !seededTitles.has(t.title)) {
        seededTitles.add(t.title);
        const s = sessions[sessions.length - 1];
        s.taken += 1;
        registrations[id] = { status: 'registered', calendar: null, at: now.toISOString() };
      }
    });
  }

  sessions.sort((a, b) => new Date(a.start) - new Date(b.start));

  const fridayFull = sessions.find((s) => s.title === 'Friday Night Open Play' && s.level === 'Int/Adv' && !s.opensAt);
  const firstReg = sessions.find((s) => registrations[s.id]);
  const nextLocked = sessions.find((s) => s.opensAt);

  const alerts = [];
  if (nextLocked) {
    alerts.push({
      id: 'seed-1',
      kind: 'info',
      title: 'Sign-up times are now shown in the app',
      body: `No more waiting by your phone — tap "Remind me" on any session and we'll notify you the moment sign-up opens.`,
      sessionId: nextLocked.id,
      time: new Date(now.getTime() - 3 * 3600e3).toISOString(),
      read: false,
    });
  }
  if (fridayFull) {
    alerts.push({
      id: 'seed-2',
      kind: 'new',
      title: 'New Friday Night Open Play posted',
      body: 'Friday Night Open Play (Int/Adv) just opened — and filled up fast. Join the waitlist to be first in line for a spot.',
      sessionId: fridayFull.id,
      time: new Date(now.getTime() - 20 * 3600e3).toISOString(),
      read: false,
    });
  }
  if (firstReg) {
    alerts.push({
      id: 'seed-3',
      kind: 'confirm',
      title: 'Registration confirmed',
      body: `You're registered for ${firstReg.title}, ${formatDay(firstReg.start, now)} at ${formatTime(firstReg.start)}.`,
      sessionId: firstReg.id,
      time: new Date(now.getTime() - 2 * 86400e3).toISOString(),
      read: true,
    });
  }

  return {
    version: 4,
    seededAt: now.toISOString(),
    user: {
      name: 'Sam Bryan',
      level: 'Int/Adv',
      memberSince: '2023',
      defaultCalendar: null,
      notify: { newSessions: true, waitlist: true, reminders: true },
    },
    groups: GROUPS.map((g) => ({ ...g })),
    sessions,
    registrations,
    reminders: {},
    alerts,
  };
}

// ---------- formatting helpers ----------

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatTime(iso) {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return m ? `${h}:${String(m).padStart(2, '0')} ${ap}` : `${h}:00 ${ap}`;
}

export function formatTimeRange(iso, durationMin) {
  const end = new Date(new Date(iso).getTime() + durationMin * 60e3);
  return `${formatTime(iso)} – ${formatTime(end.toISOString())}`;
}

export function formatDay(iso, now = new Date()) {
  const d = startOfDay(iso);
  const t = startOfDay(now);
  const diff = Math.round((d - t) / 86400e3);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;
}

export function formatDayLong(iso, now = new Date()) {
  const d = new Date(iso);
  const rel = formatDay(iso, now);
  const date = `${DOW_LONG[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;
  return rel === 'Today' || rel === 'Tomorrow' ? `${rel} · ${date}` : date;
}

export function dayChip(date) {
  const d = new Date(date);
  return { dow: DOW[d.getDay()], num: d.getDate() };
}

export function formatOpens(iso, now = new Date()) {
  return `${formatDay(iso, now)} at ${formatTime(iso)}`;
}

export function timeAgo(iso, now = new Date()) {
  const s = Math.max(0, (now - new Date(iso)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const days = Math.floor(s / 86400);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

// ---------- session status ----------

export function sessionStatus(session, reg, now = new Date()) {
  if (reg?.status === 'registered') return 'registered';
  if (reg?.status === 'waitlist') return 'waitlist';
  if (session.opensAt && new Date(session.opensAt) > now) return 'notOpen';
  if (session.taken >= session.capacity) return 'full';
  return 'open';
}

export function spotsLeft(session) {
  return Math.max(0, session.capacity - session.taken);
}

export const CALENDARS = {
  apple: { label: 'Apple Calendar', icon: 'calendar' },
  google: { label: 'Google Calendar', icon: 'logo-google' },
  outlook: { label: 'Outlook', icon: 'mail' },
};

export const REMINDERS = ['None', '30 min before', '1 hour before', '1 day before'];
