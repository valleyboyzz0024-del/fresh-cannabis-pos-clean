import { Alert } from 'react-native';

/**
 * Global error handler to catch and log all unhandled JavaScript exceptions
 * 
 * @param {Error} error - The error that was thrown
 * @param {boolean} isFatal - Whether the error is fatal (would crash the app)
 */
const ErrorHandler = (error, isFatal) => {
  // Log the error to the console for debugging
  console.error("Caught a global error:", error);
  console.error("Error stack:", error.stack);

  // Log additional information about the error context
  console.error("Error occurred at:", new Date().toISOString());
  
  // You can send this error to an external logging service here (e.g., Sentry, Bugsnag)

  if (isFatal) {
    // For fatal errors that crash the app, display a user-friendly alert
    Alert.alert(
      'An unexpected error occurred',
      'The app needs to restart to recover from a fatal error.',
      [{
        text: 'Restart',
        onPress: () => {
          // You can add logic to restart the app here
        },
      }]
    );
  }
};

export default ErrorHandler;