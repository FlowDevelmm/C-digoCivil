import { Stack } from 'expo-router';

export default function MaisLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="opcoes"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}