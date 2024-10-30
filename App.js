// App.js

import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';

const App = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Network connectivity state
  const webViewRef = useRef(null);

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

  // Refresh handler
  const onRefresh = () => {
    if (isConnected) {
      setRefreshing(true);
      if (webViewRef.current) {
        webViewRef.current.reload();
      } else {
        setRefreshing(false);
      }
    }
  };

  // Called when the WebView finishes loading
  const onLoadEnd = () => {
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isConnected ? (
        // When connected, render the WebView with loading indicator
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <WebView
            ref={webViewRef}
            source={{ uri: 'http://192.168.1.6/InfoServe/client/index.html' }}
            style={{ flex: 1 }}
            onLoadEnd={onLoadEnd}
            renderLoading={() => (
              <ActivityIndicator
                style={styles.loadingIndicator}
                size="large"
                color="#0000ff"
              />
            )}
            startInLoadingState={true}
          />
        </ScrollView>
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
  },
  offlineText: {
    fontSize: 20,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: '#0275d8',
    borderRadius: 5,
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
});

export default App;
