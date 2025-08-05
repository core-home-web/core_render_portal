'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Palette, Pipette } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  placeholder?: string
}

export function ColorPicker({ 
  value, 
  onChange, 
  label = 'Color',
  placeholder = 'Enter color value'
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value)
  const [showPicker, setShowPicker] = useState(false)
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgb'>('hex')

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleColorChange = (color: string) => {
    onChange(color)
    setInputValue(color)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Auto-detect format and convert if needed
    if (newValue.startsWith('#')) {
      setColorFormat('hex')
      onChange(newValue)
    } else if (newValue.startsWith('rgb')) {
      setColorFormat('rgb')
      onChange(newValue)
    } else if (newValue.match(/^[0-9a-fA-F]{6}$/)) {
      // Convert 6-digit hex to #hex
      const hexColor = `#${newValue}`
      setColorFormat('hex')
      onChange(hexColor)
      setInputValue(hexColor)
    } else if (newValue.match(/^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/)) {
      // Convert comma-separated RGB to rgb()
      const rgbColor = `rgb(${newValue})`
      setColorFormat('rgb')
      onChange(rgbColor)
      setInputValue(rgbColor)
    }
  }

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    handleColorChange(color)
  }

  const convertToHex = (color: string) => {
    // Convert RGB to HEX
    if (color.startsWith('rgb')) {
      const rgb = color.match(/\d+/g)
      if (rgb && rgb.length === 3) {
        const r = parseInt(rgb[0])
        const g = parseInt(rgb[1])
        const b = parseInt(rgb[2])
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
      }
    }
    return color
  }

  const convertToRgb = (color: string) => {
    // Convert HEX to RGB
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgb(${r}, ${g}, ${b})`
    }
    return color
  }

  const toggleFormat = () => {
    if (colorFormat === 'hex') {
      const rgbColor = convertToRgb(inputValue)
      setColorFormat('rgb')
      handleColorChange(rgbColor)
      setInputValue(rgbColor)
    } else {
      const hexColor = convertToHex(inputValue)
      setColorFormat('hex')
      handleColorChange(hexColor)
      setInputValue(hexColor)
    }
  }

  const handleEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper()
        const result = await eyeDropper.open()
        handleColorChange(result.sRGBHex)
      } catch (error) {
        console.log('Eye dropper cancelled or failed')
      }
    } else {
      // Fallback: open color picker
      setShowPicker(true)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="font-mono text-sm"
          />
        </div>
        
        <div className="flex gap-1">
          {/* Color Preview */}
          <div 
            className="w-10 h-10 rounded border cursor-pointer"
            style={{ backgroundColor: value || '#ffffff' }}
            onClick={() => setShowPicker(!showPicker)}
            title="Click to open color picker"
          />
          
          {/* Format Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleFormat}
            className="px-2"
          >
            {colorFormat.toUpperCase()}
          </Button>
          
          {/* Eye Dropper */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEyeDropper}
            className="px-2"
            title="Pick color from screen"
          >
            <Pipette className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Color Picker Input */}
      {showPicker && (
        <div className="flex items-center gap-2">
          <Label className="text-sm">Color Picker:</Label>
          <input
            type="color"
            value={value.startsWith('#') ? value : convertToHex(value)}
            onChange={handlePickerChange}
            className="w-12 h-8 border rounded cursor-pointer"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPicker(false)}
          >
            Hide
          </Button>
        </div>
      )}
      
      {/* Color Format Info */}
      <div className="text-xs text-muted-foreground">
        <p>Supported formats: HEX (#ff0000), RGB (rgb(255, 0, 0))</p>
        <p>Click the color preview to open picker, or use the eye dropper to pick from screen</p>
      </div>
    </div>
  )
} 