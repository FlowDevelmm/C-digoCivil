
import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '../../../ThemeContext';
import { codigoCivil, Livro, Titulo, Capitulo, Artigo, Secao, Subsecao } from '../../../data';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { normalize } from '../../../utils/normalize';
import { useFavoriteArticles } from '../../../hooks/useFavoriteArticles';

const getAllArtigos = (capitulo: Capitulo): Artigo[] => {
  let artigos: Artigo[] = [...capitulo.artigos];
  if (capitulo.secoes) {
    capitulo.secoes.forEach((secao) => {
      artigos = [...artigos, ...secao.artigos];
      if (secao.subsecoes) {
        secao.subsecoes.forEach((subsecao) => {
          artigos = [...artigos, ...subsecao.artigos];
        });
      }
    });
  }
  return artigos;
};

export default function CapituloDetailScreen() {
  const { colors } = useTheme();
  const { addFavoriteArticle, removeFavoriteArticle, isFavoriteArticle } = useFavoriteArticles();
  const styles = getStyles(colors);
  const { livroIndex, tituloIndex, capituloIndex } = useLocalSearchParams<{ livroIndex: string; tituloIndex: string; capituloIndex: string }>();

  const livro: Livro = codigoCivil[parseInt(livroIndex)];
  const titulo: Titulo = livro?.titulos[parseInt(tituloIndex)];
  const capitulo: Capitulo = titulo?.capitulos[parseInt(capituloIndex)];

  if (!capitulo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Capítulo não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const artigos = getAllArtigos(capitulo);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Código', headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text }} />
      <View style={styles.breadcrumbContainer}>
        <Link href={{ pathname: '/(tabs)/codigo' }} asChild>
          <TouchableOpacity>
            <Text style={styles.breadcrumbText}>{livro.nome}</Text>
          </TouchableOpacity>
        </Link>
        <MaterialIcons name="chevron-right" size={20} color={colors.text} />
        <Link href={{ pathname: '/(tabs)/codigo/titulos', params: { livroIndex } }} asChild>
          <TouchableOpacity>
            <Text style={styles.breadcrumbText}>{titulo.nome}</Text>
          </TouchableOpacity>
        </Link>
        <MaterialIcons name="chevron-right" size={20} color={colors.text} />
        <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>{capitulo.nome}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {artigos.map((artigo, index) => (
          <View key={index} style={styles.artigoContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.artigoNome}>{artigo.nome}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (isFavoriteArticle(artigo.nome)) {
                    removeFavoriteArticle(artigo.nome);
                  } else {
                    addFavoriteArticle(artigo.nome);
                  }
                }}
              >
                <MaterialCommunityIcons
                  name={isFavoriteArticle(artigo.nome) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavoriteArticle(artigo.nome) ? colors.primary : colors.text}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.artigoTexto}>{artigo.texto}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalize(16),
    backgroundColor: colors.card,
  },
  breadcrumbText: {
    fontFamily: 'SF-Pro-Display-Regular',
    fontSize: normalize(14),
    color: colors.text,
  },
  breadcrumbActive: {
    fontFamily: 'SF-Pro-Display-Bold',
    color: colors.primary,
  },
  contentContainer: {
    padding: normalize(16),
  },
  artigoContainer: {
    marginBottom: normalize(20),
  },
  artigoNome: {
    fontFamily: 'SF-Pro-Display-Bold',
    fontSize: normalize(18),
    color: colors.text,
    marginBottom: normalize(8),
  },
  artigoTexto: {
    fontFamily: 'SF-Pro-Display-Regular',
    fontSize: normalize(16),
    lineHeight: normalize(16) * 1.5,
    color: colors.text,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: colors.text,
  },
});
