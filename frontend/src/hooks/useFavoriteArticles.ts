import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITE_ARTICLES_STORAGE_KEY = 'favorite_articles_storage';

export const useFavoriteArticles = () => {
  const [favoriteArticles, setFavoriteArticles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavoriteArticles = async () => {
      try {
        const storedFavoriteArticles = await AsyncStorage.getItem(FAVORITE_ARTICLES_STORAGE_KEY);
        if (storedFavoriteArticles) {
          setFavoriteArticles(JSON.parse(storedFavoriteArticles));
        }
      } catch (error) {
        console.error("Failed to load favorite articles.", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteArticles();
  }, []);

  const saveFavoriteArticles = async (newFavoriteArticles: string[]) => {
    try {
      setFavoriteArticles(newFavoriteArticles);
      await AsyncStorage.setItem(FAVORITE_ARTICLES_STORAGE_KEY, JSON.stringify(newFavoriteArticles));
    } catch (error) {
      console.error("Failed to save favorite articles.", error);
    }
  };

  const addFavoriteArticle = useCallback(async (articleName: string) => {
    if (favoriteArticles.includes(articleName)) {
      return;
    }
    await saveFavoriteArticles([articleName, ...favoriteArticles]);
  }, [favoriteArticles]);

  const removeFavoriteArticle = useCallback(async (articleName: string) => {
    const newFavoriteArticles = favoriteArticles.filter(name => name !== articleName);
    await saveFavoriteArticles(newFavoriteArticles);
  }, [favoriteArticles]);

  const isFavoriteArticle = (articleName: string) => {
    return favoriteArticles.includes(articleName);
  };

  return { favoriteArticles, loading, addFavoriteArticle, removeFavoriteArticle, isFavoriteArticle };
};
