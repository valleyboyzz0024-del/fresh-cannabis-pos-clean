import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
  Alert,
  Text,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { 
  Surface,
  Title,
  Searchbar,
  Button,
  FAB,
  Chip,
  ActivityIndicator,
  IconButton,
  List,
  Divider,
  Portal,
  Dialog,
  Card
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { getProducts, searchProducts } from '../services/productService';
import { 
  startVoiceRecognition, 
  handleVoiceCommand, 
  isMobileVoiceSupported,
  requestVoicePermissions
} from '../services/voiceService';
import { theme, shadowStyles } from '../theme/theme';
import { getSafeThemeValue } from '../theme/themeHelper';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

const SalesScreen = ({ navigation }) => {
  const { addToCart, cartItems, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [voiceCommandResult, setVoiceCommandResult] = useState(null);
  
  const categories = ['All', 'Flower', 'Concentrate', 'Edible', 'Pre-Roll', 'Vape'];
  const types = ['All', 'Sativa', 'Indica', 'Hybrid', 'CBD'];
  
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);
  
  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };
  
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // Reset to filtered by category/type if no search query
      filterProductsByCategoryAndType(selectedCategory, selectedType);
      return;
    }
    
    try {
      const results = await searchProducts(query);
      
      // Apply category and type filters to search results if they're selected
      let filtered = results;
      
      if (selectedCategory && selectedCategory !== 'All') {
        filtered = filtered.filter(product => product.category === selectedCategory);
      }
      
      if (selectedType && selectedType !== 'All') {
        filtered = filtered.filter(product => product.type === selectedType);
      }
      
      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };
  
  const filterProductsByCategoryAndType = (category, type) => {
    let filtered = products;
    
    if (category && category !== 'All') {
      filtered = filtered.filter(product => product.category === category);
    }
    
    if (type && type !== 'All') {
      filtered = filtered.filter(product => product.type === type);
    }
    
    setFilteredProducts(filtered);
  };
  
  const handleCategorySelect = (category) => {
    const newCategory = category === selectedCategory ? null : category;
    setSelectedCategory(newCategory);
    filterProductsByCategoryAndType(newCategory, selectedType);
  };
  
  const handleTypeSelect = (type) => {
    const newType = type === selectedType ? null : type;
    setSelectedType(newType);
    filterProductsByCategoryAndType(selectedCategory, newType);
  };
  
  const handleAddToCart = (product, quantity = 1) => {
    addToCart(product, quantity);
  };
  
  const startListening = async () => {
    // For mobile devices, request permissions first
    if (Platform.OS !== 'web') {
      const hasPermission = await requestVoicePermissions();
      if (!hasPermission) {
        Alert.alert(
          'Microphone Permission',
          'We need microphone permission to use voice commands',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    setIsListening(true);
    setShowVoiceDialog(true);
    
    await startVoiceRecognition(
      async (result) => {
        console.log('Voice command received:', result);
        
        const commandResult = await handleVoiceCommand(result, handleAddToCart);
        setVoiceCommandResult(commandResult);
        
        // Keep dialog open to show the result
        setTimeout(() => {
          setIsListening(false);
          // Close dialog after showing result for a moment
          setTimeout(() => {
            setShowVoiceDialog(false);
            setVoiceCommandResult(null);
          }, 2000);
        }, 1000);
      },
      (error) => {
        console.error('Voice recognition error:', error);
        setIsListening(false);
        setShowVoiceDialog(false);
      }
    );
  };
  
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };
  
  const renderProductItem = ({ item }) => (
    <Card style={styles.productCard}>
      <TouchableOpacity
        style={styles.productCardContent}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.productImageContainer}>
          <MaterialCommunityIcons 
            name={
              item.category === 'Flower' ? 'cannabis' :
              item.category === 'Edible' ? 'food' :
              item.category === 'Concentrate' ? 'water' :
              item.category === 'Pre-Roll' ? 'cigar' :
              'package-variant'
            } 
            size={32} 
            color={theme.colors.primary} 
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
        </View>
        
        <View style={styles.productActions}>
          <IconButton
            icon="plus"
            color={theme.colors.primary}
            size={20}
            onPress={() => handleAddToCart(item)}
            style={styles.addButton}
          />
        </View>
      </TouchableOpacity>
    </Card>
  );
  
  const renderCategoryChip = (category) => (
    <Chip
      key={category}
      selected={selectedCategory === category}
      onPress={() => handleCategorySelect(category)}
      style={[
        styles.filterChip,
        selectedCategory === category && styles.selectedChip
      ]}
      textStyle={[
        styles.filterChipText,
        selectedCategory === category && styles.selectedChipText
      ]}
    >
      {category}
    </Chip>
  );
  
  const renderTypeChip = (type) => (
    <Chip
      key={type}
      selected={selectedType === type}
      onPress={() => handleTypeSelect(type)}
      style={[
        styles.filterChip,
        selectedType === type && styles.selectedChip
      ]}
      textStyle={[
        styles.filterChipText,
        selectedType === type && styles.selectedChipText
      ]}
    >
      {type}
    </Chip>
  );

  const renderCartItem = (item, index) => (
    <View key={`${item.id}-${index}`} style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={styles.cartItemActions}>
        <IconButton 
          icon="minus" 
          size={16} 
          color={theme.colors.text} 
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
          style={styles.quantityButton}
        />
        <Text style={styles.quantityText}>{item.quantity}x</Text>
        <IconButton 
          icon="plus" 
          size={16} 
          color={theme.colors.text} 
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
          style={styles.quantityButton}
        />
        <IconButton 
          icon="delete" 
          size={16} 
          color={theme.colors.error} 
          onPress={() => removeFromCart(item.id)}
          style={styles.deleteButton}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/new/cannaflow-logo.png')} 
            style={styles.headerLogo} 
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight}>
          <IconButton 
            icon="account" 
            color={theme.colors.text} 
            size={24} 
            onPress={() => navigation.navigate('Settings')}
          />
          <IconButton 
            icon="cog" 
            color={theme.colors.text} 
            size={24} 
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>

      <View style={styles.content}>
        {/* Products Section - Left Side */}
        <View style={styles.productsSection}>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search products..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchBar}
              iconColor={theme.colors.primary}
              inputStyle={{ color: theme.colors.text }}
            />
          </View>
          
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              {categories.map(renderCategoryChip)}
            </ScrollView>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              {types.map(renderTypeChip)}
            </ScrollView>
          </View>
          
          <View style={styles.productsListContainer}>
            {loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading products...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.productsList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                    tintColor={theme.colors.primary}
                  />
                }
                numColumns={isTablet ? 2 : 1}
                key={isTablet ? 'two-columns' : 'one-column'}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="package-variant" size={48} color={theme.colors.disabled} />
                    <Text style={styles.emptyStateText}>No products found</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>

        {/* Order Summary Section - Right Side */}
        <View style={styles.orderSection}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>Current Order</Text>
          </View>

          <ScrollView style={styles.cartItemsContainer}>
            {cartItems.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialCommunityIcons name="cart-outline" size={48} color={theme.colors.disabled} />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            ) : (
              cartItems.map(renderCartItem)
            )}
          </ScrollView>

          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (8%):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(total * 0.08)}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total * 1.08)}</Text>
            </View>
          </View>

          <View style={styles.orderActions}>
            <Button 
              mode="outlined" 
              icon="tag-outline" 
              style={styles.discountButton}
              onPress={() => Alert.alert('Discount', 'Discount feature coming soon')}
              disabled={cartItems.length === 0}
            >
              Add Discount
            </Button>
            <Button 
              mode="contained" 
              icon="cash-register" 
              style={styles.cashButton}
              onPress={() => navigation.navigate('Cart')}
              disabled={cartItems.length === 0}
            >
              CASH
            </Button>
            <Button 
              mode="contained" 
              icon="credit-card" 
              style={styles.cardButton}
              onPress={() => navigation.navigate('Cart')}
              disabled={cartItems.length === 0}
            >
              CARD
            </Button>
          </View>
        </View>
      </View>
      
      <FAB
        style={styles.voiceFab}
        icon={isListening ? "microphone" : "microphone-outline"}
        color={isListening ? theme.colors.error : theme.colors.text}
        onPress={startListening}
        loading={isListening}
      />
      
      <Portal>
        <Dialog
          visible={showVoiceDialog}
          onDismiss={() => !isListening && setShowVoiceDialog(false)}
          style={styles.voiceDialog}
        >
          <View style={styles.voiceDialogContent}>
            {isListening ? (
              <>
                <MaterialCommunityIcons 
                  name="microphone" 
                  size={48} 
                  color={theme.colors.primary}
                  style={styles.pulsingIcon}
                />
                <Text style={styles.voiceDialogText}>
                  Listening... Try saying "Add two grams of Blue Dream"
                </Text>
              </>
            ) : voiceCommandResult ? (
              <>
                <MaterialCommunityIcons 
                  name={voiceCommandResult.success ? "check-circle" : "alert-circle"} 
                  size={48} 
                  color={voiceCommandResult.success ? theme.colors.success : theme.colors.error}
                />
                <Text style={styles.voiceDialogText}>
                  {voiceCommandResult.message}
                </Text>
              </>
            ) : null}
          </View>
        </Dialog>
      </Portal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Seamless from seed to sale</Text>
      </View>
    </SafeAreaView>
  );
};

