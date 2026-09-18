import { useColorScheme } from 'react-native';

export type Palette = {
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
};

const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    background: '#F4F5F8',
    card: '#FFFFFF',
    text: '#11131A',
    muted: '#6B7280',
    border: '#E2E5EB',
    accent: '#2F6FED',
    accentSoft: '#E7EFFD',
    danger: '#D14343',
    success: '#1F8A54',
  },
  dark: {
    background: '#0B0D12',
    card: '#161A22',
    text: '#F2F4F8',
    muted: '#99A1B0',
    border: '#262C38',
    accent: '#6B9BFF',
    accentSoft: '#18233A',
    danger: '#FF6B63',
    success: '#4ED08A',
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export function useTheme(): { colors: Palette; dark: boolean } {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return { colors: palettes[dark ? 'dark' : 'light'], dark };
}
