// Visual tokens shared by every screen. Colors were chosen for strong contrast
// (WCAG AA on white) because several of our testers are 50+.
export const colors = {
  bg: '#F3F5F2',
  card: '#FFFFFF',
  text: '#16211E',
  muted: '#55635F',
  faint: '#8A9692',
  border: '#DFE5E2',

  primary: '#0E5E57',
  primaryDark: '#0A4540',
  primarySoft: '#E3F0EE',
  accent: '#D6E83C', // pickleball yellow-green

  success: '#15803D',
  successSoft: '#DCFCE7',
  warn: '#A15C07',
  warnSoft: '#FEF3C7',
  danger: '#B42318',
  dangerSoft: '#FEE4E2',
  info: '#1D4ED8',
  infoSoft: '#DBEAFE',
};

export const typeStyles = {
  'Open Play': { color: '#0E5E57', soft: '#E3F0EE', icon: 'people' },
  Clinic: { color: '#6D28D9', soft: '#EDE9FE', icon: 'school' },
  Lesson: { color: '#1D4ED8', soft: '#DBEAFE', icon: 'person' },
};

export const radius = { md: 12, lg: 18, pill: 999 };

export const shadow = {
  shadowColor: '#0B2A26',
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};
