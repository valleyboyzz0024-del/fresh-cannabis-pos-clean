import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import { FAB, Portal, Modal } from 'react-native-paper';
import { useAI } from '../context/AIContext';
import AIAssistant from './AIAssistant';
import ComplianceDashboard from './ComplianceDashboard';
import { theme } from '../theme/theme';

/**
 * Floating action button for accessing AI Assistant and Compliance Dashboard
 */
const AIFloatingButton = ({ onAddToCart, onShowInventory, onOpenFloat, onCloseFloat }) => {
  const { 
    aiSettings, 
    updateAISettings, 
    isAIVisible, 
    toggleAIAssistant,
    isComplianceVisible,
    toggleComplianceDashboard
  } = useAI();
  
  const [isFABOpen, setIsFABOpen] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // Handle FAB state change
  const onStateChange = ({ open }) => setIsFABOpen(open);
  
  // Toggle AI assistant minimized state
  const toggleMinimized = () => {
    updateAISettings({ minimized: !aiSettings.minimized });
  };
  
  return (
    <>
      {/* AI Assistant */}
      {isAIVisible && (
        <View style={styles.assistantContainer}>
          <AIAssistant
            onAddToCart={onAddToCart}
            onShowInventory={onShowInventory}
            onOpenFloat={onOpenFloat}
            onCloseFloat={onCloseFloat}
            cloudEnabled={aiSettings.cloudEnabled}
            minimized={aiSettings.minimized}
            onMinimize={toggleMinimized}
          />
        </View>
      )}
      
      {/* Compliance Dashboard */}
      {isComplianceVisible && (
        <Portal>
          <Modal
            visible={isComplianceVisible}
            onDismiss={() => toggleComplianceDashboard(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <ComplianceDashboard
              visible={isComplianceVisible}
              onClose={() => toggleComplianceDashboard(false)}
            />
          </Modal>
        </Portal>
      )}
      
      {/* Settings Modal */}
      <Portal>
        <Modal
          visible={settingsVisible}
          onDismiss={() => setSettingsVisible(false)}
          contentContainerStyle={styles.settingsContainer}
        >
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>AI Assistant Settings</Text>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>AI Assistant</Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                aiSettings.enabled ? styles.toggleOn : styles.toggleOff
              ]}
              onPress={() => updateAISettings({ enabled: !aiSettings.enabled })}
            >
              <Animated.View style={[
                styles.toggleThumb,
                aiSettings.enabled ? styles.toggleThumbOn : styles.toggleThumbOff
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Voice Responses</Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                aiSettings.voiceEnabled ? styles.toggleOn : styles.toggleOff
              ]}
              onPress={() => updateAISettings({ voiceEnabled: !aiSettings.voiceEnabled })}
            >
              <Animated.View style={[
                styles.toggleThumb,
                aiSettings.voiceEnabled ? styles.toggleThumbOn : styles.toggleThumbOff
              ]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Cloud AI (Pro)</Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                aiSettings.cloudEnabled ? styles.toggleOn : styles.toggleOff
              ]}
              onPress={() => updateAISettings({ cloudEnabled: !aiSettings.cloudEnabled })}
            >
              <Animated.View style={[
                styles.toggleThumb,
                aiSettings.cloudEnabled ? styles.toggleThumbOn : styles.toggleThumbOff
              ]} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSettingsVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
      
      {/* Floating Action Button */}
      <FAB.Group
        open={isFABOpen}
        icon={isFABOpen ? 'close' : 'robot'}
        color="#fff"
        fabStyle={styles.fab}
        actions={[
          {
            icon: 'cog',
            label: 'Settings',
            onPress: () => {
              setIsFABOpen(false);
              setSettingsVisible(true);
            }
          },
          {
            icon: 'clipboard-check-outline',
            label: 'Compliance',
            onPress: () => {
              setIsFABOpen(false);
              toggleComplianceDashboard(true);
            }
          },
          {
            icon: 'robot',
            label: 'AI Assistant',
            onPress: () => {
              setIsFABOpen(false);
              toggleAIAssistant(true);
            }
          }
        ]}
        onStateChange={onStateChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  assistantContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 1000
  },
  fab: {
    backgroundColor: theme.colors.primary
  },
  modalContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: 'transparent'
  },
  settingsContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10
  },
  settingsHeader: {
    marginBottom: 20
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  settingLabel: {
    fontSize: 16,
    color: '#333'
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center'
  },
  toggleOn: {
    backgroundColor: theme.colors.primary
  },
  toggleOff: {
    backgroundColor: '#e0e0e0'
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white'
  },
  toggleThumbOn: {
    alignSelf: 'flex-end'
  },
  toggleThumbOff: {
    alignSelf: 'flex-start'
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    alignItems: 'center'
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default AIFloatingButton;