import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

// Storage keys
const COMPLIANCE_LOGS_KEY = '@cannabis_pos_compliance_logs';
const COMPLIANCE_SETTINGS_KEY = '@cannabis_pos_compliance_settings';

// Log types
export const LOG_TYPES = {
  SALE: 'sale',
  INVENTORY: 'inventory',
  CASH_FLOAT: 'cash_float',
  DAILY_SUMMARY: 'daily_summary',
  AUDIT: 'audit'
};

// Canadian provinces and territories
export const PROVINCES = {
  BC: 'British Columbia',
  ON: 'Ontario',
  AB: 'Alberta',
  QC: 'Quebec',
  MB: 'Manitoba',
  SK: 'Saskatchewan',
  NS: 'Nova Scotia',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  PE: 'Prince Edward Island',
  YT: 'Yukon',
  NT: 'Northwest Territories',
  NU: 'Nunavut'
};

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  XML: 'xml'
};

// Default compliance settings
const DEFAULT_SETTINGS = {
  province: 'BC',
  businessName: 'CannaFlow Dispensary',
  licenseNumber: 'SAMPLE-LICENSE-123',
  location: '123 Main Street, Vancouver, BC',
  retentionPeriod: 6, // years
  autoExport: false,
  exportFormat: EXPORT_FORMATS.CSV,
  exportEmail: '',
  language: 'en' // 'en' or 'fr'
};

// In-memory cache
let complianceLogsCache = null;
let complianceSettingsCache = null;

/**
 * Initialize the compliance engine
 * @returns {Promise<boolean>} Success status
 */
export const initComplianceEngine = async () => {
  try {
    // Load or initialize compliance settings
    let settings = await AsyncStorage.getItem(COMPLIANCE_SETTINGS_KEY);
    if (!settings) {
      settings = DEFAULT_SETTINGS;
      await AsyncStorage.setItem(COMPLIANCE_SETTINGS_KEY, JSON.stringify(settings));
    } else {
      settings = JSON.parse(settings);
    }
    complianceSettingsCache = settings;
    
    // Load compliance logs
    let logs = await AsyncStorage.getItem(COMPLIANCE_LOGS_KEY);
    if (!logs) {
      logs = [];
      await AsyncStorage.setItem(COMPLIANCE_LOGS_KEY, JSON.stringify(logs));
    } else {
      logs = JSON.parse(logs);
    }
    complianceLogsCache = logs;
    
    return true;
  } catch (error) {
    console.error('Error initializing compliance engine:', error);
    return false;
  }
};

/**
 * Get compliance settings
 * @returns {Promise<Object>} Compliance settings
 */
export const getComplianceSettings = async () => {
  if (!complianceSettingsCache) {
    const settings = await AsyncStorage.getItem(COMPLIANCE_SETTINGS_KEY);
    if (settings) {
      complianceSettingsCache = JSON.parse(settings);
    } else {
      complianceSettingsCache = DEFAULT_SETTINGS;
      await AsyncStorage.setItem(COMPLIANCE_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    }
  }
  return complianceSettingsCache;
};

/**
 * Update compliance settings
 * @param {Object} newSettings - New settings to apply
 * @returns {Promise<boolean>} Success status
 */
export const updateComplianceSettings = async (newSettings) => {
  try {
    const currentSettings = await getComplianceSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await AsyncStorage.setItem(COMPLIANCE_SETTINGS_KEY, JSON.stringify(updatedSettings));
    complianceSettingsCache = updatedSettings;
    return true;
  } catch (error) {
    console.error('Error updating compliance settings:', error);
    return false;
  }
};

/**
 * Add a compliance log entry
 * @param {string} type - Log type (from LOG_TYPES)
 * @param {Object} data - Log data
 * @returns {Promise<Object>} The created log entry
 */
export const addComplianceLog = async (type, data) => {
  try {
    // Get current logs
    if (!complianceLogsCache) {
      const logs = await AsyncStorage.getItem(COMPLIANCE_LOGS_KEY);
      complianceLogsCache = logs ? JSON.parse(logs) : [];
    }
    
    // Create new log entry
    const timestamp = new Date().toISOString();
    const logEntry = {
      id: `log_${Date.now()}`,
      type,
      timestamp,
      data
    };
    
    // Add to cache and save
    complianceLogsCache.push(logEntry);
    await AsyncStorage.setItem(COMPLIANCE_LOGS_KEY, JSON.stringify(complianceLogsCache));
    
    return logEntry;
  } catch (error) {
    console.error('Error adding compliance log:', error);
    throw error;
  }
};

/**
 * Get compliance logs with optional filtering
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} Filtered logs
 */
export const getComplianceLogs = async (options = {}) => {
  try {
    // Get logs from cache or storage
    if (!complianceLogsCache) {
      const logs = await AsyncStorage.getItem(COMPLIANCE_LOGS_KEY);
      complianceLogsCache = logs ? JSON.parse(logs) : [];
    }
    
    // Apply filters if provided
    let filteredLogs = [...complianceLogsCache];
    
    if (options.type) {
      filteredLogs = filteredLogs.filter(log => log.type === options.type);
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate).getTime();
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate).getTime();
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= endDate);
    }
    
    if (options.limit) {
      filteredLogs = filteredLogs.slice(0, options.limit);
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return filteredLogs;
  } catch (error) {
    console.error('Error getting compliance logs:', error);
    throw error;
  }
};

