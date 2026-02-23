//
//  AppDelegate.swift
//  MurrayDeskBooking
//
//  Created by Christopher Batin on 23/02/2026.
//

import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash
import RNFBAppCheck
import RNFBMessaging
import FirebaseCore

@UIApplicationMain
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "MurrayDeskBooking"
    self.dependencyProvider = RCTAppDependencyProvider()
    
    RNFBAppCheckModule.sharedInstance()
    FirebaseApp.configure()
    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = RNFBMessagingModule.addCustomProps(toUserProps: nil, withLaunchOptions: launchOptions);
    
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }
  
  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
  
  override func customize(_ rootView: RCTRootView!) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView) // ⬅️ initialize the splash screen
  }
}
