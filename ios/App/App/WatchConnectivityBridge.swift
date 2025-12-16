//
//  WatchConnectivityBridge.swift
//  App
//
//  Handles communication between iPhone app and Apple Watch
//

import Foundation
import WatchConnectivity
import Capacitor

@objc(WatchConnectivityBridge)
public class WatchConnectivityBridge: NSObject, WCSessionDelegate {
    private var session: WCSession?
    private weak var bridge: CAPBridgeProtocol?
    
    public override init() {
        super.init()
        setupWatchConnectivity()
    }
    
    public func setBridge(_ bridge: CAPBridgeProtocol) {
        self.bridge = bridge
    }
    
    private func setupWatchConnectivity() {
        if WCSession.isSupported() {
            session = WCSession.default
            session?.delegate = self
            session?.activate()
        }
    }
    
    // MARK: - WCSessionDelegate
    public func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            print("WatchConnectivity activation failed: \(error.localizedDescription)")
        } else {
            print("WatchConnectivity activated with state: \(activationState.rawValue)")
        }
    }
    
    public func sessionDidBecomeInactive(_ session: WCSession) {
        print("WatchConnectivity session became inactive")
    }
    
    public func sessionDidDeactivate(_ session: WCSession) {
        print("WatchConnectivity session deactivated")
        // Reactivate session
        session.activate()
    }
    
    public func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        print("Received message from Watch: \(message)")
        
        guard let action = message["action"] as? String else {
            replyHandler(["error": "No action specified"])
            return
        }
        
        handleWatchAction(action, replyHandler: replyHandler)
    }
    
    // MARK: - Action Handlers
    private func handleWatchAction(_ action: String, replyHandler: @escaping ([String: Any]) -> Void) {
        switch action {
        case "getRecentDesigns":
            getRecentDesigns(replyHandler: replyHandler)
            
        case "getSavedDesigns":
            getSavedDesigns(replyHandler: replyHandler)
            
        case "getProfile":
            getProfile(replyHandler: replyHandler)
            
        case "openCapture":
            openPage("/capture")
            replyHandler(["status": "opened"])
            
        case "openExplore":
            openPage("/explore")
            replyHandler(["status": "opened"])
            
        case "openBilling":
            openPage("/billing")
            replyHandler(["status": "opened"])
            
        case "openSettings":
            openPage("/settings")
            replyHandler(["status": "opened"])
            
        case "openAuth":
            openPage("/auth")
            replyHandler(["status": "opened"])
            
        default:
            replyHandler(["error": "Unknown action"])
        }
    }
    
    private func getRecentDesigns(replyHandler: @escaping ([String: Any]) -> Void) {
        // Fetch from web app via JavaScript
        executeJS("window.getRecentDesigns?.() || []") { result in
            if let designs = result as? [[String: Any]] {
                replyHandler(["designs": designs])
            } else {
                // Return sample data if not available
                replyHandler(["designs": self.getSampleDesigns()])
            }
        }
    }
    
    private func getSavedDesigns(replyHandler: @escaping ([String: Any]) -> Void) {
        executeJS("window.getSavedDesigns?.() || []") { result in
            if let designs = result as? [[String: Any]] {
                replyHandler(["designs": designs])
            } else {
                replyHandler(["designs": []])
            }
        }
    }
    
    private func getProfile(replyHandler: @escaping ([String: Any]) -> Void) {
        executeJS("window.getUserProfile?.() || null") { result in
            if let profile = result as? [String: Any] {
                replyHandler(profile)
            } else {
                replyHandler(["user": nil, "credits": 0])
            }
        }
    }
    
    private func openPage(_ path: String) {
        DispatchQueue.main.async {
            self.executeJS("window.location.href = '\(path)'") { _ in }
        }
    }
    
    private func executeJS(_ js: String, completion: @escaping (Any?) -> Void) {
        DispatchQueue.main.async {
            guard let bridge = self.bridge,
                  let webView = bridge.webView else {
                completion(nil)
                return
            }
            
            webView.evaluateJavaScript(js) { result, error in
                if let error = error {
                    print("JS execution error: \(error.localizedDescription)")
                    completion(nil)
                } else {
                    completion(result)
                }
            }
        }
    }
    
    // MARK: - Sample Data
    private func getSampleDesigns() -> [[String: Any]] {
        return [
            [
                "id": "sample-1",
                "title": "Classic French",
                "description": "Elegant French manicure",
                "imageUrl": nil
            ],
            [
                "id": "sample-2",
                "title": "Floral Spring",
                "description": "Delicate floral patterns",
                "imageUrl": nil
            ],
            [
                "id": "sample-3",
                "title": "Geometric Modern",
                "description": "Bold geometric design",
                "imageUrl": nil
            ]
        ]
    }
    
    // MARK: - Public Methods
    public func sendToWatch(_ data: [String: Any]) {
        guard let session = session, session.isReachable else {
            print("Watch not reachable")
            return
        }
        
        session.sendMessage(data, replyHandler: nil) { error in
            print("Error sending to Watch: \(error.localizedDescription)")
        }
    }
}
