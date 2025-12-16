//
//  ContentView.swift
//  ivory Watch App
//
//  Created by Joshua Brown on 12/16/25.
//

import SwiftUI
import WatchConnectivity

struct ContentView: View {
    @StateObject private var connectivity = WatchConnectivityManager()
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Home/Explore Tab
            HomeView(connectivity: connectivity)
                .tag(0)
            
            // My Designs Tab
            DesignsView(connectivity: connectivity)
                .tag(1)
            
            // Profile Tab
            ProfileView(connectivity: connectivity)
                .tag(2)
        }
        .tabViewStyle(.page)
        .onAppear {
            connectivity.activate()
        }
    }
}

// MARK: - Home View
struct HomeView: View {
    @ObservedObject var connectivity: WatchConnectivityManager
    @State private var designs: [Design] = []
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 12) {
                    // Header
                    VStack(spacing: 4) {
                        Text("IVORY'S CHOICE")
                            .font(.system(size: 14, weight: .light, design: .serif))
                            .foregroundColor(.primary)
                        
                        Text("Explore Designs")
                            .font(.system(size: 10, weight: .light))
                            .foregroundColor(.secondary)
                            .textCase(.uppercase)
                    }
                    .padding(.top, 8)
                    
                    // Featured Designs
                    if designs.isEmpty {
                        VStack(spacing: 8) {
                            ProgressView()
                            Text("Loading designs...")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        .padding(.top, 20)
                    } else {
                        ForEach(designs) { design in
                            DesignCard(design: design)
                        }
                    }
                    
                    // Quick Actions
                    VStack(spacing: 8) {
                        Button(action: {
                            connectivity.sendMessage(["action": "openCapture"])
                        }) {
                            HStack {
                                Image(systemName: "camera.fill")
                                Text("Capture Design")
                                    .font(.caption)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        }
                        .buttonStyle(.plain)
                        
                        Button(action: {
                            connectivity.sendMessage(["action": "openExplore"])
                        }) {
                            HStack {
                                Image(systemName: "sparkles")
                                Text("Browse Gallery")
                                    .font(.caption)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(Color.secondary.opacity(0.2))
                            .foregroundColor(.primary)
                            .cornerRadius(8)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.top, 8)
                }
                .padding(.horizontal, 8)
            }
        }
        .onAppear {
            loadDesigns()
        }
    }
    
    private func loadDesigns() {
        connectivity.sendMessage(["action": "getRecentDesigns"]) { response in
            if let designsData = response["designs"] as? [[String: Any]] {
                designs = designsData.compactMap { Design(dict: $0) }
            }
        }
    }
}

// MARK: - Designs View
struct DesignsView: View {
    @ObservedObject var connectivity: WatchConnectivityManager
    @State private var savedDesigns: [Design] = []
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 12) {
                    Text("My Designs")
                        .font(.system(size: 14, weight: .light, design: .serif))
                        .padding(.top, 8)
                    
                    if savedDesigns.isEmpty {
                        VStack(spacing: 8) {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.system(size: 32))
                                .foregroundColor(.secondary)
                            Text("No saved designs")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Button("Create Design") {
                                connectivity.sendMessage(["action": "openCapture"])
                            }
                            .font(.caption)
                            .padding(.top, 4)
                        }
                        .padding(.top, 20)
                    } else {
                        ForEach(savedDesigns) { design in
                            DesignCard(design: design)
                        }
                    }
                }
                .padding(.horizontal, 8)
            }
        }
        .onAppear {
            loadSavedDesigns()
        }
    }
    
    private func loadSavedDesigns() {
        connectivity.sendMessage(["action": "getSavedDesigns"]) { response in
            if let designsData = response["designs"] as? [[String: Any]] {
                savedDesigns = designsData.compactMap { Design(dict: $0) }
            }
        }
    }
}

