// App.js

import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  PanResponder,
  Animated,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';

const App = () => {
  const [isConnected, setIsConnected] = useState(true); // Network connectivity state
  const [canGoBack, setCanGoBack] = useState(false); // Track if WebView can go back
  const [showExitScreen, setShowExitScreen] = useState(false); // Control exit screen visibility
  const [isAtTop, setIsAtTop] = useState(true); // Track if WebView is scrolled to top
  const [refreshing, setRefreshing] = useState(false); // Refreshing state
  const [loading, setLoading] = useState(false); // Loading state for WebView
  const webViewRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Define the injected JavaScript
  const injectedJavaScript = `
    (function() {
      window.addEventListener('scroll', function() {
        var scrollPosition = window.scrollY || document.documentElement.scrollTop;
        window.ReactNativeWebView.postMessage(JSON.stringify({ scrollY: scrollPosition }));
      });
    })();
  `;

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Cleanup the listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Back button handler
  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
      } else {
        // Show custom exit screen
        setShowExitScreen(true);
      }
      return true; // Prevent default behavior (exit app)
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // Cleanup the listener on unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [canGoBack]);

  // Refresh handler
  const onRefresh = () => {
    if (isConnected) {
      setRefreshing(true);
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    }
  };

  // Handle messages from WebView
  const onWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.scrollY !== undefined) {
        setIsAtTop(data.scrollY <= 0);
      }
    } catch (error) {
      console.error('Error parsing WebView message', error);
    }
  };

  // PanResponder for pull-to-refresh
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start the pan responder if the WebView is at the top and the user is pulling down
        return isAtTop && gestureState.dy > 0 && !refreshing;
      },
      onPanResponderMove: Animated.event(
        [null, { dy: scrollY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Trigger refresh if pulled down more than 100 pixels
          onRefresh();
        }
        Animated.timing(scrollY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // Animated style for refresh indicator
  const refreshIndicatorTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 150],
    extrapolate: 'clamp',
  });

  // Optional: Show confirmation before exiting
  const confirmExit = () => {
    Alert.alert(
      'Exit App',
      'Do you want to exit the app?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setShowExitScreen(false) },
        { text: 'Exit', onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {showExitScreen ? (
        // Show exit screen similar to offline view
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>Do you want to exit the app?</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setShowExitScreen(false)}
          >
            <Text style={styles.retryButtonText}>No, Stay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={confirmExit}
          >
            <Text style={styles.retryButtonText}>Yes, Exit</Text>
          </TouchableOpacity>
        </View>
      ) : isConnected ? (
        // When connected, render the WebView with custom pull-to-refresh
        <View style={{ flex: 1 }}>
          {/* Refresh Indicator */}
          {refreshing && (
            <Animated.View
              style={[
                styles.refreshIndicator,
                { transform: [{ translateY: refreshIndicatorTranslateY }] },
              ]}
            >
              <ActivityIndicator size="small" color="#0000ff" />
            </Animated.View>
          )}
          {/* WebView */}
          <Animated.View
            style={{ flex: 1 }}
            {...(isAtTop ? panResponder.panHandlers : {})}
          >
            <WebView
              ref={webViewRef}
              source={{ uri: 'https://infoserve.services/' }}
              style={{ flex: 1 }}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => {
                setLoading(false);
                setRefreshing(false); // Ensure refreshing is turned off after reload
              }}
              renderLoading={() => (
                loading && (
                  <ActivityIndicator
                    style={styles.loadingIndicator}
                    size="large"
                    color="#0000ff"
                  />
                )
              )}
              startInLoadingState={true}
              onNavigationStateChange={(navState) => {
                setCanGoBack(navState.canGoBack);
              }}
              injectedJavaScript={injectedJavaScript}
              onMessage={onWebViewMessage}
            />
          </Animated.View>
        </View>
      ) : (
        // When offline, show a message
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineText}>No Internet Connection</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  offlineText: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: '#0275d8',
    borderRadius: 5,
    marginVertical: 5, // Add margin between buttons
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18, // Half of ActivityIndicator width
    marginTop: -18,  // Half of ActivityIndicator height
  },
  refreshIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});

export default App;
