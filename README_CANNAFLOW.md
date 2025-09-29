# CannaFlow - Seamless from seed to sale

![CannaFlow Logo](assets/new/cannaflow-logo.png)

CannaFlow is a comprehensive point of sale system designed specifically for cannabis retailers. It provides a seamless experience from inventory management to sales processing.

## Features

- **Modern UI/UX**: Clean, intuitive interface designed for both desktop and mobile devices
- **Inventory Management**: Track products, categories, and stock levels
- **Sales Processing**: Quick and easy checkout process with support for cash and card payments
- **Voice Commands**: Add products to cart using voice recognition
- **Cash Float Management**: Track cash drawer operations and reconcile at the end of day
- **Responsive Design**: Works on web, tablets, and mobile devices

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cannaflow-app.git
   cd cannaflow-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the setup script:
   ```bash
   ./run-cannaflow.sh
   ```

### Running the App

- **Web**: `npm run web`
- **Android**: `npm run android`
- **iOS**: `npm run ios`

## Default Login

- **Username**: admin
- **Password**: admin123

## App Structure

- `/assets`: App icons, splash screen, and other static assets
- `/src/context`: React context providers for authentication, cart, etc.
- `/src/database`: Database initialization and schema
- `/src/navigation`: Navigation configuration
- `/src/screens`: App screens (Login, Sales, Inventory, etc.)
- `/src/services`: Business logic services
- `/src/theme`: Theme configuration and styling utilities
- `/src/utils`: Utility functions

## Key Screens

1. **Login Screen**: User authentication
2. **Dashboard**: Overview of sales and inventory
3. **Sales Screen**: Process sales with product search and cart management
4. **Inventory Screen**: Manage product inventory
5. **Settings Screen**: App configuration and user management
6. **Cash Float Screen**: Manage cash drawer operations

## Voice Commands

CannaFlow supports voice commands for adding products to the cart. Examples:

- "Add two grams of Blue Dream"
- "Add one Gummy Bears"
- "Add three pre-rolls"

## Development Notes

- The app uses React Native with Expo for cross-platform compatibility
- Theme is customizable through the `src/theme/theme.js` file
- Database uses SQLite for local storage
- Authentication uses secure token storage

## License

This project is proprietary software. All rights reserved.

## Contact

For support or inquiries, please contact support@cannaflow.com