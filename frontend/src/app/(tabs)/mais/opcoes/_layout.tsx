import { Stack } from 'expo-router';
import { useTheme } from '../../../../ThemeContext';

export default function OpcoesLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
      }}
    />
  );
}