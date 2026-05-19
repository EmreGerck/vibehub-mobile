import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMessages, useSendMessage } from '../../../src/hooks/useForum';
import { useAuthStore } from '../../../src/store/authStore';

export default function DMConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data, isLoading } = useMessages(id);
  const sendMessage = useSendMessage();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const messages = data?.pages.flatMap((p: any) => p.data) ?? [];

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage.mutate({ recipientId: id, body: trimmed });
    setText('');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Direct Message', headerBackTitle: 'Back' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <Text style={styles.loading}>Loading…</Text>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m: any) => m.id}
            inverted
            renderItem={({ item }: { item: any }) => {
              const mine = item.senderId === user?.id;
              return (
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text style={[styles.bubbleText, mine && styles.mineText]}>{item.content}</Text>
                </View>
              );
            }}
            contentContainerStyle={styles.list}
          />
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            placeholderTextColor="#9CA3AF"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  loading: { flex: 1, textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
  list: { padding: 16, flexDirection: 'column-reverse' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#1F1F1F',
    alignSelf: 'flex-start',
  },
  mine: { alignSelf: 'flex-end', backgroundColor: '#7C3AED' },
  bubbleText: { color: '#E5E7EB', fontSize: 14 },
  mineText: { color: '#FFFFFF' },
  theirs: {},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
    backgroundColor: '#0F0F0F',
  },
  input: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 120,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
