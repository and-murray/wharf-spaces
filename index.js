import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import { Platform, View, TextInput } from 'react-native';

// TODO: remove this android logic when we migrate from native-base to gluestack
if (Platform.OS === 'android') {
  const fixOutlineProps = (Component) => {
    const originalRender = Component.render;
    Component.render = function (props, ref) {
      if (props?.style) {
        const style = Array.isArray(props.style)
          ? props.style.flat().filter(Boolean)
          : { ...props.style };

        const stripInvalidOutline = (styles) => {
          if (styles && typeof styles.outlineWidth === 'string') {
            delete styles.outlineWidth;
          }
        };

        if (Array.isArray(style)) {
          style.forEach(stripInvalidOutline);
        } else {
          stripInvalidOutline(style);
        }
      }
      return originalRender.call(this, props, ref);
    };
  };

  // Apply fix to the core components NativeBase wraps
  fixOutlineProps(View);
  fixOutlineProps(TextInput);
}

// Register background handler
messaging().setBackgroundMessageHandler(() => {});

// Check if app was launched in the background and conditionally render null if so
function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  // Render the app component on foreground launch
  return App();
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
