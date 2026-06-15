import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Appbar, FAB, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../ThemeContext';
import { useNotes } from '../../../../hooks/useNotes';
import { NoteCard } from '../../../../components/NoteCard';
import { normalize } from '../../../../utils/normalize';

export default function AnotacoesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { notes, deleteNote, updateNote, loading } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    const sortedNotes = [...notes].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return b.updatedAt - a.updatedAt;
    });

    if (!searchQuery) {
      return sortedNotes;
    }

    const query = searchQuery.toLowerCase();
    return sortedNotes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(query);
      const contentMatch = note.content.toLowerCase().includes(query);
      const tagMatch = note.tags.some(tag => tag.toLowerCase().includes(query));
      return titleMatch || contentMatch || tagMatch;
    });
  }, [notes, searchQuery]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.background },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 80,
      backgroundColor: colors.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: normalize(18),
        color: colors.textSecondary,
    }
  });

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{loading ? 'A carregar anotações...' : 'Nenhuma anotação encontrada.'}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Anotações" />
      </Appbar.Header>
      <Searchbar
        placeholder="Pesquisar anotações..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ margin: normalize(8) }}
      />
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => router.push({ pathname: '/(tabs)/mais/opcoes/NewNoteEditor', params: { noteId: item.id } })}
            onDelete={() => deleteNote(item.id)}
            onPin={() => updateNote(item.id, { isPinned: !item.isPinned })}
          />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={renderEmptyList}
      />
      <FAB
        icon={({ size, color }) => <Feather name="plus" size={size} color={color} />}
        style={styles.fab}
        onPress={() => router.push('/(tabs)/mais/opcoes/NewNoteEditor')}
        color={colors.card}
      />
    </View>
  );
}
