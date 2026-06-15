import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../notesTypes';

const NOTES_STORAGE_KEY = 'notes_storage';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }
      } catch (error) {
        console.error("Failed to load notes.", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const saveNotes = async (newNotes: Note[]) => {
    try {
      const sortedNotes = newNotes.sort((a, b) => b.updatedAt - a.updatedAt);
      setNotes(sortedNotes);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(sortedNotes));
    } catch (error) {
      console.error("Failed to save notes.", error);
    }
  };

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newNote: Note = {
      id: now.toString(),
      ...note,
      createdAt: now,
      updatedAt: now,
    };
    await saveNotes([newNote, ...notes]);
    return newNote;
  }, [notes]);

  const updateNote = useCallback(async (noteId: string, updatedFields: Partial<Note>) => {
    const now = Date.now();
    const newNotes = notes.map(note => 
      note.id === noteId ? { ...note, ...updatedFields, updatedAt: now } : note
    );
    await saveNotes(newNotes);
  }, [notes]);

  const deleteNote = useCallback(async (noteId: string) => {
    const newNotes = notes.filter(note => note.id !== noteId);
    await saveNotes(newNotes);
  }, [notes]);

  return { notes, loading, addNote, updateNote, deleteNote };
};
