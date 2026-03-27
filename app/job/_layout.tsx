import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function JobLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="choose-tradesman" />
      <Stack.Screen name="pay-deposit" />
      <Stack.Screen name="tracking" />
      <Stack.Screen name="send-quote" />
      <Stack.Screen name="approve-quote" />
      <Stack.Screen name="pay-final" />
      <Stack.Screen name="receipt" />
      <Stack.Screen name="review" />
    </Stack>
  );
}
