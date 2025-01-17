# Project setup

- Before anything else, request access to the Club Murray Organisation on GitHub. This can be requested from Owners on [this list](https://github.com/orgs/and-murray/people) - you may need another ANDi on the project to access this list on GitHub for you so you know who to ask to grant you access.
- Follow the steps on the [React Native docs](https://reactnative.dev/docs/environment-setup) to get setup. You want to follow the _'Installing dependencies'_ instructions under the React Native CLI Quickstart tab for both iOS and Android.
  - For the Ruby section, [RVM](https://rvm.io/) is recommended to make it easy to manage Ruby versions.

## Cloning the project

- Clone the project onto your machine using either SSH or HTTPS. We recommend using SSH, which requires you to setup an [SSH key](https://github.com/settings/keys). Once you've [generated an SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) and [added it to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account), you should be able to clone the project in the usual fashion.

## Setting Up Env Files

- See the .env.template file for how the environment files should be setup.
- For those with access to `and-murray` org some of these values can be found in the org variables.
  - These are in the format `MURRAY_APPS_DEV_REACT_APP_FIREBASE_FUNCTIONS_BASE_URL`
  - The `MURRAY_APPS_DEV` or `MURRAY_APPS_PROD` refers to the environment.
  - The `REACT_APP_FIREBASE_FUNCTIONS_BASE_URL` refers to the key part. This will match one of the keys in .env.template
- Create two .env files called:
  - `.env.production`
  - `.env.development`
- Assign the correct key value pairs.

## Getting the app running

- Once you have completed the environment setup and have the project cloned, you're ready to get the app running.
- Navigate to the root folder of the project in a terminal and perform a `yarn install`. We're using yarn in this project instead of npm, so you should not be using npm to execute any commands.
  - If you do not have yarn installed, install it either via npm or brew (instructions [here](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable))
- If any of the steps with ruby or bundler fail, check the [Troubleshooting section](#Troubleshooting).
- Install [RVM](https://rvm.io/) if you haven't already. This allows you to have different Ruby versions for different projects/directories on your machine.
- Navigate to the ios folder (`cd ios`) and perform `bundle install`
  - If you get the error _'your ruby version is x but your gemfile is y'_, try entering these commands: `rvm install y` followed by `rvm use y`, then retry the `bundle install`.
- Then perform a `bundle exec pod install`
  - If you get an error about compatible versions of firebase/coreOnly, run `bundle exec pod install --repo-update`
- Drag and drop the NetSkope cert onto both your Android emulator and iOS simulator. On your Mac, this can be found at `/Library/Application\ Support/Netskope/STAgent/data/nscacert.pem`
- Once all the above commands have succeeded, then:
  - to build and install the Android app `yarn android:debug:dev`
  - to build and install the iOS app `yarn ios:debug:dev`
  - This will run the metro bundler (it may show a system dialog asking to open a terminal). This needs to be running whenever you want to run the app. From this menu, you can run iOS or Android by pressing 'i' or 'a' respectively.

### iOS Profiles

We use match to manage certificates & profiles for running on devices.

- You will need the match password. Another dev will have access to this or if you have access see the CI Variables.
- You will need to make sure you have followed [this guide](https://docs.google.com/document/d/14oZZ7y6U2S_buIJgbKvhVqPE9CfNQI0fP_1GbcQ70jw/edit?usp=sharing)
- Occasionally you may need to rerun `gcloud auth application-default` if credentials have expired.
- Run `yarn ios:setup` to install the certificates.

# Firebase

## Build variant/Configurations/Schemes/Flavours

### iOS

On iOS we have one Scheme but multiple build configurations:

- Debug-Dev
- Debug-Production
- Release-Dev
- Release-Production

These are a combination of the build settings (Debug & Release) and the backend environment that they hit. The
`GoogleService-Info-Dev.plist` & `GoogleService-Info-Prod.plist` are stored in `ios/Firebase`. A build phase script pulls out the correct one based on the configuration and renames it correctly.

### Android

On Android there are the following build variants:

- DevelopmentDebug
- DevelopmentRelease
- ProductionDebug
- ProductionRelease

The above are combinations of `productFlavours` and `buildTypes`.

`productFlavours`_These are for separate Firebase instances, keeping data separate for each backend._

- Development
- Production
  The `google-services.json` files are in separate folders for each flavour: `android/app/src/development/google-services.json` & `android/app/src/production/google-services.json`

`buildTypes` _These are for different types of builds, the release type is optimised and doesn't have any debugging or developer features._

- Debug
- Release

This is all configured from `android/app/build.gradle`.

## Setting up Firebase emulators

See the [Firebase docs](https://firebase.google.com/docs/cli/?authuser=0#windows-npm) for the most up to date instructions.

- `yarn install` will ensure the cli is installed as it is in the package.json [This guide has the most up to date commands](https://firebase.google.com/docs/cli/?authuser=0#windows-npm)
- Run the following to install the firestore emulator: `firebase setup:emulators:firestore`. See [this](https://firebase.google.com/docs/firestore/security/test-rules-emulator?hl=en&authuser=0) for more up to date setup if required.
- Install version 17 of the openJDK. Instructions [here](https://medium.com/@datatec.studio/3-steps-to-install-openjdk-11-on-macos-3ae0e10dfa1a)
- To Run the firebase emulator run `firebase emulators:start --only firestore --import=EmulatorData --export-on-exit=EmulatorData`.
  - This command imports the emulator data and exports it. If you don't have any data to import speak to another dev on the project or you can ignore the --import flag on first run.
  - If it fails with a UI error, open `~/.cache/firebase/emulators/`. Delete the Ui folder `ui-v1.11.5` and unzip the zipped version and rerun.
  - Emulators are used by default in **DEV** for firestore. See `Database.ts` for more on this.
  - When changing between emulator environments and normal environments you will need to delete the app in order to remove firebase caching from getting incorrect data.
  - Firestore rules can be tested by using emulators before publishing.
- You can open the emulator and create your own data from there.
- Run `firebase login` to login. If required.
- Running `firebase deploy --only firestore:rules` will deploy the rules in the project.
- To test the scheduled function run the functions shell by `firebase functions:shell` you can then run the function by running `functionName()`. See [here](https://firebase.google.com/docs/functions/local-shell#invoke_pubsub_functions)

## Running the Firebase Emulator for Firebase Functions

- Change the `REACT_APP_USE_EMULATORS` flag in `src/util/FirebaseUtils/FirebaseUtils.ts` to true to enable emulation of firebase functions.
- Run the command `yarn emulateFirebase:dev` / `emulateFirebase:prod` for just enabling the functions emulation, or `firebase use development` / `firebase use production` & ` firebase emulators:start --import=EmulatorData --export-on-exit=EmulatorData` for use of the emulated firestore as well.

### Firebase Admin SDK

There is also an adminsdk json file that contains the secrets that allow admin access for the sdk to do this. This file is generated from the project settings within firebase and should not be shared publicly. Ideally this file would be stored on gitlab CI and not in version control but it is not currently possible to do that and should be done as soon as it is possible.

## Set up Firebase Functions locally

- Run commands `cd functions` and then `yarn install`.
- Before the emulator can see the Firebase Function the app will have to be built `yarn build`

## Running the Firebase function unit tests

- Run the command `yarn test-functions`

## Running the unit tests

- Simply run `yarn test`
