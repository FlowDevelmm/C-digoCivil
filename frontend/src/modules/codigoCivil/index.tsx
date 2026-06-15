import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar } from 'react-native-paper';
import { Link } from 'expo-router';
import { useTheme } from '../../../ThemeContext';
import { codigoCivil } from '../../../data';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normalize } from '../../../utils/normalize';

export default function LivrosScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Código" titleStyle={styles.title} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {codigoCivil.map((livro, index) => (
          <Link key={index} href={{ pathname: '/codigo/titulos', params: { livroIndex: index } }} asChild>
            <TouchableOpacity style={styles.bookItem}>
              <MaterialCommunityIcons name="book-open-variant" size={normalize(60)} color={colors.primary} />
              <Text style={styles.bookTitle}>{livro.nome}</Text>
            </TouchableOpacity>
          </Link>
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
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },
  title: {
    fontFamily: 'SF-Pro-Display-Bold',
    fontSize: normalize(22),
    lineHeight: normalize(22) * 1.5,
    color: colors.text,
    textAlign: 'center'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: normalize(10),
  },
  bookItem: {
    width: '45%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    margin: normalize(5),
    padding: normalize(10),
  },
  bookTitle: {
    fontFamily: 'SF-Pro-Display-Bold',
    fontSize: normalize(16),
    color: colors.text,
    marginTop: normalize(10),
    textAlign: 'center',
  },
});