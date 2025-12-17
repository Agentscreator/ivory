# Google Maps Integration Setup

## Overview
Google Maps autocomplete has been integrated into the explore page search bar for location-based nail tech searches.

## What Was Done

### 1. Fixed Database Schema
- Added missing `portfolioImagesRelations` to fix the relation error
- This resolves: `Error: There is not enough information to infer relation "techProfiles.portfolioImages"`

### 2. Fixed Viewport Configuration
- Moved viewport config from `metadata` to separate `viewport` export in `app/layout.tsx`
- This follows Next.js 14+ best practices and resolves the deprecation warning

### 3. Installed Dependencies
```bash
yarn add @react-google-maps/api
```

### 4. Created Google Maps Search Component
- Location: `components/google-maps-search.tsx`
- Features:
  - Google Places Autocomplete
  - City-level search
  - Returns formatted address and coordinates
  - Graceful loading and error states

### 5. Updated Explore Page
- Added search bar with:
  - Text search for nail tech names/bios
  - Google Maps location autocomplete
  - Real-time tech search integration
- Displays search results above the design gallery

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials → API Key
5. Restrict the API key:
   - Application restrictions: HTTP referrers
   - Add your domains (localhost, production URL)
   - API restrictions: Select Maps JavaScript API and Places API

### 2. Add API Key to Environment
Add to your `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

### 3. Test the Integration
1. Start dev server: `yarn dev`
2. Navigate to `/explore`
3. Try searching:
   - Enter a location in the location field
   - Enter a search term (e.g., "nail tech")
   - Click Search

## Features

### Search Functionality
- **Text Search**: Search by business name or bio
- **Location Search**: Google Maps autocomplete for cities
- **Combined Search**: Use both filters together
- **Real-time Results**: Displays matching nail techs with ratings

### Tech Search Results Display
- Business name or username
- Location
- Rating and review count
- Click to view full profile

## API Endpoints Used

### GET /api/tech/search
Query parameters:
- `q`: Search query (business name, bio)
- `location`: Location filter

Returns:
```json
{
  "techs": [
    {
      "id": 1,
      "businessName": "Elegant Nails",
      "location": "New York, NY",
      "rating": "4.8",
      "totalReviews": 42,
      "user": {
        "username": "elegant_nails",
        "avatar": "..."
      }
    }
  ]
}
```

## Troubleshooting

### API Key Issues
- Ensure the API key is in `.env.local` with `NEXT_PUBLIC_` prefix
- Check that Places API is enabled in Google Cloud Console
- Verify API key restrictions allow your domain

### Search Not Working
- Check browser console for errors
- Verify database has tech profiles with location data
- Ensure the API route `/api/tech/search` is accessible

### Autocomplete Not Showing
- Check that Google Maps script is loaded (network tab)
- Verify API key has Places API enabled
- Check for JavaScript errors in console

## Cost Considerations

Google Maps pricing (as of 2024):
- Places Autocomplete: $2.83 per 1,000 requests
- First $200/month is free (Google Cloud credit)
- Monitor usage in Google Cloud Console

## Map View on Tech Profiles

### Location Tab
Each nail tech profile now includes a "Location" tab with:
- **Interactive Map**: Shows the tech's location with a custom marker
- **Open in Google Maps**: Direct link to view in Google Maps app/website
- **Get Directions**: One-click navigation from user's current location
- **Geocoding**: Automatically converts address to coordinates

### Features
- Custom styled map with minimal POI clutter
- Branded marker color (#8B7355)
- Responsive design (400px height on desktop)
- Graceful fallbacks for missing/invalid locations
- Loading states during geocoding

### Usage
The map automatically appears when:
1. Tech has a location set in their profile
2. User clicks the "Location" tab
3. Google Maps API successfully geocodes the address

## Implementation Details

### Components Created
1. **`components/google-maps-search.tsx`**: Autocomplete search input
2. **`components/tech-location-map.tsx`**: Interactive map display

### Pages Updated
1. **`app/explore/page.tsx`**: Search bar with location filter
2. **`app/tech/[id]/page.tsx`**: Added Location tab with map

### Database
- Uses existing `techProfiles.location` field (varchar 255)
- No schema changes required

## Next Steps

Consider adding:
- Map view of all search results (multi-marker map)
- Distance-based sorting (requires storing lat/lng)
- Geolocation for "near me" searches
- Save favorite locations
- Recent searches
- Service area radius visualization
