import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processCommand, speakResponse } from '../services/aiAssistant';
import { initComplianceEngine } from '../services/complianceEngine';

// Create context
const AIContext = createContext();

// AI Assistant settings storage key
const AI_SETTINGS_KEY = '@cannabis_pos_ai_settings';

// Default AI settings
const DEFAULT_AI_SETTINGS = {
  enabled: true,
  cloudEnabled: false,
  voiceEnabled: true,
  autoRespond: true,
  minimized: true
};

/**
 * AI Context Provider
 * @param {Object} props - Provider props
 */
export const AIProvider = ({ children }) => {
  const [aiSettings, setAISettings] = useState(DEFAULT_AI_SETTINGS);
  const [isAIVisible, setIsAIVisible] = useState(false);
  const [isComplianceVisible, setIsComplianceVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize AI and compliance engine
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load AI settings
        const storedSettings = await AsyncStorage.getItem(AI_SETTINGS_KEY);
        if (storedSettings) {
          setAISettings(JSON.parse(storedSettings));
        }
        
        // Initialize compliance engine
        await initComplianceEngine();
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing AI context:', error);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize AI assistant or compliance engine. Some features may not work correctly.'
        );
        setIsInitialized(true); // Set to true anyway to avoid blocking the app
      }
    };
    
    initialize();
  }, []);
  
  // Save settings when they change
  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(aiSettings))
        .catch(error => console.error('Error saving AI settings:', error));
    }
  }, [aiSettings, isInitialized]);
  
  /**
   * Update AI settings
   * @param {Object} newSettings - New settings to apply
   */
  const updateAISettings = (newSettings) => {
    setAISettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };
  
  /**
   * Toggle AI assistant visibility
   * @param {boolean} visible - Whether to show or hide the assistant
   */
  const toggleAIAssistant = (visible = !isAIVisible) => {
    setIsAIVisible(visible);
    
    // If showing the assistant, hide the compliance dashboard
    if (visible && isComplianceVisible) {
      setIsComplianceVisible(false);
    }
  };
  
  /**
   * Toggle compliance dashboard visibility
   * @param {boolean} visible - Whether to show or hide the dashboard
   */
  const toggleComplianceDashboard = (visible = !isComplianceVisible) => {
    setIsComplianceVisible(visible);
    
    // If showing the dashboard, hide the AI assistant
    if (visible && isAIVisible) {
      setIsAIVisible(false);
    }
  };
  
  /**
   * Process a command through the AI assistant
   * @param {string} command - The command to process
   * @param {Object} callbacks - Callback functions for different actions
   * @returns {Promise<Object>} Result of the command processing
   */
  const handleCommand = async (command, callbacks = {}) => {
    try {
      // Process the command
      const result = await processCommand(command, callbacks);
      
      // Speak the response if voice is enabled
      if (aiSettings.voiceEnabled && result.response) {
        speakResponse(result.response);
      }
      
      return result;
    } catch (error) {
      console.error('Error handling command:', error);
      return {
        success: false,
        message: 'Error processing command',
        response: "Sorry, there was an error processing your command. Please try again.",
        error
      };
    }
  };
  
  // Context value
  const value = {
    aiSettings,
    updateAISettings,
    isAIVisible,
    toggleAIAssistant,
    isComplianceVisible,
    toggleComplianceDashboard,
    handleCommand,
    isInitialized
  };
  
  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// Custom hook for using the AI context
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};