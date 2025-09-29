import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { searchProducts } from './productService';
import { getTodayFloat, initializeDailyFloat, closeDailyFloat } from './cashFloatService';
import { getProducts } from './productService';

// Intent types
const INTENT_TYPES = {
  ADD_TO_CART: 'add_to_cart',
  SHOW_INVENTORY: 'show_inventory',
  OPEN_FLOAT: 'open_float',
  CLOSE_FLOAT: 'close_float',
  SEARCH_PRODUCTS: 'search_products',
  UNKNOWN: 'unknown',
  ERROR: 'error'
};

// Regular expressions for parsing commands
const ADD_CART_REGEX = /\b(add|put|include)\b.+\b(to cart|to order|to basket)\b/i;
const QUANTITY_REGEX = /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/i;
const PRODUCT_TYPE_REGEX = /\b(sativa|indica|hybrid|flower|edible|concentrate|cbd|oil|gummies|pre-roll|vape)\b/i;
const PRODUCT_NAME_REGEX = /\b(blue dream|og kush|sour diesel|girl scout cookies|purple punch|jack herer|northern lights|pineapple express|cbd oil|thc gummies)\b/i;
const INVENTORY_REGEX = /\b(show|display|list|view)\b.+\b(inventory|stock|products)\b/i;
const INVENTORY_FILTER_REGEX = /\b(for|of|with)\b.+\b(sativa|indica|hybrid|flower|edible|concentrate|cbd|oil|gummies|pre-roll|vape)\b/i;
const OPEN_FLOAT_REGEX = /\b(open|start|initialize|begin)\b.+\b(float|cash float|register|till)\b/i;
const CLOSE_FLOAT_REGEX = /\b(close|end|finalize)\b.+\b(float|cash float|register|till)\b/i;
const FLOAT_AMOUNT_REGEX = /\b(with|for|of|at)\b.+\$([\d,.]+)\b/i;

// Map word numbers to digits
const WORD_TO_NUMBER = {
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
  'ten': 10
};

/**
 * Parse a natural language command and determine the intent
 * @param {string} command - The natural language command
 * @returns {Object} The parsed command with intent and parameters
 */
export const parseCommand = async (command) => {
  try {
    if (!command) return { type: INTENT_TYPES.UNKNOWN };
    
    // Convert command to lowercase for easier matching
    const lowerCommand = command.toLowerCase();
    
    // Check for add to cart intent
    if (ADD_CART_REGEX.test(lowerCommand)) {
      return await parseAddToCartCommand(lowerCommand, command);
    }
    
    // Check for show inventory intent
    if (INVENTORY_REGEX.test(lowerCommand)) {
      return await parseInventoryCommand(lowerCommand, command);
    }
    
    // Check for open float intent
    if (OPEN_FLOAT_REGEX.test(lowerCommand)) {
      return await parseOpenFloatCommand(lowerCommand, command);
    }
    
    // Check for close float intent
    if (CLOSE_FLOAT_REGEX.test(lowerCommand)) {
      return await parseCloseFloatCommand(lowerCommand, command);
    }
    
    // If no intent matches
    return {
      type: INTENT_TYPES.UNKNOWN,
      originalCommand: command
    };
  } catch (error) {
    console.error('Error parsing command:', error);
    return {
      type: INTENT_TYPES.ERROR,
      error,
      originalCommand: command
    };
  }
};

/**
 * Parse an add to cart command
 * @param {string} lowerCommand - Lowercase command
 * @param {string} originalCommand - Original command
 * @returns {Object} Parsed command with product and quantity
 */
const parseAddToCartCommand = async (lowerCommand, originalCommand) => {
  // Extract quantity
  let quantity = 1;
  const quantityMatch = lowerCommand.match(QUANTITY_REGEX);
  if (quantityMatch) {
    const quantityText = quantityMatch[1];
    quantity = WORD_TO_NUMBER[quantityText] || parseInt(quantityText, 10) || 1;
  }
  
  // Extract product type or name
  let productQuery = '';
  const typeMatch = lowerCommand.match(PRODUCT_TYPE_REGEX);
  const nameMatch = lowerCommand.match(PRODUCT_NAME_REGEX);
  
  if (nameMatch) {
    productQuery = nameMatch[1];
  } else if (typeMatch) {
    productQuery = typeMatch[1];
  }
  
  // If we have a product query, search for matching products
  if (productQuery) {
    const products = await searchProducts(productQuery);
    
    if (products && products.length > 0) {
      // Use the first matching product
      const product = products[0];
      
      return {
        type: INTENT_TYPES.ADD_TO_CART,
        product,
        quantity,
        originalCommand
      };
    }
  }
  
  // If we couldn't find a matching product
  return {
    type: INTENT_TYPES.SEARCH_PRODUCTS,
    query: productQuery || lowerCommand,
    originalCommand
  };
};