// MARK: - Profile View
struct ProfileView: View {
    @ObservedObject var connectivity: WatchConnectivityManager
    @State private var user: User?
    @State private var credits: Int = 0
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 12) {
                    // Profile Header
                    VStack(spacing: 4) {
                        if let user = user {
                            Text(user.username)
                                .font(.system(size: 14, weight: .medium))
                            
                            if let email = user.email {
                                Text(email)
                                    .font(.system(size: 10))
                                    .foregroundColor(.secondary)
                            }
                        } else {
                            Text("Not signed in")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.top, 8)
                    
                    // Credits
                    VStack(spacing: 4) {
                        Text("\(credits)")
                            .font(.system(size: 24, weight: .light))
                        Text("Credits")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                            .textCase(.uppercase)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.accentColor.opacity(0.1))
                    .cornerRadius(8)
                    
                    // Quick Actions
                    VStack(spacing: 8) {
                        ProfileButton(icon: "creditcard.fill", title: "Buy Credits") {
                            connectivity.sendMessage(["action": "openBilling"])
                        }
                        
                        ProfileButton(icon: "gearshape.fill", title: "Settings") {
                            connectivity.sendMessage(["action": "openSettings"])
                        }
                        
                        if user == nil {
                            ProfileButton(icon: "person.fill", title: "Sign In") {
                                connectivity.sendMessage(["action": "openAuth"])
                            }
                        }
                    }
                }
                .padding(.horizontal, 8)
            }
        }
        .onAppear {
            loadProfile()
        }
    }
    
    private func loadProfile() {
        connectivity.sendMessage(["action": "getProfile"]) { response in
            if let userData = response["user"] as? [String: Any] {
                user = User(dict: userData)
            }
            if let creditsValue = response["credits"] as? Int {
                credits = creditsValue
            }
        }
    }
}

// MARK: - Supporting Views
struct DesignCard: View {
    let design: Design
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            // Design preview placeholder
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.secondary.opacity(0.2))
                .frame(height: 80)
                .overlay(
                    Image(systemName: "photo")
                        .font(.system(size: 24))
                        .foregroundColor(.secondary)
                )
            
            Text(design.title)
                .font(.caption)
                .fontWeight(.medium)
                .lineLimit(1)
            
            if let description = design.description {
                Text(description)
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }
        }
        .padding(8)
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(8)
    }
}

struct ProfileButton: View {
    let icon: String
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .frame(width: 20)
                Text(title)
                    .font(.caption)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 12)
            .background(Color.secondary.opacity(0.1))
            .cornerRadius(8)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Models
struct Design: Identifiable {
    let id: String
    let title: String
    let description: String?
    let imageUrl: String?
    
    init?(dict: [String: Any]) {
        guard let id = dict["id"] as? String,
              let title = dict["title"] as? String else {
            return nil
        }
        self.id = id
        self.title = title
        self.description = dict["description"] as? String
        self.imageUrl = dict["imageUrl"] as? String
    }
}

struct User {
    let id: String
    let username: String
    let email: String?
    
    init?(dict: [String: Any]) {
        guard let id = dict["id"] as? String,
              let username = dict["username"] as? String else {
            return nil
        }
        self.id = id
        self.username = username
        self.email = dict["email"] as? String
    }
}

// MARK: - Watch Connectivity Manager
class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    @Published var isReachable = false
    private var session: WCSession?
    private var messageHandlers: [String: ([String: Any]) -> Void] = [:]
    
    func activate() {
        if WCSession.isSupported() {
            session = WCSession.default
            session?.delegate = self
            session?.activate()
        }
    }
    
    func sendMessage(_ message: [String: Any], replyHandler: (([String: Any]) -> Void)? = nil) {
        guard let session = session, session.isReachable else {
            print("Watch: iPhone not reachable")
            return
        }
        
        session.sendMessage(message, replyHandler: { response in
            DispatchQueue.main.async {
                replyHandler?(response)
            }
        }, errorHandler: { error in
            print("Watch: Error sending message: \(error.localizedDescription)")
        })
    }
    
    // MARK: - WCSessionDelegate
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isReachable = session.isReachable
        }
    }
    
    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isReachable = session.isReachable
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        // Handle messages from iPhone
        DispatchQueue.main.async {
            replyHandler(["status": "received"])
        }
    }
}

#Preview {
    ContentView()
}
