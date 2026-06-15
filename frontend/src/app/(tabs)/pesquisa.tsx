import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { Appbar, Searchbar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../ThemeContext';
import { codigoCivil, Artigo } from '../../data';
import { glossario } from '../../glossario';
import { categories } from '../../categories';
import { synonyms } from '../../synonyms';
import { normalize } from '../../utils/normalize';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const Pesquisa = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const categoryIcons = {
    "Família": "group",
    "Contratos": "assignment",
    "Propriedade": "home",
    "Obrigações": "receipt-long",
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.background,
    },
    title: {
      color: colors.text,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: normalize(10),
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalize(10),
      paddingVertical: normalize(5),
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      margin: normalize(5),
    },
    filterButtonText: {
      marginLeft: normalize(5),
      color: colors.text,
    },
    activeFilterButton: {
      backgroundColor: colors.primary,
    },
    activeFilterButtonText: {
      color: colors.card,
    },
    resultItem: {
      padding: normalize(15),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultTitle: {
      fontSize: normalize(16),
      fontWeight: 'bold',
      color: colors.text,
    },
    resultPath: {
      fontSize: normalize(12),
      color: colors.text,
    },
    resultDefinicao: {
      fontSize: normalize(14),
      color: colors.text,
      marginTop: 4,
    },
    highlight: {
      backgroundColor: colors.primary,
      color: colors.card,
    },
    suggestionsContainer: {
        backgroundColor: colors.card,
        borderRadius: 5,
        marginHorizontal: normalize(10),
        marginTop: normalize(5),
    },
    suggestionItem: {
        padding: normalize(10),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    }
  });

  const allArtigos = useMemo(() => {
    const articles: (Artigo & { path: string })[] = [];
    codigoCivil.forEach((livro) => {
      livro.titulos.forEach((titulo) => {
        titulo.capitulos.forEach((capitulo) => {
          const capituloPath = `${livro.nome} / ${titulo.nome} / ${capitulo.nome}`;
          capitulo.artigos.forEach(artigo => {
            articles.push({ ...artigo, path: capituloPath });
          });
          if (capitulo.secoes) {
            capitulo.secoes.forEach((secao) => {
              const secaoPath = `${capituloPath} / ${secao.nome}`;
              secao.artigos.forEach(artigo => {
                articles.push({ ...artigo, path: secaoPath });
              });
              if (secao.subsecoes) {
                secao.subsecoes.forEach((subsecao) => {
                  const subsecaoPath = `${secaoPath} / ${subsecao.nome}`;
                  subsecao.artigos.forEach(artigo => {
                    articles.push({ ...artigo, path: subsecaoPath });
                  });
                });
              }
            });
          }
        });
      });
    });
    return articles;
  }, []);

  useEffect(() => {
    let results: any[] = [];
    const query = searchQuery.toLowerCase();

    if (searchQuery.trim() === '') {
        setSuggestions([]);
        if (!searchScope) {
            setSearchResults([]);
            return;
        }
    } else {
        // Autocomplete suggestions
        const allTerms = [...allArtigos.map(a => a.nome), ...glossario.map(g => g.termo)];
        const uniqueTerms = [...new Set(allTerms)];
        const filteredSuggestions = uniqueTerms.filter(term => term.toLowerCase().includes(query));
        setSuggestions(filteredSuggestions);
    }

    // Intelligent search with synonyms
    const queryParts = query.split(' ').filter(p => p.length > 2);
    const allQueries = [...queryParts];
    queryParts.forEach(part => {
        if (synonyms[part]) {
            allQueries.push(...synonyms[part]);
        }
    });

    if (searchScope === null) {
      results = allArtigos.filter((artigo) =>
        allQueries.some(q => 
            artigo.nome.toLowerCase().includes(q) ||
            artigo.texto.toLowerCase().includes(q)
        )
      ).map(artigo => ({ ...artigo, type: 'artigo' }));
    } else if (Object.keys(categories).includes(searchScope)) {
        const categoryArtigos = allArtigos.filter(artigo => categories[searchScope].includes(artigo.nome));
        if (searchQuery.trim() === '') {
            results = categoryArtigos.map(artigo => ({ ...artigo, type: 'artigo' }));
        } else {
            results = categoryArtigos.filter((artigo) =>
                allQueries.some(q => 
                    artigo.nome.toLowerCase().includes(q) ||
                    artigo.texto.toLowerCase().includes(q)
                )
            ).map(artigo => ({ ...artigo, type: 'artigo' }));
        }
    } else if (searchScope === 'glossario') {
        if (searchQuery.trim() === '') {
            results = glossario.map(entry => ({ ...entry, type: 'glossario' }));
        } else {
            results = glossario.filter(entry =>
                allQueries.some(q => 
                    entry.termo.toLowerCase().includes(q) ||
                    entry.definicao.toLowerCase().includes(q)
                )
            ).map(entry => ({ ...entry, type: 'glossario' }));
        }
    }

    setSearchResults(results);
  }, [searchQuery, searchScope, allArtigos]);

  const highlightText = (text: string, query: string) => {
    if (!query) {
      return <Text>{text}</Text>;
    }
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <Text>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <Text key={index} style={styles.highlight}>{part}</Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    if (!item) {
      return null;
    }

    let onPress = () => {};
    let content = <></>;

    switch (item.type) {
      case 'artigo':
        onPress = () => router.push({ pathname: '/article', params: { nome: item.nome, texto: item.texto, path: item.path } });
        content = (
          <>
            <Text style={styles.resultTitle}>{highlightText(item.nome, searchQuery)}</Text>
            {item.path && <Text style={styles.resultPath}>{item.path}</Text>}
          </>
        );
        break;
      case 'glossario':
        content = (
          <>
            <Text style={styles.resultTitle}>{highlightText(item.termo, searchQuery)}</Text>
            <Text style={styles.resultDefinicao}>{highlightText(item.definicao, searchQuery)}</Text>
          </>
        );
        break;
    }

    return (
      <Pressable style={styles.resultItem} onPress={onPress}>
        {content}
      </Pressable>
    );
  };

  const toggleScope = (scope: string) => {
    setSearchScope(searchScope === scope ? null : scope);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Pesquisa" titleStyle={styles.title} />
      </Appbar.Header>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: normalize(10) }}>
        <Searchbar
          placeholder="Pesquisar..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border}}
          autoFocus
        />
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
            <FlatList
                data={suggestions.slice(0, 5)} // Show only top 5 suggestions
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.suggestionItem} onPress={() => {
                        setSearchQuery(item);
                        setSuggestions([]);
                    }}>
                        <Text style={{ color: colors.text }}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
      )}

      <View style={[styles.filterContainer, { flexWrap: 'wrap' }]}>
        {Object.keys(categories).map(category => (
            <TouchableOpacity key={category} style={[styles.filterButton, searchScope === category && styles.activeFilterButton]} onPress={() => toggleScope(category)}>
                <MaterialIcons name={categoryIcons[category]} size={normalize(18)} color={searchScope === category ? colors.card : colors.text} />
                <Text style={[styles.filterButtonText, searchScope === category && styles.activeFilterButtonText]}>{category}</Text>
            </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.filterButton, searchScope === 'glossario' && styles.activeFilterButton]} onPress={() => toggleScope('glossario')}>
          <MaterialIcons name="menu-book" size={normalize(18)} color={searchScope === 'glossario' ? colors.card : colors.text} />
          <Text style={[styles.filterButtonText, searchScope === 'glossario' && styles.activeFilterButtonText]}>Glossário</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => `${item.type}-${item.nome || item.termo}-${index}`}
        renderItem={renderItem}
      />
    </View>
  );
}

export default Pesquisa;
