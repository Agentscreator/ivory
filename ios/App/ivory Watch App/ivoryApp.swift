//
//  ivoryApp.swift
//  ivory Watch App
//
//  Created by Joshua Brown on 12/16/25.
//

import SwiftUI

@main
struct ivory_Watch_AppApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

// MARK: - App Configuration
extension ivory_Watch_AppApp {
    init() {
        // Configure app appearance
        configureAppearance()
    }
    
    private func configureAppearance() {
        // Set accent color to match main app
        // Ivory's Choice brand color: #8B7355
    }
}
