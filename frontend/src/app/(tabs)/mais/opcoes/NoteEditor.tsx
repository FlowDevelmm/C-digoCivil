import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Share } from 'react-native';
import { Appbar, TextInput, Button, Chip, Modal, Portal, PaperProvider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';

import { useTheme } from '../../../../ThemeContext';
import { useNotes } from '../../../../hooks/useNotes';
import { normalize } from '../../../../utils/normalize';

export default function NoteEditorScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { notes, addNote, updateNote } = useNotes();

  const richText = useRef<RichEditor>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);

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

  const handleShareText = async () => {
    setShareModalVisible(false);
    try {
      const plainContent = content.replace(/<[^>]+>/g, '\n').trim();
      await Share.share({
        title: title,
        message: `${title}\n\n${plainContent}`,
      });
    } catch (error) {
      alert('Ocorreu um erro ao compartilhar a nota.');
    }
  };

  // const handleSharePdf = async () => {
  //   setShareModalVisible(false);
  //   try {
  //       const html = `<h1>${title}</h1><div>${content}</div>`;
  //       const options = {
  //           html: html,
  //           fileName: `${title.replace(/\s/g, '_')}`,
  //           directory: 'Documents',
  //       };

  //       const file = await RNHTMLtoPDF.convert(options);
  //       const url = Platform.OS === 'ios' ? file.filePath : `file://${file.filePath}`;

  //       await Share.share({
  //           title: title,
  //           url: url,
  //       });
  //   } catch (error) {
  //       alert('Ocorreu um erro ao exportar para PDF.');
  //   }
  // };

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.background },
    scrollContainer: { padding: normalize(16) },
    input: { marginBottom: normalize(16) },
    richEditor: { flex: 1, minHeight: 200 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: normalize(10) },
    chip: { marginRight: 5, marginBottom: 5 },
    tagInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: normalize(20) },
    modalContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
    modalButton: { marginTop: 10 },
  });

  return (
    <PaperProvider>
      <Portal>
        <Modal visible={shareModalVisible} onDismiss={() => setShareModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Button onPress={handleShareText} style={styles.modalButton}>Compartilhar como Texto</Button>
            {/* <Button onPress={handleSharePdf} style={styles.modalButton}>Exportar como PDF</Button> */}
        </Modal>
      </Portal>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={noteId ? 'Editar Anotação' : 'Nova Anotação'} />
          {noteId && <Appbar.Action icon="share-variant" onPress={() => setShareModalVisible(true)} />}
          <Button onPress={handleSave}>Salvar</Button>
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TextInput
            label="Título"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
          />
          <View style={styles.tagInputContainer}>
              <TextInput
                  label="Tag"
                  value={currentTag}
                  onChangeText={setCurrentTag}
                  style={{ flex: 1, marginRight: 10 }}
                  mode="outlined"
              />
              <Button onPress={addTag} mode="contained">Adicionar</Button>
          </View>
          <View style={styles.tagContainer}>
              {tags.map(tag => (
                  <Chip key={tag} icon="close" onPress={() => removeTag(tag)} style={styles.chip}>
                  {tag}
                  </Chip>
              ))}
          </View>
          <RichToolbar
            editor={richText}
            actions={[ actions.setBold, actions.setItalic, actions.setUnderline, actions.insertBulletsList, actions.insertOrderedList, actions.heading1, actions.heading2 ]}
          />
          <RichEditor
            ref={richText}
            style={styles.richEditor}
            initialContentHTML={content}
            onChange={descriptionText => setContent(descriptionText)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}
