import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNotifications } from '../context/NotificationsContext';

export default function PushNotificationOptIn() {
  const { isOptedIn, optIn, optOut, permissionStatus } = useNotifications();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleEnable = async () => {
    setLoading(true);
    setMessage(null);
    const res = await optIn();
    setLoading(false);
    if (res.success) setMessage('Notifications enabled');
    else setMessage(res.error || 'Could not enable notifications');
  };

  const handleDisable = async () => {
    setLoading(true);
    await optOut();
    setLoading(false);
    setMessage('Notifications disabled');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Push notifications</Text>
      <Text style={styles.desc}>Enable push notifications to receive job alerts and messages.</Text>
      {isOptedIn ? (
        <TouchableOpacity onPress={handleDisable} style={styles.button} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Working…' : 'Disable'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleEnable} style={styles.button} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Enabling…' : 'Enable notifications'}</Text>
        </TouchableOpacity>
      )}
      {permissionStatus !== 'unknown' && <Text style={styles.small}>Permission: {permissionStatus}</Text>}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  desc: { fontSize: 13, color: '#666', marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  message: { marginTop: 10, color: '#333' },
  small: { marginTop: 8, fontSize: 12, color: '#666' },
});
