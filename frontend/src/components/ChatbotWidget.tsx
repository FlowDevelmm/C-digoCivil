import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { normalize } from '../utils/normalize';
import { fetchChatbotResponse } from '../services/api';
import { findArtigoByNumero, ArtigoLocation } from '../utils/artigoLookup';

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  time: string;
  error?: boolean;
}

const SUGGESTIONS = [
  'O que é a personalidade jurídica?',
  'Quais os requisitos do casamento?',
  'Como funciona a herança legítima?',
  'O que diz o Artigo 1577?',
];

const now = () =>
  new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

const welcomeMessage = (): Message => ({
  id: 'welcome',
  role: 'assistant',
  time: now(),
  content:
    'Olá! Sou o assistente do Código Civil de Moçambique. Pergunte-me, em linguagem simples, sobre qualquer matéria deste diploma legal.',
});

let idCounter = 0;
const nextId = () => `m${idCounter++}`;

/* ------------------------------------------------------------------ */
/* Indicador animado "a escrever..." (três pontos)                     */
/* ------------------------------------------------------------------ */
const TypingDots: React.FC<{ color: string }> = ({ color }) => {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -4, duration: 300, easing: Easing.ease, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, easing: Easing.ease, useNativeDriver: true }),
          Animated.delay((dots.length - i) * 150),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: normalize(4) }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: normalize(7),
            height: normalize(7),
            borderRadius: normalize(4),
            backgroundColor: color,
            marginHorizontal: normalize(2),
            transform: [{ translateY: dot }],
          }}
        />
      ))}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Texto com citações de artigos clicáveis                             */
/* ------------------------------------------------------------------ */
// Detecta referências do tipo "Artigo 1577", "Art.º 1577º", "Art. 1577".
const ARTICLE_RE = /\b(art(?:igo)?s?[.\sº]*?(\d+)\s*º?)/gi;

const InlineText: React.FC<{
  line: string;
  color: string;
  linkColor: string;
  fontSize: number;
  onPressArtigo: (numero: string) => void;
}> = ({ line, color, linkColor, fontSize, onPressArtigo }) => {
  const parts: { text: string; numero?: string }[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  ARTICLE_RE.lastIndex = 0;
  while ((m = ARTICLE_RE.exec(line)) !== null) {
    const full = m[1];
    const numero = m[2];
    if (m.index > last) parts.push({ text: line.slice(last, m.index) });
    // Só vira link se o artigo existir no Código Civil.
    parts.push({ text: full, numero: findArtigoByNumero(numero) ? numero : undefined });
    last = m.index + full.length;
  }
  if (last < line.length) parts.push({ text: line.slice(last) });

  return (
    <Text style={{ color, fontSize, lineHeight: fontSize * 1.45 }}>
      {parts.map((p, i) =>
        p.numero ? (
          <Text
            key={i}
            onPress={() => onPressArtigo(p.numero!)}
            style={{ color: linkColor, fontFamily: 'SF-Pro-Display-Bold', textDecorationLine: 'underline' }}
          >
            {p.text}
          </Text>
        ) : (
          <Text key={i}>{p.text}</Text>
        )
      )}
    </Text>
  );
};

/* ------------------------------------------------------------------ */
/* Renderizador leve de Markdown (sem dependências extra)              */
/* ------------------------------------------------------------------ */
const MarkdownText: React.FC<{
  text: string;
  color: string;
  linkColor: string;
  onPressArtigo: (numero: string) => void;
}> = ({ text, color, linkColor, onPressArtigo }) => {
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((raw, index) => {
        const line = raw.trimEnd();
        if (line.trim() === '') return <View key={index} style={{ height: normalize(6) }} />;

        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
          return (
            <Text key={index} style={{ color, fontFamily: 'SF-Pro-Display-Bold', fontSize: normalize(15), marginTop: normalize(4), marginBottom: normalize(2) }}>
              {heading[2]}
            </Text>
          );
        }

        const listItem = line.match(/^\s*[-•]\s+(.*)$/);
        if (listItem) {
          return (
            <View key={index} style={{ flexDirection: 'row', paddingLeft: normalize(2) }}>
              <Text style={{ color, fontSize: normalize(14) }}>{'•  '}</Text>
              <View style={{ flex: 1 }}>
                <InlineText line={listItem[1]} color={color} linkColor={linkColor} fontSize={normalize(14)} onPressArtigo={onPressArtigo} />
              </View>
            </View>
          );
        }

        return (
          <InlineText key={index} line={line} color={color} linkColor={linkColor} fontSize={normalize(14)} onPressArtigo={onPressArtigo} />
        );
      })}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Avatar do assistente                                                */
