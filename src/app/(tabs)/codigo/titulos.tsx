import React from "react";
import { Text, View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, Stack } from "expo-router";
import { useTheme } from '../../../ThemeContext';
import { codigoCivil } from '../../../data';
import { MaterialIcons } from '@expo/vector-icons';
import { normalize } from "../../../utils/normalize";

// Function to convert number to Roman numeral
const toRoman = (num) => {
  const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let str = '';
  for (let i of Object.keys(roman)) {
    let q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }
  return str;
};

export default function TitulosScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { livroIndex } = useLocalSearchParams<{ livroIndex: string }>();
  const livro = codigoCivil[parseInt(livroIndex)];

  if (!livro) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Livro não encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Títulos", headerStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 }, headerTintColor: colors.text }} />
      <FlatList
        data={livro.titulos}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index: tituloIndex }) => (
          <Link href={{ pathname: "/codigo/capitulos", params: { livroIndex, tituloIndex } }} asChild>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.romanNumeral}>TÍTULO {toRoman(tituloIndex + 1)}</Text>
                <Text style={styles.itemText}>{item.nome}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={normalize(28)} color={colors.text} />
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
  },
  romanNumeral: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: normalize(14),
    color: colors.primary,
    marginBottom: normalize(4),
  },
  itemText: {
    fontFamily: 'Inter_18pt-SemiBold',
    fontSize: normalize(18),
    color: colors.text,
    lineHeight: normalize(24),
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: colors.text,
  },
});