// App-wide state: a reducer persisted to AsyncStorage so registrations, waitlists,
// calendar choices and profile edits survive closing the app until "Reset".
import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildSeed, formatDay, formatTime, CALENDARS } from './data';

const STORAGE_KEY = 'courtside-prototype-v4';
const RESEED_AFTER_DAYS = 3;

let alertSeq = 0;
function makeAlert(kind, title, body, sessionId) {
  alertSeq += 1;
  return {
    id: `a-${Date.now()}-${alertSeq}`,
    kind,
    title,
    body,
    sessionId,
    time: new Date().toISOString(),
    read: false,
  };
}

function updateSession(state, id, fn) {
  return state.sessions.map((s) => (s.id === id ? fn(s) : s));
}

function when(s) {
  return `${formatDay(s.start)} at ${formatTime(s.start)}`;
}

function reducer(state, action) {
  const session = action.id ? state.sessions.find((s) => s.id === action.id) : null;

  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'RESET':
      return buildSeed();

    case 'REGISTER': {
      if (!session) return state;
      const prev = state.registrations[action.id];
      if (prev?.status === 'registered') return state;
      const fromWaitlist = prev?.status === 'waitlist';
      return {
        ...state,
        sessions: updateSession(state, action.id, (s) => ({
          ...s,
          taken: s.taken + 1,
          waitlist: fromWaitlist ? Math.max(0, s.waitlist - 1) : s.waitlist,
        })),
        registrations: {
          ...state.registrations,
          [action.id]: { status: 'registered', calendar: null, at: new Date().toISOString() },
        },
        alerts: [
          makeAlert('confirm', 'Registration confirmed', `You're registered for ${session.title}, ${when(session)}.`, action.id),
          ...state.alerts,
        ],
      };
    }

    case 'JOIN_WAITLIST': {
      if (!session || state.registrations[action.id]) return state;
      const position = session.waitlist + 1;
      return {
        ...state,
        sessions: updateSession(state, action.id, (s) => ({ ...s, waitlist: s.waitlist + 1 })),
        registrations: {
          ...state.registrations,
          [action.id]: { status: 'waitlist', position, at: new Date().toISOString() },
        },
        alerts: [
          makeAlert('waitlist', `You're #${position} on the waitlist`, `${session.title}, ${when(session)}. If a spot opens we'll move you in automatically and let you know.`, action.id),
          ...state.alerts,
        ],
      };
    }

    case 'LEAVE_WAITLIST': {
      if (!session || state.registrations[action.id]?.status !== 'waitlist') return state;
      const { [action.id]: _removed, ...rest } = state.registrations;
      return {
        ...state,
        sessions: updateSession(state, action.id, (s) => ({ ...s, waitlist: Math.max(0, s.waitlist - 1) })),
        registrations: rest,
      };
    }

    case 'CANCEL': {
      if (!session || state.registrations[action.id]?.status !== 'registered') return state;
      const { [action.id]: _removed, ...rest } = state.registrations;
      return {
        ...state,
        sessions: updateSession(state, action.id, (s) => ({ ...s, taken: Math.max(0, s.taken - 1) })),
        registrations: rest,
        alerts: [
          makeAlert('cancel', 'Registration cancelled', `You're no longer registered for ${session.title}, ${when(session)}.`, action.id),
          ...state.alerts,
        ],
      };
    }

    // Undo for a cancellation: put the exact previous registration back.
    case 'RESTORE': {
      if (!session || state.registrations[action.id]) return state;
      const idx = state.alerts.findIndex((a) => a.kind === 'cancel' && a.sessionId === action.id);
      return {
        ...state,
        sessions: updateSession(state, action.id, (s) => ({ ...s, taken: s.taken + 1 })),
        registrations: { ...state.registrations, [action.id]: action.reg },
        alerts: idx === -1 ? state.alerts : state.alerts.filter((_, i) => i !== idx),
      };
    }

    case 'ADD_TO_CALENDAR': {
      const reg = state.registrations[action.id];
      if (!reg) return state;
      return {
        ...state,
        registrations: {
          ...state.registrations,
          [action.id]: { ...reg, calendar: action.calendar, reminder: action.reminder },
        },
        user: { ...state.user, defaultCalendar: action.calendar },
        alerts: [
          makeAlert('calendar', `Added to ${CALENDARS[action.calendar].label}`, `${session.title}, ${when(session)}${action.reminder && action.reminder !== 'None' ? ` · reminder ${action.reminder}` : ''}.`, action.id),
          ...state.alerts,
        ],
      };
    }

    case 'TOGGLE_REMIND': {
      const on = !state.reminders[action.id];
      return { ...state, reminders: { ...state.reminders, [action.id]: on } };
    }

    // Prototype control: a spot opens in a session you're waitlisted for.
    case 'SIMULATE_SPOT': {
      const id = Object.keys(state.registrations).find((k) => state.registrations[k].status === 'waitlist');
      const s = state.sessions.find((x) => x.id === id);
      if (!s) return state;
      return {
        ...state,
        sessions: updateSession(state, id, (x) => ({ ...x, waitlist: Math.max(0, x.waitlist - 1) })),
        registrations: {
          ...state.registrations,
          [id]: { status: 'registered', calendar: null, at: new Date().toISOString(), fromWaitlist: true },
        },
        alerts: [
          makeAlert('spot', "A spot opened — you're in!", `Someone cancelled, so we moved you off the waitlist and into ${s.title}, ${when(s)}.`, id),
          ...state.alerts,
        ],
      };
    }

    // Prototype control: sign-up opens for every session you asked to be reminded about.
    case 'SIMULATE_OPEN': {
      const ids = Object.keys(state.reminders).filter((k) => state.reminders[k]);
      const targets = state.sessions.filter((s) => ids.includes(s.id) && s.opensAt);
      if (!targets.length) return state;
      const targetIds = targets.map((t) => t.id);
      return {
        ...state,
        sessions: state.sessions.map((s) => (targetIds.includes(s.id) ? { ...s, opensAt: null } : s)),
        reminders: Object.fromEntries(Object.entries(state.reminders).filter(([k]) => !targetIds.includes(k))),
        alerts: [
          ...targets.map((t) => makeAlert('new', `Sign-up is open: ${t.title}`, `${when(t)} · ${t.level}. Spots go fast — tap to sign up now.`, t.id)),
          ...state.alerts,
        ],
      };
    }

    case 'JOIN_GROUP': {
      const g = state.groups.find((x) => x.id === action.groupId);
      if (!g || g.joined) return state;
      return {
        ...state,
        groups: state.groups.map((x) => (x.id === g.id ? { ...x, joined: true, memberCount: x.memberCount + 1 } : x)),
        alerts: [makeAlert('group', `You joined ${g.name}`, "Its sessions now show up on Find alongside your other groups.", null), ...state.alerts],
      };
    }

    case 'LEAVE_GROUP':
      return {
        ...state,
        groups: state.groups.map((x) => (x.id === action.groupId ? { ...x, joined: false, memberCount: Math.max(0, x.memberCount - 1) } : x)),
      };

    case 'MARK_READ':
      return { ...state, alerts: state.alerts.map((a) => (a.id === action.alertId ? { ...a, read: true } : a)) };

    case 'MARK_ALL_READ':
      return { ...state, alerts: state.alerts.map((a) => ({ ...a, read: true })) };

    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.patch } };

    case 'UPDATE_NOTIFY':
      return { ...state, user: { ...state.user, notify: { ...state.user.notify, ...action.patch } } };

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => buildSeed());
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const age = (Date.now() - new Date(saved.seededAt).getTime()) / 86400e3;
          if (saved.version === 4 && age < RESEED_AFTER_DAYS) {
            dispatch({ type: 'HYDRATE', state: saved });
          }
        }
      } catch (e) {
        // Storage unavailable: fall back to fresh seed data.
      }
      hydrated.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch, ready }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
