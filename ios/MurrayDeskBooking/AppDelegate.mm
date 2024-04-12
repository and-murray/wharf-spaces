#import "AppDelegate.h"
#import "RNFBAppCheckModule.h"
#import <React/RCTBundleURLProvider.h>
#import "RNBootSplash.h"

// add this import statement at the top of your `AppDelegate.m` file
#import "RNFBMessagingModule.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"MurrayDeskBooking";
  [RNFBAppCheckModule sharedInstance];
  [FIRApp configure];
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  // in "(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions" method
  // Use `addCustomPropsToUserProps` to pass in props for initialization of your app
  // Or pass in `nil` if you have none as per below example
  // For `withLaunchOptions` please pass in `launchOptions` object
  // and use it to set `self.initialProps` (available with react-native >= 0.71.1, older versions need a more difficult style, upgrading is recommended)

  self.initialProps = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:launchOptions];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}
 
- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// For boot splash screen
- (UIView *)createRootViewWithBridge:(RCTBridge *)bridge
                          moduleName:(NSString *)moduleName
                           initProps:(NSDictionary *)initProps {
  UIView *rootView = [super createRootViewWithBridge:bridge
                                          moduleName:moduleName
                                           initProps:initProps];

  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView];

  return rootView;
}
@end