/**
 * Log a sales transaction
 * @param {Object} saleData - Sale transaction data
 * @returns {Promise<Object>} The created log entry
 */
export const logSaleTransaction = async (saleData) => {
  try {
    const settings = await getComplianceSettings();
    const timestamp = new Date().toISOString();
    
    // Ensure required fields are present
    const requiredFields = {
      id: saleData.id || `sale_${Date.now()}`,
      timestamp: timestamp,
      products: saleData.products || [],
      total: saleData.total || 0,
      tax: saleData.tax || 0,
      staffId: saleData.staffId || 'unknown',
      location: saleData.location || settings.location
    };
    
    // Add province-specific fields
    const enhancedData = await enhanceDataByProvince(settings.province, {
      ...saleData,
      ...requiredFields
    }, LOG_TYPES.SALE);
    
    // Add to compliance logs
    return await addComplianceLog(LOG_TYPES.SALE, enhancedData);
  } catch (error) {
    console.error('Error logging sale transaction:', error);
    throw error;
  }
};

/**
 * Log an inventory adjustment
 * @param {Object} inventoryData - Inventory adjustment data
 * @returns {Promise<Object>} The created log entry
 */
export const logInventoryAdjustment = async (inventoryData) => {
  try {
    const settings = await getComplianceSettings();
    const timestamp = new Date().toISOString();
    
    // Ensure required fields are present
    const requiredFields = {
      id: inventoryData.id || `inv_${Date.now()}`,
      timestamp: timestamp,
      productId: inventoryData.productId,
      productName: inventoryData.productName,
      adjustmentType: inventoryData.adjustmentType, // received, sold, returned, destroyed
      quantity: inventoryData.quantity,
      reason: inventoryData.reason || '',
      staffId: inventoryData.staffId || 'unknown',
      location: inventoryData.location || settings.location
    };
    
    // Add province-specific fields
    const enhancedData = await enhanceDataByProvince(settings.province, {
      ...inventoryData,
      ...requiredFields
    }, LOG_TYPES.INVENTORY);
    
    // Add to compliance logs
    return await addComplianceLog(LOG_TYPES.INVENTORY, enhancedData);
  } catch (error) {
    console.error('Error logging inventory adjustment:', error);
    throw error;
  }
};

/**
 * Log a cash float activity
 * @param {Object} floatData - Cash float data
 * @returns {Promise<Object>} The created log entry
 */
export const logCashFloatActivity = async (floatData) => {
  try {
    const settings = await getComplianceSettings();
    const timestamp = new Date().toISOString();
    
    // Ensure required fields are present
    const requiredFields = {
      id: floatData.id || `float_${Date.now()}`,
      timestamp: timestamp,
      activityType: floatData.activityType, // open, close, adjustment
      amount: floatData.amount,
      staffId: floatData.staffId || 'unknown',
      notes: floatData.notes || '',
      location: floatData.location || settings.location
    };
    
    // Add province-specific fields
    const enhancedData = await enhanceDataByProvince(settings.province, {
      ...floatData,
      ...requiredFields
    }, LOG_TYPES.CASH_FLOAT);
    
    // Add to compliance logs
    return await addComplianceLog(LOG_TYPES.CASH_FLOAT, enhancedData);
  } catch (error) {
    console.error('Error logging cash float activity:', error);
    throw error;
  }
};

/**
 * Generate and log a daily summary
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} The created log entry
 */
