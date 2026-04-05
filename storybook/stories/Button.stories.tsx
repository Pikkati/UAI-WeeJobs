import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { action } from '@storybook/addon-ondevice-actions';

const Button = ({ title, onPress }: { title: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.btn} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: { padding: 12, backgroundColor: '#0b84ff', borderRadius: 6 },
  text: { color: '#fff', fontWeight: '600' },
});

storiesOf('Example/Button', module).add('default', () => (
  <Button title="Hello Storybook" onPress={action('pressed')} />
));
