import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFavoriteArticles } from '../hooks/useFavoriteArticles';
import { normalize } from '../utils/normalize';

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: normalize(20),
  },
  title: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: normalize(24),
    color: colors.text,
    marginBottom: normalize(10),
    flex: 1,
  },
  path: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: normalize(16),
    color: colors.text,
    opacity: 0.7,
    marginBottom: normalize(20),
    fontStyle: 'italic',
  },
  text: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: normalize(18),
    lineHeight: normalize(28),
    color: colors.text,
    marginBottom: normalize(15),
  },
  paragraph: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: normalize(18),
    lineHeight: normalize(28),
    color: colors.text,
    marginBottom: normalize(15),
    marginLeft: normalize(20), // Indentation for paragraphs
  },
  paragraphTitle: {
    fontFamily: 'Inter_18pt-SemiBold',
    fontSize: normalize(18),
    lineHeight: normalize(28),
    color: colors.text,
    marginBottom: normalize(5),
  }
});

const ArticleScreen = () => {
  const { colors } = useTheme();
  const { addFavoriteArticle, removeFavoriteArticle, isFavoriteArticle } = useFavoriteArticles();
  const styles = getStyles(colors);
  const { nome, texto, path } = useLocalSearchParams<{ nome: string; texto: string; path: string }>();

  const renderArticleText = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Parágrafo único.')) {
        const restOfLine = trimmedLine.substring('Parágrafo único.'.length).trim();
        return (
          <View key={index} style={{ marginBottom: normalize(15) }}>
            <Text style={styles.paragraphTitle}>Parágrafo único.</Text>
            {restOfLine ? <Text style={styles.text}>{restOfLine}</Text> : null}
          </View>
        );
      }
      
      const romanMatch = trimmedLine.match(/^[IVXLCDM]+ -/);
      if (romanMatch) {
        return (
          <Text key={index} style={styles.paragraph}>
            <Text style={{ fontFamily: 'Inter_18pt-Bold' }}>{romanMatch[0]} </Text>
            {trimmedLine.substring(romanMatch[0].length)}
          </Text>
        );
      }

      const numberMatch = trimmedLine.match(/^\d+\./);
      if (numberMatch) {
        return (
          <Text key={index} style={styles.paragraph}>
            <Text style={{ fontFamily: 'Inter_18pt-Bold' }}>{numberMatch[0]} </Text>
            {trimmedLine.substring(numberMatch[0].length)}
          </Text>
        );
      }
      
      if(trimmedLine.length > 0){
        return (
          <Text key={index} style={styles.text}>
            {trimmedLine}
          </Text>
        );
      }
      return null;
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={styles.title}>{nome}</Text>
          <TouchableOpacity
            style={{ paddingLeft: normalize(10)}}
            onPress={() => {
              if (isFavoriteArticle(nome as string)) {
                removeFavoriteArticle(nome as string);
              } else {
                addFavoriteArticle(nome as string);
              }
            }}
          >
            <MaterialCommunityIcons
              name={isFavoriteArticle(nome as string) ? 'heart' : 'heart-outline'}
              size={normalize(28)}
              color={isFavoriteArticle(nome as string) ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.path}>{path}</Text>
        {renderArticleText(texto)}
      </View>
    </ScrollView>
  );
};

export default ArticleScreen;