/**
 * Parse an inventory command
 * @param {string} lowerCommand - Lowercase command
 * @param {string} originalCommand - Original command
 * @returns {Object} Parsed command with filter parameters
 */
const parseInventoryCommand = async (lowerCommand, originalCommand) => {
  // Check for filter criteria
  let filter = null;
  const filterMatch = lowerCommand.match(INVENTORY_FILTER_REGEX);
  
  if (filterMatch) {
    const filterType = filterMatch[2];
    
    // Determine filter type
    if (['sativa', 'indica', 'hybrid'].includes(filterType)) {
      filter = { field: 'type', value: filterType.charAt(0).toUpperCase() + filterType.slice(1) };
    } else if (['flower', 'edible', 'concentrate'].includes(filterType)) {
      filter = { field: 'category', value: filterType.charAt(0).toUpperCase() + filterType.slice(1) };
    } else {
      filter = { field: 'name', value: filterType };
    }
  }
  
  // Get products based on filter
  let products;
  if (filter) {
    const allProducts = await getProducts();
    products = allProducts.filter(product => 
      product[filter.field].toLowerCase().includes(filter.value.toLowerCase())
    );
  } else {
    products = await getProducts();
  }
  
  return {
    type: INTENT_TYPES.SHOW_INVENTORY,
    filter,
    products,
    originalCommand
  };
};

/**
 * Parse an open float command
 * @param {string} lowerCommand - Lowercase command
 * @param {string} originalCommand - Original command
 * @returns {Object} Parsed command with float amount
 */
const parseOpenFloatCommand = async (lowerCommand, originalCommand) => {
  // Extract amount
  let amount = 200; // Default amount
  const amountMatch = lowerCommand.match(FLOAT_AMOUNT_REGEX);
  
  if (amountMatch && amountMatch[2]) {
    amount = parseFloat(amountMatch[2].replace(/,/g, ''));
  }
  
  return {
    type: INTENT_TYPES.OPEN_FLOAT,
    amount,
    originalCommand
  };
};

/**
 * Parse a close float command
 * @param {string} lowerCommand - Lowercase command
 * @param {string} originalCommand - Original command
 * @returns {Object} Parsed command with float amount
 */
const parseCloseFloatCommand = async (lowerCommand, originalCommand) => {
  // Extract amount
  let amount = null;
  const amountMatch = lowerCommand.match(FLOAT_AMOUNT_REGEX);
  
  if (amountMatch && amountMatch[2]) {
    amount = parseFloat(amountMatch[2].replace(/,/g, ''));
  }
  
  // Get today's float
  const todayFloat = await getTodayFloat();
  
  return {
    type: INTENT_TYPES.CLOSE_FLOAT,
    amount,
    todayFloat,
    originalCommand
  };
};

/**
 * Execute a parsed command
 * @param {Object} parsedCommand - The parsed command object
 * @param {Object} callbacks - Callback functions for different actions
 * @returns {Object} Result of the command execution
 */
