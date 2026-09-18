import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { Palette, radius, spacing, useTheme } from './theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: colors.card, borderColor: colors.border },
        styles.card,
        style,
      ]}>
      {children}
    </View>
  );
}

export type InfoNote = { title: string; body: string };

/**
 * Keeps the reasoning off the screen. Only state worth reading every visit stays
 * inline; the why, the caveats and the "what happens if" live one tap away.
 */
export function InfoButton({ note }: { note: InfoNote }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`About ${note.title}`}
        hitSlop={10}
        onPress={() => setOpen(true)}>
        <Text style={[styles.info, { color: colors.accent }]}>ⓘ</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.popoverBackdrop} onPress={() => setOpen(false)}>
          <View style={[styles.popover, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.popoverTitle, { color: colors.text }]}>{note.title}</Text>
            <Text style={[styles.popoverBody, { color: colors.muted }]}>{note.body}</Text>
            <Button title="Got it" variant="secondary" onPress={() => setOpen(false)} />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export function SectionHeader({
  title,
  info,
  action,
}: {
  title: string;
  info?: InfoNote;
  action?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>{title.toUpperCase()}</Text>
        {info ? <InfoButton note={info} /> : null}
      </View>
      {action}
    </View>
  );
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' | 'muted' }) {
  const { colors } = useTheme();
  const background =
    tone === 'accent' ? colors.accentSoft : tone === 'muted' ? 'transparent' : colors.background;
  const color = tone === 'accent' ? colors.accent : colors.muted;
  return (
    <View style={[styles.pill, { backgroundColor: background, borderColor: colors.border }]}>
      <Text style={[styles.pillText, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const { colors } = useTheme();
  const background =
    variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : colors.card;
  const textColor = variant === 'secondary' ? colors.text : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor: variant === 'secondary' ? colors.border : background,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  info,
  style,
  ...props
}: TextInputProps & { label: string; info?: InfoNote; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text>
        {info ? <InfoButton note={info} /> : null}
      </View>
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          styles.input,
          { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
          style,
        ]}
      />
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.muted }]}>{body}</Text>
    </View>
  );
}

export function Banner({ text, tone = 'accent' }: { text: string; tone?: 'accent' | 'danger' }) {
  const { colors } = useTheme();
  const color = tone === 'danger' ? colors.danger : colors.accent;
  return (
    <View style={[styles.banner, { backgroundColor: colors.accentSoft, borderColor: color }]}>
      <Text style={[styles.bannerText, { color }]}>{text}</Text>
    </View>
  );
}

export type { Palette };

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  info: { fontSize: 14, fontWeight: '600' },
  popoverBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  popover: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
  },
  popoverTitle: { fontSize: 16, fontWeight: '700' },
  popoverBody: { fontSize: 14, lineHeight: 20 },
  pill: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  pillText: { fontSize: 12, fontWeight: '600' },
  button: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  buttonText: { fontSize: 15, fontWeight: '600' },
  field: { gap: spacing.xs },
  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  input: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xxl },
  emptyTitle: { fontSize: 17, fontWeight: '600' },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  banner: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  bannerText: { fontSize: 13, lineHeight: 18 },
});
