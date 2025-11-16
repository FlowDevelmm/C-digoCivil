import React, { useState, useRef } from "react";
import { View, TextInput, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { perguntarChatbot } from "../../services/api";
import { useTheme } from "../../ThemeContext";
import * as Clipboard from 'expo-clipboard';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export default function ChatbotScreen() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial', text: 'Olá! Como posso ajudar hoje?', sender: 'bot', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { colors } = useTheme();
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = async () => {
        if (inputText.trim().length === 0) return;

        const userMessage: Message = { id: Date.now().toString(), text: inputText, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setLoading(true);

        try {
            const data = await perguntarChatbot(inputText);
            const botMessage: Message = { id: (Date.now() + 1).toString(), text: data.resposta, sender: 'bot', timestamp: new Date() };
            setMessages(prev => [...prev, botMessage]);
        } catch (error: any) {
            console.error("Error fetching chatbot response:", error);
            const errorMessage: Message = { id: (Date.now() + 1).toString(), text: error.message || "Desculpe, ocorreu um erro.", sender: 'bot', timestamp: new Date() };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        Clipboard.setStringAsync(text);
        Alert.alert("Copiado", "A mensagem foi copiada para a área de transferência.");
    };

    const confirmClearChat = () => {
        Alert.alert(
            "Limpar Conversa",
            "Tem a certeza que quer apagar todas as mensagens?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Apagar", onPress: clearChat, style: "destructive" },
            ]
        );
    };

    const clearChat = () => {
        setMessages([
            { id: 'initial', text: 'Olá! Como posso ajudar hoje?', sender: 'bot', timestamp: new Date() }
        ]);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors?.background }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={100} // Adjust this value based on your header and tab bar height
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors?.text }]}>Chatbot</Text>
                        <TouchableOpacity onPress={confirmClearChat}>
                            <Feather name="trash-2" size={24} color={colors?.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        style={styles.chatContainer} // This has flex: 1
                        contentContainerStyle={{ paddingBottom: 10 }} // Add some padding to the bottom
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        renderItem={({ item }) => (
                            <TouchableOpacity onLongPress={() => item.sender === 'bot' && copyToClipboard(item.text)}>
                                <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble, { backgroundColor: item.sender === 'user' ? colors?.primary : colors?.card }]}>
                                    <Text style={[styles.messageText, { color: item.sender === 'user' ? '#fff' : colors?.text }]}>{item.text}</Text>
                                    <Text style={[styles.timestamp, { color: item.sender === 'user' ? '#ffffff99' : colors?.textSecondary }]}>
                                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                    {loading && <ActivityIndicator size="large" color={colors?.primary} style={{ marginVertical: 10 }}/>}
                    <View style={[styles.inputContainer, { backgroundColor: colors?.card, borderColor: colors?.border, borderWidth: 1 }]}>
                        <TextInput
                            placeholder="Digite sua pergunta..."
                            value={inputText}
                            onChangeText={setInputText}
                            style={[styles.input, { color: colors?.text, minHeight: 40 }]}
                            placeholderTextColor={colors?.textSecondary}
                        />
                        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                            <Feather name="send" size={24} color={colors?.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginTop: 20, // Moved down
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    chatContainer: {
        flex: 1,
    },
    messageBubble: {
        borderRadius: 20,
        padding: 12,
        paddingBottom: 5,
        marginBottom: 10,
        maxWidth: '80%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 5,
    },
    botBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 11,
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 25,
        marginVertical: 10,
    },
    input: {
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    sendButton: {
        padding: 5,
    },
});