export const generateDailySummary = async (date = new Date().toISOString().split('T')[0]) => {
  try {
    const settings = await getComplianceSettings();
    const timestamp = new Date().toISOString();
    
    // Get logs for the specified date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get sales logs
    const salesLogs = await getComplianceLogs({
      type: LOG_TYPES.SALE,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // Get inventory logs
    const inventoryLogs = await getComplianceLogs({
      type: LOG_TYPES.INVENTORY,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // Get cash float logs
    const floatLogs = await getComplianceLogs({
      type: LOG_TYPES.CASH_FLOAT,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // Calculate totals
    const totalSales = salesLogs.reduce((sum, log) => sum + log.data.total, 0);
    const totalTax = salesLogs.reduce((sum, log) => sum + log.data.tax, 0);
    
    // Create summary data
    const summaryData = {
      id: `summary_${date}`,
      date,
      timestamp,
      totalSales,
      totalTax,
      transactionCount: salesLogs.length,
      inventoryAdjustments: inventoryLogs.length,
      cashFloatActivities: floatLogs.length,
      location: settings.location,
      businessName: settings.businessName,
      licenseNumber: settings.licenseNumber
    };
    
    // Add province-specific fields
    const enhancedData = await enhanceDataByProvince(settings.province, summaryData, LOG_TYPES.DAILY_SUMMARY);
    
    // Add to compliance logs
    return await addComplianceLog(LOG_TYPES.DAILY_SUMMARY, enhancedData);
  } catch (error) {
    console.error('Error generating daily summary:', error);
    throw error;
  }
};

/**
 * Enhance data with province-specific fields
 * @param {string} province - Province code
 * @param {Object} data - Data to enhance
 * @param {string} logType - Log type
 * @returns {Promise<Object>} Enhanced data
 */
const enhanceDataByProvince = async (province, data, logType) => {
  // Start with the original data
  let enhancedData = { ...data };
  
  // Add province code
  enhancedData.province = province;
  
  // Add province-specific fields
  switch (province) {
    case 'BC':
      // BC requires batch IDs for inventory
      if (logType === LOG_TYPES.INVENTORY && !enhancedData.batchId) {
        enhancedData.batchId = `BATCH-${Date.now()}`;
      }
      break;
      
    case 'ON':
      // Ontario requires detailed transaction data
      if (logType === LOG_TYPES.SALE) {
        enhancedData.transactionId = `ON-${Date.now()}`;
        enhancedData.detailedTaxBreakdown = {
          hst: enhancedData.tax * 0.8, // Example: 80% of tax is HST
          excise: enhancedData.tax * 0.2 // Example: 20% of tax is excise
        };
      }
      break;
      
    case 'QC':
      // Quebec requires French descriptions
      if (logType === LOG_TYPES.SALE && enhancedData.products) {
        // This is a simplified example - in a real app, you would have proper translations
        enhancedData.frenchDescription = `Vente de ${enhancedData.products.length} produits`;
      }
      break;
      
    case 'AB':
      // Alberta requires AGLC tracking numbers
      enhancedData.aglcTrackingNumber = `AGLC-${Date.now()}`;
      break;
      
    // Add more province-specific enhancements as needed
  }
  
  return enhancedData;
};

/**
 * Export compliance logs to a file
 * @param {Object} options - Export options
 * @returns {Promise<string>} Path to the exported file
 */
export const exportComplianceLogs = async (options = {}) => {
  try {
    const settings = await getComplianceSettings();
    const format = options.format || settings.exportFormat || EXPORT_FORMATS.CSV;
    const startDate = options.startDate || new Date(Date.now() - 86400000).toISOString(); // Default to yesterday
    const endDate = options.endDate || new Date().toISOString(); // Default to today
    const logType = options.logType; // Optional filter by log type
    
    // Get logs to export
    const logs = await getComplianceLogs({
      type: logType,
      startDate,
      endDate
    });
    
    if (logs.length === 0) {
      throw new Error('No logs found for the specified criteria');
    }
    
    // Format logs based on province and format
    const formattedData = formatLogsForExport(logs, format, settings.province);
    
    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const typeStr = logType ? `_${logType}` : '';
    const filename = `cannaflow_compliance_${settings.province}${typeStr}_${dateStr}.${format}`;
    
    // Save file
    let filePath;
    if (Platform.OS === 'web') {
      // For web, we'll return the data directly
      return {
        data: formattedData,
        filename,
        format
      };
    } else {
      // For mobile, save to file system
      const directory = FileSystem.documentDirectory + 'compliance/';
      
      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }
      
      filePath = directory + filename;
      await FileSystem.writeAsStringAsync(filePath, formattedData);
      
      // Share the file if requested
      if (options.share) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath);
        }
      }
      
      return filePath;
    }
  } catch (error) {
    console.error('Error exporting compliance logs:', error);
    throw error;
  }
};

/**
 * Format logs for export based on province and format
 * @param {Array} logs - Logs to format
 * @param {string} format - Export format
 * @param {string} province - Province code
 * @returns {string} Formatted data
 */
const formatLogsForExport = (logs, format, province) => {
  // Apply province-specific formatting
  const formattedLogs = logs.map(log => {
    // Clone the log to avoid modifying the original
    const formattedLog = JSON.parse(JSON.stringify(log));
    
    // Apply province-specific formatting
    switch (province) {
      case 'BC':
        // BC requires specific date format
        formattedLog.formatted_date = new Date(log.timestamp).toLocaleDateString('en-CA');
        break;
        
      case 'ON':
        // Ontario requires specific transaction IDs
        if (log.type === LOG_TYPES.SALE) {
          formattedLog.ontario_transaction_id = `ON-${log.id}`;
        }
        break;
        
      case 'QC':
        // Quebec requires French fields
        formattedLog.date_fr = new Date(log.timestamp).toLocaleDateString('fr-CA');
        if (log.type === LOG_TYPES.SALE) {
          formattedLog.montant_total = log.data.total;
          formattedLog.taxe = log.data.tax;
        }
        break;
    }
    
    return formattedLog;
  });
  
  // Format based on export format
  switch (format) {
    case EXPORT_FORMATS.CSV:
      return convertToCSV(formattedLogs, province);
      
    case EXPORT_FORMATS.JSON:
      return JSON.stringify(formattedLogs, null, 2);
      
    case EXPORT_FORMATS.XML:
      return convertToXML(formattedLogs, province);
      
    default:
      return JSON.stringify(formattedLogs, null, 2);
  }
};

/**
 * Convert logs to CSV format
 * @param {Array} logs - Logs to convert
 * @param {string} province - Province code
 * @returns {string} CSV data
 */
const convertToCSV = (logs, province) => {
  if (logs.length === 0) return '';
  
  // Get all unique keys from all logs
  const allKeys = new Set();
  logs.forEach(log => {
    Object.keys(log).forEach(key => allKeys.add(key));
    if (log.data) {
      Object.keys(log.data).forEach(key => allKeys.add(`data_${key}`));
    }
  });
  
  // Convert Set to Array and sort
  const headers = Array.from(allKeys).sort();
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  logs.forEach(log => {
    const row = headers.map(header => {
      if (header.startsWith('data_') && log.data) {
        const dataKey = header.substring(5);
        return formatCSVValue(log.data[dataKey]);
      } else {
        return formatCSVValue(log[header]);
      }
    });
    csv += row.join(',') + '\n';
  });
  
  return csv;
};

/**
 * Format a value for CSV
 * @param {any} value - Value to format
 * @returns {string} Formatted value
 */
const formatCSVValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
  if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
  return String(value);
};

/**
 * Convert logs to XML format
 * @param {Array} logs - Logs to convert
 * @param {string} province - Province code
 * @returns {string} XML data
 */
const convertToXML = (logs, province) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<complianceLogs province="${province}">\n`;
  
  logs.forEach(log => {
    xml += `  <log type="${log.type}">\n`;
    xml += `    <id>${log.id}</id>\n`;
    xml += `    <timestamp>${log.timestamp}</timestamp>\n`;
    
    if (log.data) {
      xml += '    <data>\n';
      Object.entries(log.data).forEach(([key, value]) => {
        xml += `      <${key}>${formatXMLValue(value)}</${key}>\n`;
      });
      xml += '    </data>\n';
    }
    
    xml += '  </log>\n';
  });
  
  xml += '</complianceLogs>';
  return xml;
};

/**
 * Format a value for XML
 * @param {any} value - Value to format
 * @returns {string} Formatted value
 */
const formatXMLValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Check for compliance issues
 * @returns {Promise<Array>} Array of compliance issues
 */
export const checkComplianceIssues = async () => {
  try {
    const settings = await getComplianceSettings();
    const issues = [];
    
    // Check for missing daily summaries
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const summaries = await getComplianceLogs({
      type: LOG_TYPES.DAILY_SUMMARY,
      startDate: `${yesterdayStr}T00:00:00.000Z`,
      endDate: `${yesterdayStr}T23:59:59.999Z`
    });
    
    if (summaries.length === 0) {
      issues.push({
        type: 'missing_summary',
        severity: 'high',
        message: `Missing daily summary for ${yesterdayStr}`,
        action: 'generate_summary',
        actionParams: { date: yesterdayStr }
      });
    }
    
    // Check for province-specific requirements
    switch (settings.province) {
      case 'ON':
        // Ontario requires detailed tax breakdowns
        const recentSales = await getComplianceLogs({
          type: LOG_TYPES.SALE,
          limit: 10
        });
        
        const salesWithoutTaxBreakdown = recentSales.filter(
          sale => !sale.data.detailedTaxBreakdown
        );
        
        if (salesWithoutTaxBreakdown.length > 0) {
          issues.push({
            type: 'missing_tax_breakdown',
            severity: 'medium',
            message: `${salesWithoutTaxBreakdown.length} sales missing detailed tax breakdown required for Ontario`,
            action: 'update_sales_tax',
            actionParams: { sales: salesWithoutTaxBreakdown }
          });
        }
        break;
        
      case 'QC':
        // Quebec requires French descriptions
        const recentLogs = await getComplianceLogs({
          limit: 20
        });
        
        const logsWithoutFrench = recentLogs.filter(
          log => log.type === LOG_TYPES.SALE && !log.data.frenchDescription
        );
        
        if (logsWithoutFrench.length > 0) {
          issues.push({
            type: 'missing_french',
            severity: 'medium',
            message: `${logsWithoutFrench.length} logs missing French descriptions required for Quebec`,
            action: 'add_french_descriptions',
            actionParams: { logs: logsWithoutFrench }
          });
        }
        break;
    }
    
    return issues;
  } catch (error) {
    console.error('Error checking compliance issues:', error);
    throw error;
  }
};

/**
 * Get retention status of logs
 * @returns {Promise<Object>} Retention status
 */
export const getRetentionStatus = async () => {
  try {
    const settings = await getComplianceSettings();
    const logs = await getComplianceLogs();
    
    // Calculate retention period in milliseconds
    const retentionPeriodMs = settings.retentionPeriod * 365 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    // Group logs by retention status
    const retentionGroups = {
      current: [], // Logs within retention period
      expiring: [], // Logs expiring within 30 days
      expired: [] // Logs past retention period
    };
    
    logs.forEach(log => {
      const logDate = new Date(log.timestamp).getTime();
      const ageMs = now - logDate;
      
      if (ageMs > retentionPeriodMs) {
        retentionGroups.expired.push(log);
      } else if (ageMs > retentionPeriodMs - (30 * 24 * 60 * 60 * 1000)) {
        retentionGroups.expiring.push(log);
      } else {
        retentionGroups.current.push(log);
      }
    });
    
    return {
      totalLogs: logs.length,
      currentLogs: retentionGroups.current.length,
      expiringLogs: retentionGroups.expiring.length,
      expiredLogs: retentionGroups.expired.length,
      retentionPeriod: settings.retentionPeriod,
      oldestLog: logs.length > 0 ? 
        logs.reduce((oldest, log) => 
          new Date(log.timestamp) < new Date(oldest.timestamp) ? log : oldest
        ).timestamp : null,
      newestLog: logs.length > 0 ? 
        logs.reduce((newest, log) => 
          new Date(log.timestamp) > new Date(newest.timestamp) ? log : newest
        ).timestamp : null
    };
  } catch (error) {
    console.error('Error getting retention status:', error);
    throw error;
  }
};

/**
 * Archive expired logs
 * @returns {Promise<Object>} Archive result
 */
export const archiveExpiredLogs = async () => {
  try {
    const settings = await getComplianceSettings();
    const retentionStatus = await getRetentionStatus();
    
    if (retentionStatus.expiredLogs === 0) {
      return {
        success: true,
        message: 'No expired logs to archive',
        archivedCount: 0
      };
    }
    
    // Get all logs
    const allLogs = await getComplianceLogs();
    
    // Calculate retention cutoff date
    const retentionPeriodMs = settings.retentionPeriod * 365 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - retentionPeriodMs);
    
    // Separate current and expired logs
    const currentLogs = allLogs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );
    
    const expiredLogs = allLogs.filter(log => 
      new Date(log.timestamp) < cutoffDate
    );
    
    // Export expired logs before removing
    const archiveFilename = await exportComplianceLogs({
      format: EXPORT_FORMATS.JSON,
      logs: expiredLogs
    });
    
    // Update storage with only current logs
    complianceLogsCache = currentLogs;
    await AsyncStorage.setItem(COMPLIANCE_LOGS_KEY, JSON.stringify(currentLogs));
    
    return {
      success: true,
      message: `Archived ${expiredLogs.length} expired logs`,
      archivedCount: expiredLogs.length,
      archiveFilename
    };
  } catch (error) {
    console.error('Error archiving expired logs:', error);
    throw error;
  }
};

// Initialize the compliance engine
initComplianceEngine().catch(error => {
  console.error('Failed to initialize compliance engine:', error);
});