import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import TopBar from '../../components/TopBar';

function FindJobsFAB({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={fabStyles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={fabStyles.circle}>
        <Ionicons name="search" size={26} color={Colors.white} />
      </View>
      <Text style={fabStyles.label}>FIND JOBS</Text>
    </TouchableOpacity>
  );
}

const fabStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  circle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: -22,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 10,
  },
  label: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

export default function TradieLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <TopBar />
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.card,
            borderTopColor: Colors.border,
            height: 88,
            paddingBottom: 25,
            paddingTop: 10,
          },
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="current-jobs"
          options={{
            title: 'My Jobs',
            tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarButton: (props) => <FindJobsFAB onPress={props.onPress as () => void} />,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
          }}
        />
        {/* Hidden — accessible via TopBar avatar tap */}
        <Tabs.Screen name="profile" options={{ href: null }} />
        {/* Hidden — accessible via Dashboard */}
        <Tabs.Screen name="payout" options={{ href: null }} />
        {/* Hidden — accessible via Profile */}
        <Tabs.Screen name="pricing" options={{ href: null }} />
        {/* Hidden — accessible after job completion */}
        <Tabs.Screen name="review-customer" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
