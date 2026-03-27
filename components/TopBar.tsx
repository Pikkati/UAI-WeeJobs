import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export const TOP_BAR_HEIGHT = 56;

export default function TopBar() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const handleAvatarPress = () => {
    if (user?.role === 'tradesperson') {
      router.push('/tradie/profile');
    } else {
      router.push('/customer/profile');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        {/* Settings */}
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color={Colors.white} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>WeeJobs</Text>
        </View>

        {/* Bell + Avatar */}
        <View style={styles.rightGroup}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} onPress={handleAvatarPress}>
            <Ionicons name="person" size={16} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
});
