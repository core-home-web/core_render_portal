'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ScreenColorPickerProps {
  onColorSelect: (color: string, format: 'hex' | 'rgb' | 'hsl') => void
  currentColor?: string
  className?: string
}

export function ScreenColorPicker({ 
  onColorSelect, 
  currentColor = '#000000',
  className = '' 
}: ScreenColorPickerProps) {
  const [isPicking, setIsPicking] = useState(false)
  const [previewColor, setPreviewColor] = useState('#000000')
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })
  const [showFormatOptions, setShowFormatOptions] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h: number, s: number, l: number

    l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
        default: h = 0
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  // Format color based on selected format
  const formatColor = (color: string, format: 'hex' | 'rgb' | 'hsl') => {
    const rgb = hexToRgb(color)
    if (!rgb) return color

    switch (format) {
      case 'hex':
        return color.toUpperCase()
      case 'rgb':
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
      case 'hsl':
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      default:
        return color
    }
  }

  const handleColorPickerClick = () => {
    if (isPicking) return

    setIsPicking(true)
    setShowFormatOptions(false)

    // Use the native color picker as fallback
    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.value = currentColor
    
    colorInput.addEventListener('change', (e) => {
      const color = (e.target as HTMLInputElement).value
      setPreviewColor(color)
      setShowFormatOptions(true)
      setIsPicking(false)
    })

    colorInput.addEventListener('cancel', () => {
      setIsPicking(false)
    })

    colorInput.click()
  }

  const handleFormatSelect = (format: 'hex' | 'rgb' | 'hsl') => {
    const formattedColor = formatColor(previewColor, format)
    onColorSelect(formattedColor, format)
    setShowFormatOptions(false)
    setIsPicking(false)
  }

  const handleEyedropperClick = async () => {
    if (!('EyeDropper' in window)) {
      alert('Screen color picker is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    try {
      const eyeDropper = new (window as any).EyeDropper()
      const result = await eyeDropper.open()
      setPreviewColor(result.sRGBHex)
      setShowFormatOptions(true)
    } catch (err) {
      console.log('Color picker cancelled')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        {/* Color Preview */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 border-2 border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors"
            style={{ backgroundColor: currentColor }}
            onClick={handleColorPickerClick}
            title="Click to pick color"
          />
          <span className="text-sm text-gray-600 min-w-[80px]">{currentColor}</span>
        </div>

        {/* Color Picker Button */}
        <Button
          onClick={handleColorPickerClick}
          size="sm"
          variant="outline"
          disabled={isPicking}
        >
          {isPicking ? 'Picking...' : '🎨'}
        </Button>

        {/* Screen Color Picker (EyeDropper) */}
        {'EyeDropper' in window && (
          <Button
            onClick={handleEyedropperClick}
            size="sm"
            variant="outline"
            title="Pick color from screen"
          >
            🔍
          </Button>
        )}
      </div>

      {/* Format Options Modal */}
      {showFormatOptions && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 border border-gray-300 rounded"
                style={{ backgroundColor: previewColor }}
              />
              <span className="text-sm font-medium">Choose format:</span>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={() => handleFormatSelect('hex')}
                size="sm"
                variant="outline"
                className="w-full justify-start"
              >
                HEX: {formatColor(previewColor, 'hex')}
              </Button>
              
              <Button
                onClick={() => handleFormatSelect('rgb')}
                size="sm"
                variant="outline"
                className="w-full justify-start"
              >
                RGB: {formatColor(previewColor, 'rgb')}
              </Button>
              
              <Button
                onClick={() => handleFormatSelect('hsl')}
                size="sm"
                variant="outline"
                className="w-full justify-start"
              >
                HSL: {formatColor(previewColor, 'hsl')}
              </Button>
            </div>

            <Button
              onClick={() => setShowFormatOptions(false)}
              size="sm"
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
