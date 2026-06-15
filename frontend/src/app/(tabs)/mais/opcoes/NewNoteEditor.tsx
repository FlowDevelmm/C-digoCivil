import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Appbar, TextInput, Button, Chip } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

import { useTheme } from '../../../../ThemeContext';
import { useNotes } from '../../../../hooks/useNotes';
import { normalize } from '../../../../utils/normalize';

export default function NewNoteEditor() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { notes, addNote, updateNote } = useNotes();

  const richText = useRef<RichEditor>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const noteId = params.noteId as string | undefined;

  useEffect(() => {
    if (noteId) {
      const noteToEdit = notes.find(n => n.id === noteId);
      if (noteToEdit) {
        setTitle(noteToEdit.title);
        setContent(noteToEdit.content);
        setTags(noteToEdit.tags);
      }
    }
  }, [noteId, notes]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Título em falta', 'Por favor, adicione um título à sua anotação.');
      return;
    }
    const noteData = {
      title,
      content,
      tags,
      isPinned: notes.find(n => n.id === noteId)?.isPinned || false,
    };

    if (noteId) {
      await updateNote(noteId, noteData);
    } else {
      await addNote(noteData);
    }
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onInsertLink = () => {
    richText.current?.insertLink('Escreva o texto aqui', 'https://');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    appbar: {
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingHorizontal: normalize(16),
      paddingTop: normalize(16),
    },
    titleInput: {
      marginBottom: normalize(16),
      backgroundColor: 'transparent',
    },
    tagInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: normalize(12),
    },
    tagInput: {
      flex: 1,
      marginRight: normalize(8),
      backgroundColor: 'transparent',
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: normalize(16),
    },
    chip: {
      marginRight: normalize(8),
      marginBottom: normalize(8),
      backgroundColor: colors.card, // Softer color
    },
    editorContainer: {
      flex: 1,
    },
    richEditor: {
      flex: 1,
      minHeight: 300,
      backgroundColor: colors.background,
    },
    toolbar: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon="close" onPress={handleCancel} color={colors.text} />
        <Appbar.Content title={noteId ? 'Editar Anotação' : 'Nova Anotação'} titleStyle={{ color: colors.text }} />
        <Button mode="contained" onPress={handleSave} theme={{ colors: { primary: colors.primary } }}>
          Salvar
        </Button>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TextInput
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          theme={{ colors: { text: colors.text, primary: colors.primary } }}
        />

        <View style={styles.tagInputContainer}>
          <TextInput
            placeholder="Adicionar tag"
            value={currentTag}
            onChangeText={setCurrentTag}
            style={styles.tagInput}
            mode="flat"
            onSubmitEditing={addTag}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            theme={{ colors: { text: colors.text, primary: colors.primary } }}
          />
          <Button mode="outlined" onPress={addTag} textColor={colors.primary} borderColor={colors.primary}>
            Adicionar
          </Button>
        </View>

        <View style={styles.tagContainer}>
          {tags.map(tag => (
            <Chip key={tag} icon="close" onPress={() => removeTag(tag)} style={styles.chip} textStyle={{ color: colors.textSecondary }}>
              {tag}
            </Chip>
          ))}
        </View>
        
        <View style={styles.editorContainer}>
            <RichEditor
                ref={richText}
                style={styles.richEditor}
                initialContentHTML={content}
                onChange={descriptionText => setContent(descriptionText)}
                placeholder="Comece a escrever aqui..."
                editorStyle={{
                    backgroundColor: colors.background,
                    color: colors.text,
                }}
            />
        </View>
      </ScrollView>

      <RichToolbar
        editor={richText}
        actions={[
          actions.undo,
          actions.redo,
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.setSubscript,
          actions.setSuperscript,
          actions.heading1,
          actions.heading2,
          actions.heading3,
          actions.heading4,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.indent,
          actions.outdent,
          actions.insertImage,
          actions.insertLink,
          actions.insertHorizontalRule,
          actions.removeFormat,
        ]}
        onPressAddLink={onInsertLink}
        style={styles.toolbar}
        iconTint={colors.text}
        selectedIconTint={colors.primary}
      />
    </KeyboardAvoidingView>
  );
}
