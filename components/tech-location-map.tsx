"use client"

import { useEffect, useState } from "react"
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"
import { MapPin } from "lucide-react"

const libraries: ("places")[] = ["places"]

interface TechLocationMapProps {
  location: string
  businessName?: string
  className?: string
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
}

export function TechLocationMap({ location, businessName, className = "" }: TechLocationMapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  useEffect(() => {
    if (!isLoaded || !location) return

    setIsGeocoding(true)
    const geocoder = new google.maps.Geocoder()

    geocoder.geocode({ address: location }, (results, status) => {
      setIsGeocoding(false)
      if (status === "OK" && results?.[0]) {
        const lat = results[0].geometry.location.lat()
        const lng = results[0].geometry.location.lng()
        setCoordinates({ lat, lng })
      } else {
        console.error("Geocoding failed:", status)
      }
    })
  }, [isLoaded, location])

  if (loadError) {
    return (
      <div className={`bg-[#F8F7F5] flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <MapPin className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" />
          <p className="text-sm text-[#6B6B6B]">Map unavailable</p>
        </div>
      </div>
    )
  }

  if (!isLoaded || isGeocoding) {
    return (
      <div className={`bg-[#F8F7F5] flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <MapPin className="w-8 h-8 text-[#8B7355] mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-[#6B6B6B]">Loading map...</p>
        </div>
      </div>
    )
  }

  if (!coordinates) {
    return (
      <div className={`bg-[#F8F7F5] flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <MapPin className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" />
          <p className="text-sm text-[#6B6B6B]">Location not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coordinates}
        zoom={14}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        <Marker
          position={coordinates}
          title={businessName || location}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#8B7355",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          }}
        />
      </GoogleMap>
    </div>
  )
}
