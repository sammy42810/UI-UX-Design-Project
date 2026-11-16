// Pickleball mark drawn with plain Views (no SVG dependency): a yellow-green ball
// with the characteristic pattern of holes — center hole, inner ring of 6, outer ring of 6.
import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme';

const HOLES = [
  [0, 0],
  ...[0, 60, 120, 180, 240, 300].map((a) => [0.38, a]),
  ...[30, 90, 150, 210, 270, 330].map((a) => [0.72, a]),
];

export default function PickleballLogo({ size = 46, ball = colors.accent, hole = '#97A81C' }) {
  const r = size / 2;
  const holeD = size * 0.12;
  return (
    <View
      accessible
      accessibilityLabel="Courtside pickleball logo"
      style={{ width: size, height: size, borderRadius: r, backgroundColor: ball, overflow: 'hidden' }}
    >
      {HOLES.map(([dist, deg], i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = r + dist * r * Math.cos(rad);
        const cy = r + dist * r * Math.sin(rad);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: cx - holeD / 2,
              top: cy - holeD / 2,
              width: holeD,
              height: holeD,
              borderRadius: holeD / 2,
              backgroundColor: hole,
            }}
          />
        );
      })}
    </View>
  );
}
