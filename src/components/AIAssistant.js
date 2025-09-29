import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  ActivityIndicator
} from 'react-native';
import { IconButton, Surface } from 'react-native-paper';
import * as Speech from 'expo-speech';
import { processCommand, speakResponse } from '../services/aiAssistant';
import { theme } from '../theme/theme';

/**
 * AI Assistant Component
 * @param {Object} props - Component props
 * @param {Function} props.onAddToCart - Callback for adding products to cart
 * @param {Function} props.onShowInventory - Callback for showing inventory
 * @param {Function} props.onOpenFloat - Callback for opening cash float
 * @param {Function} props.onCloseFloat - Callback for closing cash float
 * @param {boolean} props.cloudEnabled - Whether cloud AI is enabled
 * @param {boolean} props.minimized - Whether the assistant is minimized
 * @param {Function} props.onMinimize - Callback for minimizing the assistant
 */
const AIAssistant = ({
  onAddToCart,
  onShowInventory,
  onOpenFloat,
  onCloseFloat,
  cloudEnabled = false,
  minimized = false,
  onMinimize
}) => {
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      text: 'Hello! I\'m your CannaFlow assistant. How can I help you today?', 
      sender: 'assistant' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Handle command submission
  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = {
      id: `user_${Date.now()}`,
      text: inputText,
      sender: 'user'
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsProcessing(true);
    
    try {
      // Process the command
      const result = await processCommand(userMessage.text, {
        onAddToCart,
        onShowInventory,
        onOpenFloat,
        onCloseFloat
      });
      
      // Add assistant response
      const assistantMessage = {
        id: `assistant_${Date.now()}`,
        text: result.response,
        sender: 'assistant',
        result: result
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Speak the response if not on web
      if (Platform.OS !== 'web') {
        speakResponse(result.response);
      }
    } catch (error) {
      console.error('Error processing command:', error);
      
      // Add error message
      const errorMessage = {
        id: `error_${Date.now()}`,
        text: 'Sorry, I encountered an error while processing your request.',
        sender: 'assistant',
        error: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle voice input
  const handleVoiceInput = () => {
    // Toggle listening state
    setIsListening(prevState => !prevState);
    
    if (!isListening) {
      // Start listening
      // This is a placeholder - in a real app, you would use a voice recognition library
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: `system_${Date.now()}`, 
          text: 'Listening...', 
          sender: 'system' 
        }
      ]);
      
      // Simulate voice recognition after 2 seconds
      setTimeout(() => {
        const recognizedText = 'Show inventory for sativa';
        setInputText(recognizedText);
        
        // Update the system message
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const systemMessageIndex = updatedMessages.findIndex(msg => msg.sender === 'system');
          
          if (systemMessageIndex !== -1) {
            updatedMessages[systemMessageIndex] = {
              ...updatedMessages[systemMessageIndex],
              text: `Recognized: "${recognizedText}"`
            };
          }
          
          return updatedMessages;
        });
        
        setIsListening(false);
        
        // Submit the recognized text
        setTimeout(() => {
          handleSubmit();
        }, 500);
      }, 2000);
    } else {
      // Stop listening
      setMessages(prevMessages => [
        ...prevMessages,
        { 
          id: `system_${Date.now()}`, 
          text: 'Stopped listening.', 
          sender: 'system' 
        }
      ]);
    }
  };
  
  // Clear all messages
  const handleClearMessages = () => {
    setMessages([
      { 
        id: 'welcome', 
        text: 'Hello! I\'m your CannaFlow assistant. How can I help you today?', 
        sender: 'assistant' 
      }
    ]);
  };
  
  // Render the minimized version
  if (minimized) {
    return (
      <TouchableOpacity
        style={styles.minimizedContainer}
        onPress={onMinimize}
      >
        <IconButton
          icon="robot"
          color={theme.colors.primary}
          size={24}
        />
      </TouchableOpacity>
    );
  }
  
  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CannaFlow Assistant</Text>
        <View style={styles.headerButtons}>
          <IconButton
            icon="delete"
            color={theme.colors.text}
            size={20}
            onPress={handleClearMessages}
          />
          <IconButton
            icon="minus"
            color={theme.colors.text}
            size={20}
            onPress={onMinimize}
          />
        </View>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(message => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userMessage : 
              message.sender === 'system' ? styles.systemMessage : 
              message.error ? styles.errorMessage : styles.assistantMessage
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a command..."
          placeholderTextColor="#999"
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!inputText.trim()}
        >
          <IconButton
            icon="send"
            color={inputText.trim() ? theme.colors.primary : '#999'}
            size={24}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.voiceButton,
            isListening && styles.voiceButtonActive
          ]}
          onPress={handleVoiceInput}
        >
          <IconButton
            icon={isListening ? "microphone" : "microphone-outline"}
            color={isListening ? theme.colors.error : theme.colors.primary}
            size={24}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {cloudEnabled ? 'Cloud AI Enabled' : 'Offline Mode'}
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 350,
    height: 500,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#fff'
  },
  minimizedContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  headerButtons: {
    flexDirection: 'row'
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  messagesContent: {
    padding: 10,
    paddingBottom: 15
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%'
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15
  },
  errorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: theme.colors.error
  },
  messageText: {
    fontSize: 14,
    color: '#333'
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 5
  },
  processingText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 5,
    backgroundColor: '#f9f9f9'
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    opacity: 0.5
  },
  voiceButton: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  voiceButtonActive: {
    backgroundColor: '#ffebee',
    borderRadius: 20
  },
  footer: {
    padding: 5,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  footerText: {
    fontSize: 10,
    color: '#999'
  }
});

export default AIAssistant;