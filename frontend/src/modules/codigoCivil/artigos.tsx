import React from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '../../../ThemeContext';
import { codigoCivil, Artigo } from '../../../data';
import { useFavoriteArticles } from '../../../hooks/useFavoriteArticles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normalize } from '../../../utils/normalize';

const getArtigosData = (
  livroIndex: string,
  tituloIndex: string,
  capituloIndex: string,
  secaoIndex?: string,
  subsecaoIndex?: string
) => {
  const livro = codigoCivil[parseInt(livroIndex)];
  const titulo = livro?.titulos[parseInt(tituloIndex)];
  const capitulo = titulo?.capitulos[parseInt(capituloIndex)];

  let items: Artigo[] = [];
  let screenTitle = capitulo?.nome || 'Artigos';

  if (secaoIndex !== undefined) {
    const secao = capitulo?.secoes?.[parseInt(secaoIndex)];
    screenTitle = secao?.nome || screenTitle;
    if (subsecaoIndex !== undefined) {
      const subsecao = secao?.subsecoes?.[parseInt(subsecaoIndex)];
      items = subsecao?.artigos || [];
      screenTitle = subsecao?.nome || screenTitle;
    } else {
      items = secao?.artigos || [];
    }
  } else {
    items = capitulo?.artigos || [];
  }

  return { items, screenTitle };
};

export default function ArtigosScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{ livroIndex: string; tituloIndex: string; capituloIndex: string; secaoIndex?: string; subsecaoIndex?: string }>();
  
  const { items, screenTitle } = getArtigosData(
    params.livroIndex,
    params.tituloIndex,
    params.capituloIndex,
    params.secaoIndex,
    params.subsecaoIndex
  );

  const { isFavoriteArticle, addFavoriteArticle, removeFavoriteArticle } = useFavoriteArticles();

  if (!items || items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: screenTitle, headerStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 }, headerTintColor: colors.text }} />
        <View style={styles.centeredMessage}>
          <Text style={styles.errorText}>Nenhum artigo encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: screenTitle, headerStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 }, headerTintColor: colors.text }} />
      <FlatList
        data={items}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/article', params: { nome: item.nome, texto: item.texto, path: screenTitle } }} asChild>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.artigoNome}>{item.nome}</Text>
                <Text style={styles.artigoTexto} numberOfLines={2}>{item.texto.replace(/\n/g, ' ')}</Text>
              </View>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (isFavoriteArticle(item.nome)) {
                    removeFavoriteArticle(item.nome);
                  } else {
                    addFavoriteArticle(item.nome);
                  }
                }}
              >
                <MaterialCommunityIcons
                  name={isFavoriteArticle(item.nome) ? 'heart' : 'heart-outline'}
                  size={normalize(26)}
                  color={isFavoriteArticle(item.nome) ? colors.primary : colors.text}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: normalize(20),
    borderRadius: normalize(12),
    marginBottom: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    marginRight: normalize(16),
  },
  artigoNome: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: normalize(18),
    color: colors.primary,
    marginBottom: normalize(6),
  },
  artigoTexto: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: normalize(14),
    color: colors.text,
    lineHeight: normalize(20),
  },
  favoriteButton: {
    padding: normalize(8),
  },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: normalize(16),
    color: colors.text,
    textAlign: 'center',
  },
});