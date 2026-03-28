import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Spacing} from '../constants/theme';

export function scorePassword(pw: string) {
  let score = 0;
  if (!pw) return score;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0..4
}

export default function PasswordStrength({password}: {password: string}) {
  const score = useMemo(() => scorePassword(password), [password]);
  const percent = (score / 4) * 100;
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  const barColor = score <= 1 ? '#FF4D4F' : score === 2 ? '#FFA940' : score === 3 ? '#40C057' : '#0A84FF';

  return (
    <View style={styles.container} accessibilityRole="status">
      <View style={styles.row}>
        <View style={[styles.bar, {width: `${percent}%`, backgroundColor: barColor}]} />
        <View style={[styles.barEmpty, {opacity: 0.12 - (percent/100)*0.12}]} />
      </View>
      <Text style={styles.label}>{label}{password ? ` • ${Math.max(0, password.length)} chars` : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 8, marginLeft: Spacing.md},
  row: {height: 8, backgroundColor: '#ffffff10', borderRadius: 6, overflow: 'hidden', flexDirection: 'row'},
  bar: {height: 8, borderRadius: 6},
  barEmpty: {flex: 1},
  label: {color: Colors.textSecondary, fontSize: 12, marginTop: 6}
});
