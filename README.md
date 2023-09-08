# Wearables mobile app
A mobile app using React Native along with iOS and Android native platforms for connecting/configuring sensors and managing pet/parent profiles.
#

## Description

The Wearables Clinical Trial (WCT) App owned by the Hill’s Pet Nutrition aims to make nutrition a linchpin of veterinary medicine. Pet parents must sign up to WCT App to record their pet behaviors and become eligible to receive a nutrition related experimental study with a customizable diet and evaluate its effects.
 
WCT App is a great tool for pet parents to record their pet activities using Hills approved digital sensor technology. It's a tracking sensor applied on the neck of your pet that connects to the WCT app (compatible on IOS and Android). 

Sync the WCT App installed in your mobile with the senor provided by the Hills pet nutrition seamlessly using Bluetooth. The paired phone must be near the sensor and connected to registered Wi-Fi to capture and upload data to the cloud.

Detailed interactive app walkthrough available with instructions on every page of the app that really speak to pet parents on 

How a pet parent can manage their account credentials.
Sensor Set up completed Dashboard when the sensor set up is completed generates a dashboard contains elements of basic components which provides a high-level overview of the various activities on the app to allow the user to monitor and access critical information associated with their pet behaviour, health, and other details.

#

## Features🔥
- Login 
- Register
- Forgot password
- Biometrics login
- Dashboard
- Pet Carousal
- Pet weight
- Image based scoring
- Eating enthusiasm
- Pet profile
- Sensor configuration
- Observations
- Quick video
- Account
- Support
- Add a new pet
- Questionnaire
- Point tracking 

## Web
- [Wearables Portal](https://portal.wearablesclinicaltrials.com/#/auth/login) `Visit us`



## Requirements
- [Node](https://nodejs.org) `6.x` or newer
- [React Native](http://facebook.github.io/react-native/docs/getting-started.html) for development
- [Xcode](https://developer.apple.com/xcode/) for iOS development
- [Android Studio](https://developer.android.com/studio/index.html) for Android development
- [Android SDK](https://developer.android.com/sdk/) `23.0.1` or newer for Android development
- [Android Marshmallow](https://www.android.com/versions/marshmallow-6-0/) or newer on your Android device to test properly

See [Getting Started](https://facebook.github.io/react-native/docs/getting-started.html) to install requirement tools.

## Stack
- [React JS](https://reactjs.org/) is a JavaScript library
- [React Native](https://facebook.github.io/react-native/) `0.63.2` for building native apps using react
- [Babel](http://babeljs.io/) `7.2.3` for ES6+ support
- [Apollo Client](https://www.apollographql.com/docs/react/) for Apollo Client
- [Babel](http://babeljs.io/) `7.2.3` for ES6+ support
- [Navigation for React Native](https://reactnavigation.org/) a router based on new React Native Navigation API
## Libraries
 
 - [@react-navigation/native](https://github.com/react-navigation/react-navigation) `6.0.2`
 - [@react-navigation/stack](https://www.npmjs.com/package/@react-navigation/native-stack) `6.1.0`
 - [@react-native-firebase/analytics](https://www.npmjs.com/package/@react-native-firebase/analytics) `5.11.11` 
 - [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler) `2.3.2`
 - [apollo-boost](https://www.npmjs.com/package/apollo-boost) `0.4.9`
 - [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) `3.3.0`
 - [react-native-bluetooth-status](https://www.npmjs.com/package/react-native-bluetooth-status) `1.5.1`
 - [react-native-screens](https://github.com/software-mansion/react-native-screens) `3.5.0`
 - [react-native-date-picker](https://www.npmjs.com/package/react-native-date-picker) `4.1.3`
 - [react-apollo](https://www.npmjs.com/package/react-apollo) `3.1.5`
 - [react-native-permissions](https://www.npmjs.com/package/react-native-permissions) `3.0.5`
 - [react-native-biometrics](https://www.npmjs.com/package/react-native-biometrics) `3.0.1`
 - [react-native-ble-manager](https://www.npmjs.com/package/react-native-ble-manager) `9.0.0`
 - [react-native-splash-screen](https://www.npmjs.com/package/react-native-splash-screen) `3.3.0` 
 - [rn-fetch-blob](https://www.npmjs.com/package/rn-fetch-blob) `0.12.0`
 - [react-native-media-meta](https://www.npmjs.com/package/react-native-media-meta) `0.0.11`
 - [react-native-fs](https://www.npmjs.com/package/react-native-fs) `2.18.0`
 - [formik](https://www.npmjs.com/package/formik) `2.2.9`
 - [@react-native-community/async-storage](https://github.com/react-native-async-storage/async-storage) `1.12.1`
 - [react-native-bluetooth-status](https://www.npmjs.com/package/react-native-bluetooth-status) `1.5.1`
- [react-native-photo-editor](https://www.npmjs.com/package/react-native-photo-editor) `1.0.13`
-  [react-native-camera](https://www.npmjs.com/package/react-native-camera) `4.2.1`

 
## Get Started


#### 1. Installation

On the command prompt run the following commands

```sh
$git clone git@bitbucket.org:ctepl/wearables-mobile-revamp.git

$ cd wearables-mobile-revamp/

$ npm install
```
#### 2. Simulate for iOS
```sh
$ cd ios && pod install
```

**Method One**

*   Open the project in Xcode from **ios/Wearables.xcodeproj**.

*   Hit the Run button.


**Method Two**

*   Run the following command in your terminal.

```sh
$ react-native run-ios
```

#### 3. Simulate for Android

**Method One**

*   Make sure you have an **Android emulator** installed and running.

*   Run the following command in your terminal.

```sh
$ react-native run-android
```

**Method Two**

*   Open the project in Android studio from **android** folder in the project's root folder.
*   Hit the Run button.



#### 4. How to Decide the Navigation

*  Navigation is decided By  **Stack navigator**  and names defined in [appNavigator.js](./appNavigator.js).

*  **LoginComponent**  will give you the Login page and so on.


## Debugger
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger) : The standalone app based on official debugger of React Native, and includes React Inspector / Redux DevTools

## Rename Project
Rename react-native app with just one command

![react-native-rename](https://cloud.githubusercontent.com/assets/5106887/24444940/cbcb0a58-149a-11e7-9714-2c7bf5254b0d.gif)

> This package assumes that you created your react-native project using `react-native init`.

#### Installation
```
npm install react-native-rename -g
```

Switch to new branch first
>Better to have back-up of the existing working repository before switching to a new branch.

```
git checkout -b {branch-name}
```
## Create files and folders

The file explorer is accessible using the button in left corner of the navigation bar. You can create a new file by clicking the **New file** button in the file explorer. You can also create folders by clicking the **New folder** button.

## Switch to another file

All your files and folders are presented as a tree in the file explorer. You can switch from one to another by clicking a file in the tree.

## Rename a file

You can rename the current file by clicking the file name in the navigation bar or by clicking the **Rename** button in the file explorer.

## Delete a file

You can delete the current file by clicking the **Remove** button in the file explorer. The file will be moved into the **Trash** folder and automatically deleted after 7 days of inactivity.