import { Image } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerLogo: {
    width: 120,
    height: 40
  },
  headerRight: {
    flexDirection: 'row'
  },
  content: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column'
  },
  productsSection: {
    flex: isTablet ? 3 : 1,
    backgroundColor: theme.colors.background
  },
  orderSection: {
    flex: isTablet ? 2 : 0,
    height: isTablet ? '100%' : 'auto',
    backgroundColor: theme.colors.surface,
    borderLeftWidth: isTablet ? 1 : 0,
    borderLeftColor: theme.colors.border
  },
  searchContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface
  },
  searchBar: {
    backgroundColor: theme.colors.background,
    elevation: 2
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    paddingBottom: 8
  },
  filtersScroll: {
    paddingHorizontal: 8,
    marginBottom: 8
  },
  filterChip: {
    marginHorizontal: 4,
    backgroundColor: theme.colors.background
  },
  selectedChip: {
    backgroundColor: theme.colors.primary
  },
  filterChipText: {
    color: theme.colors.text
  },
  selectedChipText: {
    color: '#000000'
  },
  productsListContainer: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.text
  },
  productsList: {
    padding: 16
  },
  productCard: {
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    margin: 6,
    flex: 1
  },
  productCardContent: {
    flexDirection: 'row',
    padding: 16
  },
  productImageContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.text
  },
  productCategory: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 4
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  productActions: {
    justifyContent: 'center'
  },
  addButton: {
    margin: 0
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyStateText: {
    marginTop: 10,
    color: theme.colors.disabled
  },
  orderHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  cartItemsContainer: {
    flex: 1,
    padding: 16
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyCartText: {
    marginTop: 10,
    color: theme.colors.disabled
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  cartItemInfo: {
    flex: 1
  },
  cartItemName: {
    fontSize: 14,
    color: theme.colors.text
  },
  cartItemPrice: {
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: 4
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    margin: 0,
    padding: 0
  },
  quantityText: {
    color: theme.colors.text,
    marginHorizontal: 4
  },
  deleteButton: {
    margin: 0,
    padding: 0
  },
  orderSummary: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  summaryLabel: {
    color: theme.colors.text,
    opacity: 0.7
  },
  summaryValue: {
    color: theme.colors.text
  },
  divider: {
    marginVertical: 8,
    backgroundColor: theme.colors.border
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  orderActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  discountButton: {
    flex: 1,
    marginRight: 8,
    borderColor: theme.colors.primary
  },
  cashButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: theme.colors.primary
  },
  cardButton: {
    flex: 1,
    backgroundColor: theme.colors.primary
  },
  voiceFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: isTablet ? 16 : 80,
    backgroundColor: theme.colors.surface
  },
  voiceDialog: {
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  voiceDialogContent: {
    padding: 24,
    alignItems: 'center'
  },
  voiceDialogText: {
    marginTop: 16,
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: 16
  },
  pulsingIcon: {
    opacity: 0.8
  },
  footer: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7
  }
});

export default SalesScreen;