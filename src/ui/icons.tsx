import { Fragment } from 'react';
import { View } from 'react-native';

/**
 * The four tab glyphs, drawn from views. An icon font would be one more
 * dependency and one more font file for four shapes this simple.
 */

export type IconProps = { color: string; size: number };

const strokeWidth = (size: number) => Math.max(1.5, Math.round(size * 0.08));

export function SearchIcon({ color, size }: IconProps) {
  const stroke = strokeWidth(size);
  const ring = size * 0.62;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.08,
          left: size * 0.08,
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.73 - stroke / 2,
          left: size * 0.56,
          width: size * 0.34,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function LibraryIcon({ color, size }: IconProps) {
  const stroke = strokeWidth(size);
  const spine = stroke * 1.6;
  const base = size * 0.14;

  const spines: { left: number; height: number; tilt?: string }[] = [
    { left: size * 0.16, height: size * 0.62 },
    { left: size * 0.36, height: size * 0.72 },
    { left: size * 0.56, height: size * 0.66 },
    { left: size * 0.75, height: size * 0.58, tilt: '12deg' },
  ];

  return (
    <View style={{ width: size, height: size }}>
      {spines.map(({ left, height, tilt }) => (
        <View
          key={left}
          style={{
            position: 'absolute',
            bottom: base,
            left,
            width: spine,
            height,
            borderRadius: spine / 2,
            backgroundColor: color,
            transform: tilt ? [{ rotate: tilt }] : undefined,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          bottom: base - stroke,
          left: size * 0.1,
          right: size * 0.1,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function CardsIcon({ color, size }: IconProps) {
  const stroke = strokeWidth(size);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.1,
          left: size * 0.26,
          width: size * 0.48,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.24,
          left: size * 0.17,
          width: size * 0.66,
          height: stroke,
          borderRadius: stroke / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.38,
          left: size * 0.08,
          width: size * 0.84,
          height: size * 0.48,
          borderRadius: size * 0.16,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
    </View>
  );
}

export function SettingsIcon({ color, size }: IconProps) {
  const stroke = strokeWidth(size);
  const knob = stroke * 2.8;

  const rows: { top: number; knobLeft: number }[] = [
    { top: size * 0.25, knobLeft: size * 0.3 },
    { top: size * 0.5, knobLeft: size * 0.62 },
    { top: size * 0.75, knobLeft: size * 0.42 },
  ];

  return (
    <View style={{ width: size, height: size }}>
      {rows.map(({ top, knobLeft }) => (
        <Fragment key={top}>
          <View
            style={{
              position: 'absolute',
              top: top - stroke / 2,
              left: size * 0.1,
              right: size * 0.1,
              height: stroke,
              borderRadius: stroke / 2,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: top - knob / 2,
              left: knobLeft - knob / 2,
              width: knob,
              height: knob,
              borderRadius: knob / 2,
              backgroundColor: color,
            }}
          />
        </Fragment>
      ))}
    </View>
  );
}
