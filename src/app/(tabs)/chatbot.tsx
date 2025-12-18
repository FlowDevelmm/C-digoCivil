import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  useWindowDimensions,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchChatbotResponse } from '../../service/api';

const QUICK_QUERIES = [
  "O que é o Código Civil?",
  "Direitos do consumidor",
  "Prazos de prescrição",
  "Contratos de aluguel"
];

const STORAGE_KEY = '@chatbot_history';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string; // ISO string for storage
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  date: string;
}

export default function ChatbotScreen() {
  const { width } = useWindowDimensions();
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isTablet = width > 768;

  // Carregar histórico ao iniciar
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const saveToHistory = async (updatedMessages: Message[]) => {
    if (updatedMessages.length === 0) return;

    try {
      let currentHistory = [...history];
      // Se já temos uma conversa ativa (baseada no primeiro ID da mensagem), atualizamos ela
      const sessionId = updatedMessages[0].id;
      const sessionIndex = currentHistory.findIndex(s => s.id === sessionId);

      const session: ChatSession = {
        id: sessionId,
        title: updatedMessages[0].text.substring(0, 30) + '...',
        messages: updatedMessages,
        date: new Date().toISOString(),
      };

      if (sessionIndex >= 0) {
        currentHistory[sessionIndex] = session;
      } else {
        currentHistory.unshift(session);
      }

      // Limitar histórico a 20 itens
      if (currentHistory.length > 20) currentHistory = currentHistory.slice(0, 20);

      setHistory(currentHistory);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setIsHistoryVisible(false);
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setIsHistoryVisible(false);
  };

  const deleteHistory = async () => {
    Alert.alert(
      "Limpar Histórico",
      "Tem certeza que deseja apagar todas as conversas salvas?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Limpar", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setHistory([]);
            startNewChat();
          } 
        }
      ]
    );
  };

  const sendMessage = async (text: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() || loading) return;

    const userMessage: Message = {
      id: messages.length === 0 ? Date.now().toString() : messages[0].id + Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const data = await fetchChatbotResponse(userMessage.text);

      const botMessage: Message = {
        id: Date.now().toString() + '-bot',
        text: data.response || 'Não consegui entender sua pergunta. Pode reformular? 😕',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      saveToHistory(finalMessages);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: 'Ops! Tive um problema de conexão. Tente novamente em instantes. 🚫',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const msgDate = new Date(item.timestamp);

    return (
      <View 
        style={[
          styles.messageWrapper,
          isUser ? styles.userWrapper : styles.botWrapper,
          { maxWidth: isTablet ? '70%' : '85%' }
        ]}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.botText
          ]}>
            {item.text}
          </Text>
        </View>
        <Text style={styles.timestampText}>
          {msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const HistoryModal = () => (
    <Modal
      visible={isHistoryVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsHistoryVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { width: isTablet ? '50%' : '90%', height: '70%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Histórico de Conversas</Text>
            <TouchableOpacity onPress={() => setIsHistoryVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.newChatButton} onPress={startNewChat}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.newChatText}>Nova Conversa</Text>
          </TouchableOpacity>

          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.historyItem} onPress={() => loadSession(item)}>
                <Ionicons name="chatbubble-outline" size={20} color="#666" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyItemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.historyItemDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyHistoryText}>Nenhum histórico encontrado.</Text>
            }
          />

          {history.length > 0 && (
            <TouchableOpacity style={styles.clearHistoryButton} onPress={deleteHistory}>
              <Text style={styles.clearHistoryText}>Limpar Tudo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <HistoryModal />
      
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: isTablet ? 40 : 20 }]}>
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name="ribbon" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Assistente Civil</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Online agora</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.headerAction} 
          onPress={() => setIsHistoryVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderMessage}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={styles.emptyContainer}>
                <View style={styles.botIconContainer}>
                  <Ionicons name="chatbubble-ellipses" size={isTablet ? 80 : 60} color="#2f95dc" />
                </View>
                <Text style={styles.emptyTitle}>Olá! Como posso ajudar?</Text>
                <Text style={[styles.emptySubtitle, { paddingHorizontal: isTablet ? 100 : 0 }]}>
                  Sou seu assistente jurídico especializado no Código Civil. 
                  Escolha uma dúvida abaixo ou digite sua pergunta.
                </Text>
                <View style={[styles.quickQueriesContainer, { width: isTablet ? '60%' : '100%' }]}>
                  {QUICK_QUERIES.map((query, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.quickQueryButton}
                      onPress={() => sendMessage(query)}
                    >
                      <Text style={styles.quickQueryText}>{query}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          }
          contentContainerStyle={[
            styles.chatContainer,
            messages.length === 0 && { flexGrow: 1 },
            { paddingHorizontal: isTablet ? '15%' : 16 }
          ]}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {loading && (
          <View style={[styles.typingIndicator, { paddingHorizontal: isTablet ? '15%' : 20 }]}>
            <ActivityIndicator size="small" color="#2f95dc" />
            <Text style={styles.typingText}>Analisando legislação...</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingHorizontal: isTablet ? '15%' : 16 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Pergunte sobre leis, direitos..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled
              ]} 
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color="#fff" 
                style={{ marginLeft: 3 }} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2f95dc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  headerAction: {
    padding: 8,
  },
  chatContainer: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginVertical: 8,
  },
  userWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  botWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    backgroundColor: '#2f95dc',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#1A1A1A',
  },
  timestampText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F0F2F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2f95dc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  botIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  quickQueriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  quickQueryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickQueryText: {
    fontSize: 14,
    color: '#2f95dc',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyItemTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  historyItemDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
  newChatButton: {
    flexDirection: 'row',
    backgroundColor: '#2f95dc',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  newChatText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  clearHistoryButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  clearHistoryText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});