export const executeCommand = async (parsedCommand, callbacks = {}) => {
  const { 
    onAddToCart, 
    onShowInventory, 
    onOpenFloat, 
    onCloseFloat,
    onUnknownCommand,
    onError
  } = callbacks;
  
  try {
    switch (parsedCommand.type) {
      case INTENT_TYPES.ADD_TO_CART:
        if (onAddToCart) {
          await onAddToCart(parsedCommand.product, parsedCommand.quantity);
        }
        return {
          success: true,
          message: `Added ${parsedCommand.quantity} ${parsedCommand.product.name} to cart`,
          response: `Added ${parsedCommand.quantity} ${parsedCommand.product.name} to your cart.`,
          result: parsedCommand
        };
        
      case INTENT_TYPES.SHOW_INVENTORY:
        if (onShowInventory) {
          await onShowInventory(parsedCommand.filter, parsedCommand.products);
        }
        
        const filterText = parsedCommand.filter 
          ? `for ${parsedCommand.filter.value}` 
          : '';
          
        return {
          success: true,
          message: `Showing inventory ${filterText}`,
          response: `Here's the inventory ${filterText}. I found ${parsedCommand.products.length} products.`,
          result: parsedCommand
        };
        
      case INTENT_TYPES.OPEN_FLOAT:
        if (onOpenFloat) {
          await onOpenFloat(parsedCommand.amount);
        } else {
          await initializeDailyFloat(parsedCommand.amount);
        }
        return {
          success: true,
          message: `Opened float with $${parsedCommand.amount.toFixed(2)}`,
          response: `I've opened the cash float with $${parsedCommand.amount.toFixed(2)}.`,
          result: parsedCommand
        };
        
      case INTENT_TYPES.CLOSE_FLOAT:
        if (onCloseFloat) {
          await onCloseFloat(parsedCommand.amount);
        } else if (parsedCommand.amount !== null) {
          await closeDailyFloat(parsedCommand.amount);
        }
        
        const amountText = parsedCommand.amount !== null 
          ? `with $${parsedCommand.amount.toFixed(2)}` 
          : '';
          
        return {
          success: true,
          message: `Closed float ${amountText}`,
          response: `I've closed the cash float ${amountText}.`,
          result: parsedCommand
        };
        
      case INTENT_TYPES.SEARCH_PRODUCTS:
        return {
          success: false,
          message: `Couldn't find a product matching "${parsedCommand.query}"`,
          response: `I couldn't find a product matching "${parsedCommand.query}". Please try again with a different product name.`,
          result: parsedCommand
        };
        
      case INTENT_TYPES.UNKNOWN:
        if (onUnknownCommand) {
          onUnknownCommand(parsedCommand.originalCommand);
        }
        return {
          success: false,
          message: 'Command not recognized',
          response: "I'm sorry, I didn't understand that command. Try saying something like 'Add 2 Blue Dream to cart' or 'Show inventory for sativa'.",
          result: parsedCommand
        };
        
      case INTENT_TYPES.ERROR:
        if (onError) {
          onError(parsedCommand.error);
        }
        return {
          success: false,
          message: 'Error processing command',
          response: "Sorry, there was an error processing your command. Please try again.",
          result: parsedCommand
        };
        
      default:
        if (onUnknownCommand) {
          onUnknownCommand(parsedCommand.originalCommand);
        }
        return {
          success: false,
          message: 'Unknown result type',
          response: "I'm not sure how to process that command. Please try something else.",
          result: parsedCommand
        };
    }
  } catch (error) {
    console.error('Error executing command:', error);
    if (onError) {
      onError(error);
    }
    return {
      success: false,
      message: 'Error handling command',
      response: "Sorry, there was an error while processing your request. Please try again.",
      error
    };
  }
};

/**
 * Process a natural language command
 * @param {string} command - The natural language command
 * @param {Object} callbacks - Callback functions for different actions
 * @returns {Object} Result of the command processing
 */
export const processCommand = async (command, callbacks = {}) => {
  try {
    const parsedCommand = await parseCommand(command);
    return await executeCommand(parsedCommand, callbacks);
  } catch (error) {
    console.error('Error processing command:', error);
    if (callbacks.onError) {
      callbacks.onError(error);
    }
    return {
      success: false,
      message: 'Error processing command',
      response: "Sorry, there was an error processing your command. Please try again.",
      error
    };
  }
};

/**
 * Speak a response using text-to-speech
 * @param {string} text - The text to speak
 * @param {Object} options - Speech options
 */
export const speakResponse = (text, options = {}) => {
  Speech.speak(text, {
    language: 'en',
    pitch: 1.0,
    rate: 0.9,
    ...options
  });
};

/**
 * Check if the device supports voice recognition
 * @returns {boolean} Whether voice recognition is supported
 */
export const isVoiceRecognitionSupported = () => {
  // In a real app, you would check if the device supports voice recognition
  // For now, we'll return true for mobile platforms and false for web
  return Platform.OS !== 'web';
};

/**
 * Request voice recognition permissions
 * @returns {Promise<boolean>} Whether permissions were granted
 */
export const requestVoicePermissions = async () => {
  // In a real app, you would request microphone permissions
  // For now, we'll just return true
  return true;
};

// Export intent types for use in other components
export { INTENT_TYPES };