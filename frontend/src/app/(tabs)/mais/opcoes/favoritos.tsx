import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../../ThemeContext';
import { useFavoriteArticles } from '../../../../hooks/useFavoriteArticles';
import { codigoCivil, Artigo, Livro } from '../../../../data';
import { normalize } from '../../../../utils/normalize';

// Helper function to flatten the codigoCivil structure and find articles
const getAllArticles = (data: Livro[]): Artigo[] => {
  const articles: Artigo[] = [];

  data.forEach(livro => {
    livro.titulos.forEach(titulo => {
      titulo.capitulos.forEach(capitulo => {
        capitulo.artigos.forEach(artigo => articles.push(artigo));
        capitulo.secoes?.forEach(secao => {
          secao.artigos.forEach(artigo => articles.push(artigo));
          secao.subsecoes?.forEach(subsecao => {
            subsecao.artigos.forEach(artigo => articles.push(artigo));
          });
        });
      });
    });
  });
  return articles;
};

// Article Card Component
interface ArticleCardProps {
  article: Artigo;
  onPress: () => void;
  colors: any; // Theme colors
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress, colors }) => {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: normalize(8),
      marginHorizontal: normalize(16),
      marginVertical: normalize(8),
      padding: normalize(16),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      fontSize: normalize(18),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: normalize(4),
    },
    textSnippet: {
      fontSize: normalize(14),
      color: colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title} numberOfLines={1}>{article.nome}</Text>
      <Text style={styles.textSnippet} numberOfLines={2}>{article.texto}</Text>
    </TouchableOpacity>
  );
};

// Main Favoritos Screen Component
export default function FavoritosScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { favoriteArticles, loading: loadingFavorites } = useFavoriteArticles();

  const allArticles = useMemo(() => getAllArticles(codigoCivil), []);

  const favoritedArticleObjects = useMemo(() => {
    return allArticles.filter(article => favoriteArticles.includes(article.nome));
  }, [allArticles, favoriteArticles]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: normalize(20),
    },
    emptyText: {
      fontSize: normalize(18),
      color: colors.textSecondary,
      textAlign: 'center',
    },
    appbar: {
      backgroundColor: colors.background,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Artigos Favoritos" titleStyle={{ color: colors.text }} />
      </Appbar.Header>
      <FlatList
        data={favoritedArticleObjects}
        keyExtractor={(item) => item.nome}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => router.push({ pathname: '/article', params: { nome: item.nome, texto: item.texto } })}
            colors={colors}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{loadingFavorites ? 'A carregar artigos...' : 'Nenhum artigo favorito encontrado.'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}