# React native WebView

This is simple WebView application using React Native.

## Run instructions for iOS:
Cd to project path and run: <br> `«npx react-native run-ios»`

OR
1. Open */iOS/ReactNativeWebView.xcworkspace* in Xcode or run `«xed -b iOS»`
2. Hit the Run button

## Run instructions for Android:

Add the following lines to your *$HOME/.bash_profile* or *$HOME/.bashrc* (if you are using zsh then ~/.zprofile or ~/.zshrc) config file:<br>

```
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

> Please make sure you use the correct Android SDK path. You can find the actual location of the SDK in the Android Studio «Preferences» dialog, under **Appearance & Behavior** → **System Settings** → **Android SDK**.

1. Have an Android emulator running (quickest way to get started), or a device connected.
2. cd to your project path
3. run: 
`«npx react-native run-android»`

## For build APK
In /android folder <br>
`./gradlew assembleRelease`

## For change APP_ID
Renamed the project subfolder from: <br>
`android/app/src/main/java/MY/APP/OLD_ID/` <br>
to: <br>
`android/app/src/main/java/MY/APP/NEW_ID/`<br>

#### Then manually switched the old and new package ids:

In *android/app/src/main/java/MY/APP/NEW_ID/MainActivity.java*:<br>
`package MY.APP.NEW_ID;`

In *android/app/src/main/java/MY/APP/NEW_ID/MainApplication.java*:<br>
`package MY.APP.NEW_ID;`

In *android/app/src/main/AndroidManifest.xml*:<br>
`package="MY.APP.NEW_ID"`

In *android/app/build.gradle*:<br>
`applicationId "MY.APP.NEW_ID"`

And in *android/app/BUCK*:<br>
```
android_build_config(
  package="MY.APP.NEW_ID"
)
android_resource(
  package="MY.APP.NEW_ID"
)
```
<br>
Gradle cleaning in the end (in /android folder):<br>
`./gradlew clean`

## Change APP name
In *android/app/src/main/res/values/strings.xml*: <br>
`<string name="app_name">MY_APP_NEW_NAME</string>`

## Run instructions for Windows and macOS:
See [offical tutorial](https://aka.ms/ReactNative) for the latest up-to-date instructions.
