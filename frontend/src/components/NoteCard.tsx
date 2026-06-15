import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card, Chip, IconButton } from 'react-native-paper';
import RenderHTML from 'react-native-render-html';
import { Note } from '../notesTypes';
import { useTheme } from '../ThemeContext';
import { normalize } from '../utils/normalize';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
  onPin: () => void;
}

export const NoteCard = ({ note, onPress, onDelete, onPin }: NoteCardProps) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: { 
      margin: normalize(8),
      backgroundColor: colors.card, 
    },
    pinnedCard: {
      backgroundColor: colors.primary + '20', // a light shade of primary
      borderColor: colors.primary,
      borderWidth: 1,
    },
    content: { flexDirection: 'row', alignItems: 'flex-start' },
    textContainer: { flex: 1 },
    title: { 
      fontSize: normalize(18),
      fontWeight: 'bold',
      color: colors.text,
    },
    preview: { 
      marginTop: normalize(5),
      color: colors.textSecondary,
    },
    tagContainer: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      marginTop: normalize(10) 
    },
    chip: { 
      marginRight: 5, 
      marginBottom: 5, 
      backgroundColor: colors.primary + '30',
    },
    actionsContainer: { 
      flexDirection: 'column', 
      justifyContent: 'space-between',
      alignItems: 'center'
    },
  });

  // Strip HTML for preview and limit length
  const plainContent = note.content.replace(/<[^>]+>/g, '');
  const previewContent = plainContent.substring(0, 100) + (plainContent.length > 100 ? '...' : '');

  return (
    <Card style={[styles.card, note.isPinned && styles.pinnedCard]} onPress={onPress}>
      <Card.Content>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.preview}>{previewContent}</Text>
            {note.tags.length > 0 && (
              <View style={styles.tagContainer}>
                {note.tags.map(tag => (
                  <Chip key={tag} style={styles.chip}>{tag}</Chip>
                ))}
              </View>
            )}
          </View>
          <View style={styles.actionsContainer}>
            <IconButton
              icon={note.isPinned ? 'pin' : 'pin-outline'}
              size={24}
              onPress={onPin}
              iconColor={colors.primary}
            />
            <IconButton
              icon="delete-outline"
              size={24}
              onPress={onDelete}
              iconColor={colors.error}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
