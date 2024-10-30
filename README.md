---

```markdown
# InfoServeAndroid

A React Native application for InfoServe that renders a WebView, complete with pull-to-refresh functionality, a loading indicator, and offline handling. This app is specifically designed for Android devices.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Set Up the Android Environment](#3-set-up-the-android-environment)
  - [4. Connect Your Android Device](#4-connect-your-android-device)
  - [5. Run the App on Your Android Device](#5-run-the-app-on-your-android-device)
- [Additional Configurations](#additional-configurations)
  - [Changing the App Name](#changing-the-app-name)
  - [Changing the App Icon](#changing-the-app-icon)
- [Building a Release APK](#building-a-release-apk)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

---

## Features

- **WebView Rendering**: Displays web content within the app.
- **Pull-to-Refresh**: Allows users to refresh the page by swiping down.
- **Loading Indicator**: Shows a spinner while the page is loading.
- **Offline Handling**: Displays a message when there is no internet connection.
- **Back Button Handling**: Navigates back within the WebView on Android hardware back button press.

---

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Operating System**: macOS
- **Android Device**: An Android phone with Developer Options enabled
- **Node.js**: Version 12 or higher
- **Watchman**: For file watching (optional but recommended)
- **Java Development Kit (JDK)**: Version 8 or higher
- **Android Studio**: Installed with Android SDK

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/InfoServe-Services/InfoServeAndroid.gi
cd InfoServeApp
```

### 2. Install Dependencies

Install the necessary npm packages:

```bash
npm install
```

### 3. Set Up the Android Environment

#### **3.1. Install Java Development Kit (JDK)**

Ensure JDK is installed:

```bash
brew install --cask temurin
```

#### **3.2. Install Android Studio**

Download and install Android Studio from the [official website](https://developer.android.com/studio).

#### **3.3. Set Up Android SDK**

- Open **Android Studio**.
- Go to **Preferences** > **Appearance & Behavior** > **System Settings** > **Android SDK**.
- Under **SDK Platforms**, install the latest Android SDK.
- Under **SDK Tools**, ensure the following are installed:
  - Android SDK Build-Tools
  - Android SDK Platform-Tools
  - Android SDK Tools

#### **3.4. Configure Environment Variables**

Add the following lines to your `~/.bash_profile` or `~/.zshrc`:

```bash
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/emulator
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
```

Then, source the file:

```bash
source ~/.zshrc  # or source ~/.bash_profile
```

### 4. Connect Your Android Device

#### **4.1. Enable Developer Options and USB Debugging**

- On your Android device, go to **Settings** > **About Phone** > **Build Number**.
- Tap **Build Number** seven times to enable Developer Options.
- Go back to **Settings** > **Developer Options**.
- Enable **USB Debugging**.

#### **4.2. Connect the Device**

- Connect your Android device to your Mac using a USB cable.
- Verify the connection:

  ```bash
  adb devices
  ```

  Your device should appear in the list.

### 5. Run the App on Your Android Device

#### **5.1. Start the Metro Bundler**

In your project directory, start the Metro Bundler:

```bash
npx react-native start
```

Leave this terminal window open.

#### **5.2. Run the App**

In a new terminal window:

```bash
npx react-native run-android
```

This command builds the app and installs it on your connected Android device.

---

## Additional Configurations

### Changing the App Name

1. Open `android/app/src/main/res/values/strings.xml`.
2. Modify the name to `<string name="app_name">InfoServe</string>`.
3. Rebuild the app:

   ```bash
   npx react-native run-android
   ```

### Changing the App Icon

#### **Prepare Your Icon Images**

Create your app icon in the following sizes:

- **mdpi**: 48x48 pixels
- **hdpi**: 72x72 pixels
- **xhdpi**: 96x96 pixels
- **xxhdpi**: 144x144 pixels
- **xxxhdpi**: 192x192 pixels

Ensure your icons are in PNG format and named `ic_launcher.png`.

#### **Replace the Default Icons**

Place your icon files in the respective folders:

- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

#### **Rebuild the App**

```bash
npx react-native run-android
```

---

## Building a Release APK

To generate a release APK that can be distributed:

### **1. Generate a Keystore**

```bash
keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias \
 -keyalg RSA -keysize 2048 -validity 10000
```

- You'll be prompted to enter passwords and some personal information.
- Move the `my-release-key.keystore` file to `android/app/`:

  ```bash
  mv my-release-key.keystore android/app/
  ```

### **2. Configure Gradle Variables**

Create or edit `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your-keystore-password
MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
```

**Note**: Replace `your-keystore-password` and `your-key-password` with the passwords you set when generating the keystore.

### **3. Set Up Signing Config in `build.gradle`**

Edit `android/app/build.gradle`:

```gradle
android {
    // ... existing configurations ...

    signingConfigs {
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            shrinkResources false
            // ... other configurations ...
        }
    }
}
```

### **4. Build the APK**

From the `android` directory:

```bash
cd android
./gradlew assembleRelease
```

- The APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.

### **5. Install the APK on Your Device**

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## Troubleshooting

### Metro Bundler Issues

If you encounter errors related to the Metro Bundler, try resetting the cache:

```bash
npx react-native start --reset-cache
```

### Permission Errors

Ensure you have the necessary permissions in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Network Connectivity Issues

If the app cannot access your local network URL:

- Ensure your Android device is on the same network as your server.
- For Android 9.0 (API level 28) and above, add `android:usesCleartextTraffic="true"` to your `<application>` tag in `AndroidManifest.xml`:

  ```xml
  <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:usesCleartextTraffic="true"
      ...>
  ```

### Build Failures

If the build fails, try cleaning the project:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## License

This project is licensed under the MIT License.

---

## Contact

For any questions or support, please open an issue on the GitHub repository.