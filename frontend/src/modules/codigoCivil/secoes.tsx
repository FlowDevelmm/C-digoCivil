import React from 'react';
import { Text, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '../../../ThemeContext';
import { codigoCivil } from '../../../data';
import { MaterialIcons } from '@expo/vector-icons';
import { normalize } from '../../../utils/normalize';

export default function SecoesScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { livroIndex, tituloIndex, capituloIndex } = useLocalSearchParams<{ livroIndex: string; tituloIndex: string; capituloIndex: string }>();
  const livro = codigoCivil[parseInt(livroIndex)];
  const titulo = livro?.titulos[parseInt(tituloIndex)];
  const capitulo = titulo?.capitulos[parseInt(capituloIndex)];

  if (!capitulo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Capítulo não encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Código', headerStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 }, headerTintColor: colors.text }} />
      <FlatList
        data={capitulo.secoes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index: secaoIndex }) => {
          const pathname = item.subsecoes && item.subsecoes.length > 0 ? '/codigo/subsecoes' : '/codigo/artigos';
          return (
            <Link href={{ pathname, params: { livroIndex, tituloIndex, capituloIndex, secaoIndex } }} asChild>
              <TouchableOpacity style={styles.itemContainer}>
                <Text style={styles.itemText}>{item.nome}</Text>
                <MaterialIcons name="chevron-right" size={24} color={colors.text} />
              </TouchableOpacity>
            </Link>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
  },
  itemText: {
    fontFamily: 'SF-Pro-Display-Regular',
    fontSize: normalize(18),
    lineHeight: 18 * 1.5,
    color: colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: colors.text,
  },
});