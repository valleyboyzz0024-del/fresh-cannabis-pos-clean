import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { 
  Surface, 
  Button, 
  IconButton, 
  Divider, 
  Menu, 
  Chip,
  ActivityIndicator
} from 'react-native-paper';
import { theme } from '../theme/theme';
import {
  getComplianceSettings,
  updateComplianceSettings,
  getComplianceLogs,
  exportComplianceLogs,
  generateDailySummary,
  checkComplianceIssues,
  getRetentionStatus,
  archiveExpiredLogs,
  PROVINCES,
  EXPORT_FORMATS,
  LOG_TYPES
} from '../services/complianceEngine';

/**
 * Compliance Dashboard Component
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the dashboard is visible
 * @param {Function} props.onClose - Callback for closing the dashboard
 */
const ComplianceDashboard = ({ visible = true, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [issues, setIssues] = useState([]);
  const [retentionStatus, setRetentionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [provinceMenuVisible, setProvinceMenuVisible] = useState(false);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState(null);
  
  // Load initial data
  useEffect(() => {
    if (visible) {
      loadDashboardData();
    }
  }, [visible]);
  
  // Load all dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load settings
      const complianceSettings = await getComplianceSettings();
      setSettings(complianceSettings);
      
      // Load recent logs
      const recentLogs = await getComplianceLogs({ limit: 10 });
      setLogs(recentLogs);
      
      // Check for compliance issues
      const complianceIssues = await checkComplianceIssues();
      setIssues(complianceIssues);
      
      // Get retention status
      const retention = await getRetentionStatus();
      setRetentionStatus(retention);
    } catch (error) {
      console.error('Error loading compliance dashboard data:', error);
      Alert.alert('Error', 'Failed to load compliance data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update province setting
  const handleProvinceChange = async (province) => {
    try {
      await updateComplianceSettings({ province });
      setSettings(prevSettings => ({ ...prevSettings, province }));
      setProvinceMenuVisible(false);
      
      // Reload issues as they may change based on province
      const complianceIssues = await checkComplianceIssues();
      setIssues(complianceIssues);
    } catch (error) {
      console.error('Error updating province:', error);
      Alert.alert('Error', 'Failed to update province setting');
    }
  };
  
  // Update export format setting
  const handleExportFormatChange = async (format) => {
    try {
      await updateComplianceSettings({ exportFormat: format });
      setSettings(prevSettings => ({ ...prevSettings, exportFormat: format }));
      setExportMenuVisible(false);
    } catch (error) {
      console.error('Error updating export format:', error);
      Alert.alert('Error', 'Failed to update export format setting');
    }
  };
  
  // Generate daily summary
  const handleGenerateSummary = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      await generateDailySummary(today);
      
      // Reload logs and issues
      const recentLogs = await getComplianceLogs({ limit: 10 });
      setLogs(recentLogs);
      
      const complianceIssues = await checkComplianceIssues();
      setIssues(complianceIssues);
      
      Alert.alert('Success', 'Daily summary generated successfully');
    } catch (error) {
      console.error('Error generating daily summary:', error);
      Alert.alert('Error', 'Failed to generate daily summary');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export logs
  const handleExportLogs = async () => {
    try {
      setIsExporting(true);
      
      const format = settings?.exportFormat || EXPORT_FORMATS.CSV;
      const result = await exportComplianceLogs({
        format,
        logType: selectedLogType,
        share: Platform.OS !== 'web'
      });
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([result.data], { 
          type: format === EXPORT_FORMATS.JSON ? 'application/json' : 
                format === EXPORT_FORMATS.XML ? 'application/xml' : 
                'text/csv' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      Alert.alert('Success', `Logs exported successfully${Platform.OS !== 'web' ? ' and ready to share' : ''}`);
    } catch (error) {
      console.error('Error exporting logs:', error);
      Alert.alert('Error', 'Failed to export logs');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Archive expired logs
  const handleArchiveLogs = async () => {
    try {
      setIsLoading(true);
      const result = await archiveExpiredLogs();
      
      // Reload retention status
      const retention = await getRetentionStatus();
      setRetentionStatus(retention);
      
      Alert.alert('Success', result.message);
    } catch (error) {
      console.error('Error archiving logs:', error);
      Alert.alert('Error', 'Failed to archive logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter logs by type
  const handleFilterByType = async (type) => {
    try {
      setIsLoading(true);
      setSelectedLogType(type);
      setFilterMenuVisible(false);
      
      const filteredLogs = await getComplianceLogs({
        type,
        limit: 10
      });
      
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error filtering logs:', error);
      Alert.alert('Error', 'Failed to filter logs');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear log filter
  const handleClearFilter = async () => {
    try {
      setIsLoading(true);
      setSelectedLogType(null);
      
      const recentLogs = await getComplianceLogs({ limit: 10 });
      setLogs(recentLogs);
    } catch (error) {
      console.error('Error clearing filter:', error);
      Alert.alert('Error', 'Failed to clear filter');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resolve a compliance issue
  const handleResolveIssue = async (issue) => {
    try {
      setIsLoading(true);
      
      switch (issue.action) {
        case 'generate_summary':
          await generateDailySummary(issue.actionParams.date);
          break;
          
        case 'update_sales_tax':
          // This would require a more complex implementation
          Alert.alert('Not Implemented', 'This action requires manual intervention');
          break;
          
        case 'add_french_descriptions':
          // This would require a more complex implementation
          Alert.alert('Not Implemented', 'This action requires manual intervention');
          break;
          
        default:
          Alert.alert('Unknown Action', 'This issue cannot be automatically resolved');
          break;
      }
      
      // Reload issues
      const complianceIssues = await checkComplianceIssues();
      setIssues(complianceIssues);
    } catch (error) {
      console.error('Error resolving issue:', error);
      Alert.alert('Error', 'Failed to resolve issue');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render loading state
  if (isLoading && !settings) {
    return (
      <Surface style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading compliance data...</Text>
      </Surface>
    );
  }
  
  return (
    <Surface style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Compliance Dashboard</Text>
        <IconButton
          icon="close"
          color="#fff"
          size={20}
          onPress={onClose}
        />
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
            Logs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View style={styles.overviewContainer}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Compliance Status</Text>
              <Chip 
                mode="outlined" 
                textStyle={{ color: issues.length > 0 ? theme.colors.error : theme.colors.primary }}
                style={{ 
                  backgroundColor: issues.length > 0 ? '#FFEBEE' : '#E8F5E9',
                  borderColor: issues.length > 0 ? theme.colors.error : theme.colors.primary
                }}
              >
                {issues.length > 0 ? `${issues.length} Issues` : 'All Good'}
              </Chip>
            </View>
            
            <View style={styles.provinceBanner}>
              <Text style={styles.provinceText}>
                Province: {PROVINCES[settings?.province] || 'Not Set'}
              </Text>
              <Button
                mode="contained"
                compact
                onPress={() => setProvinceMenuVisible(true)}
              >
                Change
              </Button>
              
              <Menu
                visible={provinceMenuVisible}
                onDismiss={() => setProvinceMenuVisible(false)}
                anchor={<View />}
                style={styles.provinceMenu}
              >
                {Object.keys(PROVINCES).map(code => (
                  <Menu.Item
                    key={code}
                    title={PROVINCES[code]}
                    onPress={() => handleProvinceChange(code)}
                    titleStyle={
                      settings?.province === code ? { color: theme.colors.primary } : {}
                    }
                  />
                ))}
              </Menu>
            </View>
            
            {issues.length > 0 && (
              <View style={styles.issuesContainer}>
                <Text style={styles.sectionTitle}>Compliance Issues</Text>
                {issues.map((issue, index) => (
                  <Surface key={index} style={styles.issueCard}>
                    <View style={styles.issueHeader}>
                      <Text style={styles.issueTitle}>{issue.message}</Text>
                      <Chip 
                        mode="outlined" 
                        textStyle={{ 
                          color: issue.severity === 'high' ? theme.colors.error : 
                                 issue.severity === 'medium' ? '#FB8C00' : 
                                 theme.colors.primary 
                        }}
                        style={{ 
                          backgroundColor: 'transparent',
                          borderColor: issue.severity === 'high' ? theme.colors.error : 
                                      issue.severity === 'medium' ? '#FB8C00' : 
                                      theme.colors.primary
                        }}
                      >
                        {issue.severity.toUpperCase()}
                      </Chip>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleResolveIssue(issue)}
                      style={styles.resolveButton}
                    >
                      Resolve Issue
                    </Button>
                  </Surface>
                ))}
              </View>
            )}
            
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Retention Status</Text>
              {retentionStatus && (
                <Surface style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Logs:</Text>
                    <Text style={styles.summaryValue}>{retentionStatus.totalLogs}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Current Logs:</Text>
                    <Text style={styles.summaryValue}>{retentionStatus.currentLogs}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Expiring Soon:</Text>
                    <Text style={[
                      styles.summaryValue,
                      retentionStatus.expiringLogs > 0 && { color: '#FB8C00' }
                    ]}>
                      {retentionStatus.expiringLogs}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Expired Logs:</Text>
                    <Text style={[
                      styles.summaryValue,
                      retentionStatus.expiredLogs > 0 && { color: theme.colors.error }
                    ]}>
                      {retentionStatus.expiredLogs}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Retention Period:</Text>
                    <Text style={styles.summaryValue}>{retentionStatus.retentionPeriod} years</Text>
                  </View>
                  
                  {retentionStatus.expiredLogs > 0 && (
                    <Button
                      mode="contained"
                      onPress={handleArchiveLogs}
                      style={styles.archiveButton}
                    >
                      Archive Expired Logs
                    </Button>
                  )}
                </Surface>
              )}
            </View>
            
            <View style={styles.actionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  icon="file-document-outline"
                  onPress={handleGenerateSummary}
                  style={styles.actionButton}
                >
                  Generate Daily Summary
                </Button>
                <Button
                  mode="contained"
                  icon="export"
                  onPress={handleExportLogs}
                  style={styles.actionButton}
                  loading={isExporting}
                  disabled={isExporting}
                >
                  Export Logs
                </Button>
              </View>
            </View>
          </View>
        )}
        
        {activeTab === 'logs' && (
          <View style={styles.logsContainer}>
            <View style={styles.logsHeader}>
              <Text style={styles.sectionTitle}>Compliance Logs</Text>
              <View style={styles.logsActions}>
                <Menu
                  visible={filterMenuVisible}
                  onDismiss={() => setFilterMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      icon="filter"
                      onPress={() => setFilterMenuVisible(true)}
                      style={styles.filterButton}
                    >
                      Filter
                    </Button>
                  }
                >
                  <Menu.Item
                    title="All Logs"
                    onPress={handleClearFilter}
                  />
                  <Divider />
                  <Menu.Item
                    title="Sales"
                    onPress={() => handleFilterByType(LOG_TYPES.SALE)}
                  />
                  <Menu.Item
                    title="Inventory"
                    onPress={() => handleFilterByType(LOG_TYPES.INVENTORY)}
                  />
                  <Menu.Item
                    title="Cash Float"
                    onPress={() => handleFilterByType(LOG_TYPES.CASH_FLOAT)}
                  />
                  <Menu.Item
                    title="Daily Summary"
                    onPress={() => handleFilterByType(LOG_TYPES.DAILY_SUMMARY)}
                  />
                  <Menu.Item
                    title="Audit"
                    onPress={() => handleFilterByType(LOG_TYPES.AUDIT)}
                  />
                </Menu>
                
                <Button
                  mode="contained"
                  icon="refresh"
                  onPress={loadDashboardData}
                  style={styles.refreshButton}
                >
                  Refresh
                </Button>
              </View>
            </View>
            
            {selectedLogType && (
              <Chip
                mode="outlined"
                onClose={handleClearFilter}
                style={styles.filterChip}
              >
                Filtered: {selectedLogType}
              </Chip>
            )}
            
            {logs.length === 0 ? (
              <Text style={styles.emptyText}>No logs found</Text>
            ) : (
              logs.map((log, index) => (
                <Surface key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Chip mode="outlined" style={styles.logTypeChip}>
                      {log.type}
                    </Chip>
                    <Text style={styles.logDate}>
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.logContent}>
                    {log.type === LOG_TYPES.SALE && (
                      <Text style={styles.logText}>
                        Sale: ${log.data.total.toFixed(2)} - {log.data.products?.length || 0} products
                      </Text>
                    )}
                    {log.type === LOG_TYPES.INVENTORY && (
                      <Text style={styles.logText}>
                        Inventory: {log.data.adjustmentType} - {log.data.productName} ({log.data.quantity})
                      </Text>
                    )}
                    {log.type === LOG_TYPES.CASH_FLOAT && (
                      <Text style={styles.logText}>
                        Cash Float: {log.data.activityType} - ${log.data.amount.toFixed(2)}
                      </Text>
                    )}
                    {log.type === LOG_TYPES.DAILY_SUMMARY && (
                      <Text style={styles.logText}>
                        Daily Summary: ${log.data.totalSales.toFixed(2)} - {log.data.transactionCount} transactions
                      </Text>
                    )}
                    {log.type === LOG_TYPES.AUDIT && (
                      <Text style={styles.logText}>
                        Audit: {log.data.action} - {log.data.details}
                      </Text>
                    )}
                  </View>
                </Surface>
              ))
            )}
          </View>
        )}
        
        {activeTab === 'settings' && (
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Compliance Settings</Text>
            
            <Surface style={styles.settingsCard}>
              <Text style={styles.settingLabel}>Business Information</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingName}>Business Name</Text>
                <Text style={styles.settingValue}>{settings?.businessName}</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingName}>License Number</Text>
                <Text style={styles.settingValue}>{settings?.licenseNumber}</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingName}>Location</Text>
                <Text style={styles.settingValue}>{settings?.location}</Text>
              </View>
            </Surface>
            
            <Surface style={styles.settingsCard}>
              <Text style={styles.settingLabel}>Compliance Configuration</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingName}>Province</Text>
                <View style={styles.settingAction}>
                  <Text style={styles.settingValue}>{PROVINCES[settings?.province]}</Text>
                  <Button
                    mode="text"
                    onPress={() => setProvinceMenuVisible(true)}
                  >
                    Change
                  </Button>
                </View>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingName}>Retention Period</Text>
                <Text style={styles.settingValue}>{settings?.retentionPeriod} years</Text>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingName}>Language</Text>
                <Text style={styles.settingValue}>
                  {settings?.language === 'fr' ? 'French' : 'English'}
                </Text>
              </View>
            </Surface>
            
            <Surface style={styles.settingsCard}>
              <Text style={styles.settingLabel}>Export Settings</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingName}>Export Format</Text>
                <View style={styles.settingAction}>
                  <Text style={styles.settingValue}>{settings?.exportFormat?.toUpperCase()}</Text>
                  <Menu
                    visible={exportMenuVisible}
                    onDismiss={() => setExportMenuVisible(false)}
                    anchor={
                      <Button
                        mode="text"
                        onPress={() => setExportMenuVisible(true)}
                      >
                        Change
                      </Button>
                    }
                  >
                    <Menu.Item
                      title="CSV"
                      onPress={() => handleExportFormatChange(EXPORT_FORMATS.CSV)}
                    />
                    <Menu.Item
                      title="JSON"
                      onPress={() => handleExportFormatChange(EXPORT_FORMATS.JSON)}
                    />
                    <Menu.Item
                      title="XML"
                      onPress={() => handleExportFormatChange(EXPORT_FORMATS.XML)}
                    />
                  </Menu>
                </View>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingName}>Auto Export</Text>
                <Text style={styles.settingValue}>
                  {settings?.autoExport ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              {settings?.autoExport && (
                <View style={styles.settingRow}>
                  <Text style={styles.settingName}>Export Email</Text>
                  <Text style={styles.settingValue}>{settings?.exportEmail}</Text>
                </View>
              )}
            </Surface>
          </View>
        )}
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    maxWidth: 800,
    maxHeight: 600,
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    maxWidth: 800,
    maxHeight: 600,
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme.colors.primary
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center'
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary
  },
  tabText: {
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  overviewContainer: {
    padding: 15
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  provinceBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20
  },
  provinceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  provinceMenu: {
    marginTop: 50
  },
  issuesContainer: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  issueCard: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  issueTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 10
  },
  resolveButton: {
    marginTop: 10
  },
  summaryContainer: {
    marginBottom: 20
  },
  summaryCard: {
    padding: 15,
    borderRadius: 5,
    elevation: 2
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  archiveButton: {
    marginTop: 15
  },
  actionsContainer: {
    marginBottom: 20
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  actionButton: {
    marginRight: 10,
    marginBottom: 10
  },
  logsContainer: {
    padding: 15
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  logsActions: {
    flexDirection: 'row'
  },
  filterButton: {
    marginRight: 10
  },
  refreshButton: {
  },
  filterChip: {
    marginBottom: 15
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20
  },
  logCard: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  logTypeChip: {
    backgroundColor: '#E8F5E9'
  },
  logDate: {
    fontSize: 12,
    color: '#666'
  },
  logContent: {
  },
  logText: {
    fontSize: 14,
    color: '#333'
  },
  settingsContainer: {
    padding: 15
  },
  settingsCard: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    elevation: 2
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  settingName: {
    fontSize: 14,
    color: '#666'
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

export default ComplianceDashboard;