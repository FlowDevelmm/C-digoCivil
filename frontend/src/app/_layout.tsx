import { ThemeProvider, useTheme } from '../ThemeContext';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavoriteArticles } from '../hooks/useFavoriteArticles';

// Impede que a tela de splash desapareça automaticamente
void SplashScreen.preventAutoHideAsync();

const ArticleHeaderRight = ({ articleName }: { articleName: string }) => {
  const { favoriteArticles, addFavoriteArticle, removeFavoriteArticle } = useFavoriteArticles();
  const { colors } = useTheme();
  const isFavorite = favoriteArticles.includes(articleName);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteArticle(articleName);
    } else {
      addFavoriteArticle(articleName);
    }
  };

  return (
    <TouchableOpacity onPress={toggleFavorite} style={{ marginRight: 16 }}>
      <Ionicons
        name={isFavorite ? 'star' : 'star-outline'}
        size={24}
        color={isFavorite ? colors.primary : colors.text}
      />
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'SF-Pro-Display-Black-Italic': require('../../assets/fonts/sfprodisplayblackitalic.otf'),
    'SF-Pro-Display-Bold': require('../../assets/fonts/sfprodisplaybold.otf'),
    'SF-Pro-Display-Heavy-Italic': require('../../assets/fonts/sfprodisplayheavyitalic.otf'),
    'SF-Pro-Display-Light-Italic': require('../../assets/fonts/sfprodisplaylightitalic.otf'),
    'SF-Pro-Display-Medium': require('../../assets/fonts/sfprodisplaymedium.otf'),
    'SF-Pro-Display-Regular': require('../../assets/fonts/sfprodisplayregular.otf'),
    'SF-Pro-Display-Semibold-Italic': require('../../assets/fonts/sfprodisplaysemibolditalic.otf'),
    'SF-Pro-Display-Thin-Italic': require('../../assets/fonts/sfprodisplaythinitalic.otf'),
    'SF-Pro-Display-Ultralight-Italic': require('../../assets/fonts/sfprodisplayultralightitalic.otf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Esconde a tela de splash quando as fontes estiverem carregadas ou se houver um erro
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    // Retorna nulo apenas enquanto as fontes estão carregando e não há erro
    return null;
  }

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="article" 
          options={({ route }) => ({
            title: route.params.nome as string,
            headerRight: () => <ArticleHeaderRight articleName={route.params.nome as string} />,
          })}
        />
      </Stack>
    </ThemeProvider>
  );
}