/* ------------------------------------------------------------------ */
const BotAvatar: React.FC<{ colors: any; size?: number }> = ({ colors, size = 30 }) => (
  <View
    style={{
      width: normalize(size),
      height: normalize(size),
      borderRadius: normalize(size / 2),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <MaterialCommunityIcons name="scale-balance" size={normalize(size * 0.55)} color="#fff" />
  </View>
);

export default function ChatbotWidget() {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [artigoModal, setArtigoModal] = useState<ArtigoLocation | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  const openArtigo = useCallback((numero: string) => {
    const loc = findArtigoByNumero(numero);
    if (loc) setArtigoModal(loc);
  }, []);

  // Animação de entrada do FAB.
  const fabScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }).start();
  }, []);

  const styles = getStyles(colors);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const resetConversation = useCallback(() => {
    setMessages([welcomeMessage()]);
    setInput('');
  }, []);

  const submit = useCallback(
    async (text: string) => {
      const query = text.trim();
      if (!query || loading) return;

      const userMsg: Message = { id: nextId(), role: 'user', content: query, time: now() };
      const history = messages
        .filter((m) => m.id !== 'welcome' && !m.error)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);
      scrollToEnd();

      try {
        const data = await fetchChatbotResponse(query, history);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', time: now(), content: data?.response?.trim() || 'Não foi possível obter uma resposta.' },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', error: true, time: now(), content: 'Não foi possível ligar ao serviço do assistente. Verifique a sua ligação e tente novamente.' },
        ]);
      } finally {
        setLoading(false);
        scrollToEnd();
      }
    },
    [loading, messages, scrollToEnd]
  );

  const showSuggestions = messages.length === 1 && !loading;

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
        {!isUser && (
          <View style={{ marginRight: normalize(8) }}>
            <BotAvatar colors={colors} size={28} />
          </View>
        )}
        <View style={{ maxWidth: '80%' }}>
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot, item.error && styles.bubbleError]}>
            {isUser ? (
              <Text style={styles.userText}>{item.content}</Text>
            ) : (
              <MarkdownText
                text={item.content}
                color={item.error ? colors.danger : colors.text}
                linkColor={colors.primary}
                onPressArtigo={openArtigo}
              />
            )}
          </View>
          <Text style={[styles.time, isUser ? { textAlign: 'right' } : { textAlign: 'left', marginLeft: normalize(4) }]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Botão flutuante */}
      <Animated.View style={[styles.fabWrap, { transform: [{ scale: fabScale }] }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setOpen(true)} accessibilityLabel="Abrir assistente do Código Civil">
          <MaterialCommunityIcons name="chat-question" size={normalize(26)} color="#fff" />
          <View style={styles.fabBadge} />
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              {/* Pega do sheet */}
              <View style={styles.grabber} />

              {/* Cabeçalho */}
              <View style={styles.headerRow}>
                <BotAvatar colors={colors} size={38} />
                <View style={{ marginLeft: normalize(10), flex: 1 }}>
                  <Text style={styles.headerTitle}>Assistente Jurídico</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.headerSubtitle}>Código Civil de Moçambique</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={resetConversation} style={styles.headerBtn} accessibilityLabel="Nova conversa">
                  <MaterialCommunityIcons name="refresh" size={normalize(20)} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOpen(false)} style={styles.headerBtn} accessibilityLabel="Fechar">
                  <MaterialCommunityIcons name="close" size={normalize(22)} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Conversa */}
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                renderItem={renderItem}
                contentContainerStyle={styles.messages}
                onContentSizeChange={scrollToEnd}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                  loading ? (
                    <View style={[styles.row, styles.rowBot]}>
                      <View style={{ marginRight: normalize(8) }}>
                        <BotAvatar colors={colors} size={28} />
                      </View>
                      <View style={[styles.bubble, styles.bubbleBot]}>
                        <TypingDots color={colors.textSecondary} />
                      </View>
                    </View>
                  ) : null
                }
              />

              {/* Sugestões de perguntas */}
              {showSuggestions && (
                <View style={styles.suggestionsWrap}>
                  <Text style={styles.suggestionsTitle}>Experimente perguntar</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: normalize(12) }}>
                    {SUGGESTIONS.map((s) => (
                      <TouchableOpacity key={s} style={styles.chip} onPress={() => submit(s)} activeOpacity={0.7}>
                        <Text style={styles.chipText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Entrada */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Escreva a sua pergunta..."
                  placeholderTextColor={colors.textSecondary}
                  value={input}
                  onChangeText={setInput}
                  multiline
                  editable={!loading}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                  onPress={() => submit(input)}
                  disabled={!input.trim() || loading}
                  accessibilityLabel="Enviar pergunta"
                >
                  <MaterialCommunityIcons name="send" size={normalize(20)} color="#fff" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal do artigo (hierarquia + texto completo) */}
      <Modal
        visible={!!artigoModal}
        animationType="fade"
        transparent
        onRequestClose={() => setArtigoModal(null)}
      >
        <Pressable style={styles.artBackdrop} onPress={() => setArtigoModal(null)}>
          <Pressable style={styles.artCard} onPress={() => {}}>
            {artigoModal && (
              <>
                <View style={styles.artHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.artBadge}>CÓDIGO CIVIL</Text>
                    <Text style={styles.artTitle}>{artigoModal.artigo.nome}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setArtigoModal(null)} style={styles.headerBtn} accessibilityLabel="Fechar artigo">
                    <MaterialCommunityIcons name="close" size={normalize(22)} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Hierarquia: Livro › Título › Capítulo › Secção › Subsecção */}
                <View style={styles.breadcrumb}>
                  {[artigoModal.livro, artigoModal.titulo, artigoModal.capitulo, artigoModal.secao, artigoModal.subsecao]
                    .filter(Boolean)
                    .map((part, i, arr) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.crumbText}>{part}</Text>
                        {i < arr.length - 1 && (
                          <MaterialCommunityIcons name="chevron-right" size={normalize(14)} color={colors.textSecondary} style={{ marginHorizontal: normalize(2) }} />
                        )}
                      </View>
                    ))}
                </View>

                <ScrollView style={{ maxHeight: normalize(320) }} contentContainerStyle={{ paddingBottom: normalize(8) }} showsVerticalScrollIndicator={false}>
                  <Text style={styles.artBody}>{artigoModal.artigo.texto}</Text>
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    fabWrap: {
      position: 'absolute',
      right: normalize(16),
      bottom: normalize(90),
      zIndex: 999,
    },
    fab: {
      width: normalize(58),
      height: normalize(58),
      borderRadius: normalize(29),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: colors.primary,
      shadowOpacity: 0.4,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
    },
    fabBadge: {
      position: 'absolute',
      top: normalize(12),
      right: normalize(13),
      width: normalize(10),
      height: normalize(10),
      borderRadius: normalize(5),
      backgroundColor: '#2ecc71',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      height: '88%',
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
    },
    grabber: {
      alignSelf: 'center',
      width: normalize(40),
      height: normalize(4),
      borderRadius: 2,
      backgroundColor: colors.border,
      marginTop: normalize(8),
      marginBottom: normalize(4),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalize(16),
      paddingVertical: normalize(10),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontFamily: 'SF-Pro-Display-Bold',
      fontSize: normalize(16),
      color: colors.text,
    },
    headerSubtitle: {
      fontFamily: 'SF-Pro-Display-Regular',
      fontSize: normalize(12),
      color: colors.textSecondary,
    },
    onlineDot: {
      width: normalize(7),
      height: normalize(7),
      borderRadius: normalize(4),
      backgroundColor: '#2ecc71',
      marginRight: normalize(5),
    },
    headerBtn: {
      padding: normalize(6),
      marginLeft: normalize(2),
    },
    messages: {
      paddingHorizontal: normalize(12),
      paddingTop: normalize(10),
      paddingBottom: normalize(6),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginVertical: normalize(5),
    },
    rowBot: { justifyContent: 'flex-start' },
    rowUser: { justifyContent: 'flex-end' },
    bubble: {
      borderRadius: 18,
      paddingHorizontal: normalize(13),
      paddingVertical: normalize(9),
    },
    bubbleUser: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 5,
    },
    bubbleBot: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 5,
    },
    bubbleError: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    userText: {
      color: '#fff',
      fontSize: normalize(14),
      lineHeight: normalize(14) * 1.45,
    },
    time: {
      fontSize: normalize(10),
      color: colors.textSecondary,
      marginTop: normalize(3),
    },
    suggestionsWrap: {
      paddingLeft: normalize(12),
      paddingBottom: normalize(8),
    },
    suggestionsTitle: {
      fontSize: normalize(12),
      color: colors.textSecondary,
      marginBottom: normalize(8),
      fontFamily: 'SF-Pro-Display-Medium',
    },
    chip: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingHorizontal: normalize(14),
      paddingVertical: normalize(9),
      marginRight: normalize(8),
    },
    chipText: {
      color: colors.primary,
      fontSize: normalize(13),
      fontFamily: 'SF-Pro-Display-Medium',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: normalize(12),
      paddingVertical: normalize(10),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      maxHeight: normalize(110),
      minHeight: normalize(44),
      backgroundColor: colors.card,
      borderRadius: 22,
      paddingHorizontal: normalize(16),
      paddingTop: Platform.OS === 'ios' ? normalize(12) : normalize(8),
      paddingBottom: Platform.OS === 'ios' ? normalize(12) : normalize(8),
      color: colors.text,
      fontSize: normalize(14),
    },
    sendBtn: {
      marginLeft: normalize(8),
      width: normalize(44),
      height: normalize(44),
      borderRadius: normalize(22),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: {
      opacity: 0.45,
    },
    /* Modal do artigo */
    artBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      paddingHorizontal: normalize(18),
    },
    artCard: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: normalize(18),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      elevation: 10,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 14,
    },
    artHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    artBadge: {
      fontFamily: 'SF-Pro-Display-Bold',
      fontSize: normalize(10),
      letterSpacing: 1,
      color: colors.primary,
      marginBottom: normalize(3),
    },
    artTitle: {
      fontFamily: 'SF-Pro-Display-Bold',
      fontSize: normalize(17),
      color: colors.text,
    },
    breadcrumb: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: normalize(10),
      paddingVertical: normalize(8),
      marginTop: normalize(10),
      marginBottom: normalize(12),
    },
    crumbText: {
      fontFamily: 'SF-Pro-Display-Medium',
      fontSize: normalize(11),
      color: colors.textSecondary,
    },
    artBody: {
      color: colors.text,
      fontSize: normalize(14),
      lineHeight: normalize(14) * 1.6,
      fontFamily: 'SF-Pro-Display-Regular',
    },
  });
