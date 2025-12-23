"use client"

import { ChevronDown } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"

type DesignSettings = {
  nailLength: string
  nailShape: string
  baseColor: string
  finish: string
  texture: string
  patternType: string
  styleVibe: string
  accentColor: string
}

type InfluenceWeights = {
  nailEditor_designImage: number
  nailEditor_baseColor: number
  nailEditor_finish: number
  nailEditor_texture: number
}

interface DesignParametersProps {
  designSettings: DesignSettings
  influenceWeights: InfluenceWeights
  selectedDesignImages: string[]
  colorLightness: number
  expandedSection: string | null
  setExpandedSection: (section: string | null) => void
  handleDesignSettingChange: (key: keyof DesignSettings, value: string) => void
  handleHueChange: (value: number[]) => void
  handleLightnessChange: (value: number[]) => void
  handleNailEditorBaseColorInfluence: (value: number) => void
  hexToHsl: (hex: string) => { hue: number; lightness: number }
}

export function DesignParametersGorgeous({
  designSettings,
  influenceWeights,
  selectedDesignImages,
  colorLightness,
  expandedSection,
  setExpandedSection,
  handleDesignSettingChange,
  handleHueChange,
  handleLightnessChange,
  handleNailEditorBaseColorInfluence,
  hexToHsl,
}: DesignParametersProps) {
  return (
    <div className="border-t border-[#E8E8E8] pt-4">
      <p className="text-xs font-light text-[#6B6B6B] uppercase tracking-widest mb-4">Design Parameters</p>

      {/* Nail Length - Redesigned */}
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'length' ? null : 'length')}
          className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-gradient-to-br from-white to-[#FEFEFE] hover:border-[#8B7355] hover:shadow-md transition-all duration-300 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B7355] to-[#A0826D] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-[#1A1A1A] tracking-wide block">Nail Length</span>
              <span className="text-xs text-[#8B7355] capitalize font-light">{designSettings.nailLength.replace('-', ' ')}</span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#6B6B6B] transition-transform duration-300 ${expandedSection === 'length' ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>
        {expandedSection === 'length' && (
          <div className="mt-3 p-4 bg-gradient-to-br from-[#FAFAFA] to-white rounded-lg border border-[#E8E8E8] shadow-inner animate-fade-in">
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 'short', label: 'Short', height: 'h-8', emoji: '💅' },
                { value: 'medium', label: 'Medium', height: 'h-12', emoji: '✨' },
                { value: 'long', label: 'Long', height: 'h-16', emoji: '💎' },
                { value: 'extra-long', label: 'Extra', height: 'h-20', emoji: '👑' }
              ].map((length) => (
                <button
                  key={length.value}
                  onClick={() => handleDesignSettingChange('nailLength', length.value)}
                  className={`group relative flex flex-col items-center justify-end p-3 rounded-xl border-2 transition-all duration-300 ${
                    designSettings.nailLength === length.value
                      ? 'border-[#8B7355] bg-gradient-to-br from-[#8B7355]/5 to-[#8B7355]/10 shadow-lg scale-105'
                      : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]/50 hover:shadow-md hover:scale-102'
                  }`}
                >
                  <div className="absolute -top-2 right-2 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {length.emoji}
                  </div>
                  <div className={`w-5 ${length.height} bg-gradient-to-t from-[#8B7355] to-[#A0826D] rounded-t-full mb-2 shadow-sm transition-all duration-300 ${
                    designSettings.nailLength === length.value ? 'scale-110' : ''
                  }`} />
                  <span className={`text-[10px] font-medium tracking-wide transition-colors ${
                    designSettings.nailLength === length.value ? 'text-[#8B7355]' : 'text-[#6B6B6B]'
                  }`}>{length.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nail Shape - Image Slider */}
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'shape' ? null : 'shape')}
          className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-gradient-to-br from-white to-[#FEFEFE] hover:border-[#8B7355] hover:shadow-md transition-all duration-300 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B7355] to-[#A0826D] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-[#1A1A1A] tracking-wide block">Nail Shape</span>
              <span className="text-xs text-[#8B7355] capitalize font-light">{designSettings.nailShape.replace('-', ' ')}</span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#6B6B6B] transition-transform duration-300 ${expandedSection === 'shape' ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>
        {expandedSection === 'shape' && (
          <div className="mt-3 p-3 sm:p-4 bg-gradient-to-br from-[#FAFAFA] to-white rounded-lg border border-[#E8E8E8] shadow-inner animate-fade-in">
            <div className="relative">
              {/* Horizontal scrollable container */}
              <div className="overflow-x-auto pb-2 scrollbar-hide -mx-1">
                <div className="flex gap-2 sm:gap-3 min-w-max px-1">
                  {[
                    { value: 'square', label: 'Square', image: '/SQUARE.png' },
                    { value: 'squoval', label: 'Squoval', image: '/SQUARED OVAL SQUOVAL.png' },
                    { value: 'oval', label: 'Oval', image: '/OVAL.png' },
                    { value: 'rounded', label: 'Rounded', image: '/ROUNDED.png' },
                    { value: 'almond', label: 'Almond', image: '/ALMOND.png' },
                    { value: 'mountain-peak', label: 'Mountain Peak', image: '/MOUNTAIN PEAK.png' },
                    { value: 'stiletto', label: 'Stiletto', image: '/STILETTO.png' },
                    { value: 'ballerina', label: 'Ballerina', image: '/BALLERINA.png' },
                    { value: 'edge', label: 'Edge', image: '/EDGE.png' },
                    { value: 'lipstick', label: 'Lipstick', image: '/LIPSTICK.png' },
                    { value: 'flare', label: 'Flare', image: '/FLARE.png' },
                    { value: 'arrow-head', label: 'Arrow Head', image: '/ARROW HEAD.png' }
                  ].map((shape) => (
                    <button
                      key={shape.value}
                      onClick={() => handleDesignSettingChange('nailShape', shape.value)}
                      className={`group relative flex-shrink-0 w-20 sm:w-24 flex flex-col items-center p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 ${
                        designSettings.nailShape === shape.value
                          ? 'border-[#8B7355] bg-gradient-to-br from-[#8B7355]/5 to-[#8B7355]/10 shadow-lg scale-105'
                          : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]/50 hover:shadow-md hover:scale-102'
                      }`}
                    >
                      {/* Image container with aspect ratio */}
                      <div className="relative w-full aspect-[3/4] mb-1.5 sm:mb-2 overflow-hidden rounded-lg">
                        <Image
                          src={shape.image}
                          alt={shape.label}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className={`object-contain transition-all duration-300 ${
                            designSettings.nailShape === shape.value ? 'scale-110' : 'group-hover:scale-105'
                          }`}
                        />
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide text-center transition-colors leading-tight ${
                        designSettings.nailShape === shape.value ? 'text-[#8B7355]' : 'text-[#6B6B6B]'
                      }`}>{shape.label}</span>
                      {/* Selection indicator - Always visible on top */}
                      {designSettings.nailShape === shape.value && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-5 sm:h-5 bg-[#8B7355] rounded-full flex items-center justify-center shadow-md z-10 ring-2 ring-white">
                          <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {/* Scroll indicators - adjusted for mobile */}
              <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-r from-[#FAFAFA] to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Add other parameters similarly... */}
    </div>
  )
}
