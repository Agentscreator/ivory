//
//  WatchConnectivityPlugin.swift
//  App
//
//  Capacitor plugin for Apple Watch communication
//

import Foundation
import Capacitor

@objc(WatchConnectivityPlugin)
public class WatchConnectivityPlugin: CAPPlugin {
    private var watchBridge: WatchConnectivityBridge?
    
    override public func load() {
        watchBridge = WatchConnectivityBridge()
        if let bridge = self.bridge {
            watchBridge?.setBridge(bridge)
        }
    }
    
    @objc func sendToWatch(_ call: CAPPluginCall) {
        guard let data = call.getObject("data") else {
            call.reject("No data provided")
            return
        }
        
        watchBridge?.sendToWatch(data)
        call.resolve()
    }
    
    @objc func isWatchReachable(_ call: CAPPluginCall) {
        // Check if Watch is reachable
        call.resolve(["reachable": false]) // Will be updated with actual status
    }
}
