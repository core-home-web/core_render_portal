import React, { useState, useRef, useEffect } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ColorPicker } from '../ui/color-picker'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'

interface TextStyle {
  fontSize: number
  fontWeight: string
  fontStyle: string
  textDecoration: string
  color: string
  backgroundColor: string
  textAlign: string
  lineHeight: number
  letterSpacing: number
}

interface TextEditorProps {
  element: {
    id: string
    content: string
    style: TextStyle
  }
  onUpdate: (updates: Partial<{ content: string; style: TextStyle }>) => void
  onClose: () => void
}

export function TextEditor({ element, onUpdate, onClose }: TextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(element.content)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditContent(element.content)
  }, [element.content])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus()
        textRef.current.select()
      }
    }, 100)
  }

  const handleContentSave = () => {
    if (editContent !== element.content) {
      onUpdate({ content: editContent })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleContentSave()
    }
    if (e.key === 'Escape') {
      setEditContent(element.content)
      setIsEditing(false)
    }
  }

  const updateStyle = (property: keyof TextStyle, value: any) => {
    onUpdate({
      style: {
        ...element.style,
        [property]: value
      }
    })
  }

  const toggleStyle = (property: keyof TextStyle, value: string) => {
    const currentValue = element.style[property] as string
    const newValue = currentValue === value ? 'normal' : value
    updateStyle(property, newValue)
  }

  const fontSizeOptions = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96]
  const fontWeightOptions = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']

  return (
    <div className="space-y-4">
      {/* Text Content Editor */}
      <div>
        <Label className="text-sm font-medium">Text Content</Label>
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              ref={textRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleContentSave}
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              rows={3}
              placeholder="Enter text content..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleContentSave}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setEditContent(element.content)
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="mt-2 p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100"
            onDoubleClick={handleDoubleClick}
          >
            <p className="text-sm text-gray-600">
              {element.content || 'Double-click to edit text...'}
            </p>
          </div>
        )}
      </div>

      {/* Typography Controls */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Typography</h4>
        
        {/* Font Size and Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Font Size</Label>
            <Select
              value={element.style.fontSize.toString()}
              onValueChange={(value) => updateStyle('fontSize', parseInt(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs text-gray-600">Font Weight</Label>
            <Select
              value={element.style.fontWeight}
              onValueChange={(value) => updateStyle('fontWeight', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontWeightOptions.map(weight => (
                  <SelectItem key={weight} value={weight}>
                    {weight === 'normal' ? 'Normal' : weight === 'bold' ? 'Bold' : weight}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Text Style Toggles */}
        <div>
          <Label className="text-xs text-gray-600 mb-2 block">Text Style</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={element.style.fontWeight === 'bold' ? 'default' : 'outline'}
              onClick={() => toggleStyle('fontWeight', 'bold')}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={element.style.fontStyle === 'italic' ? 'default' : 'outline'}
              onClick={() => toggleStyle('fontStyle', 'italic')}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={element.style.textDecoration === 'underline' ? 'default' : 'outline'}
              onClick={() => toggleStyle('textDecoration', 'underline')}
              className="h-8 w-8 p-0"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Text Alignment */}
        <div>
          <Label className="text-xs text-gray-600 mb-2 block">Text Alignment</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={element.style.textAlign === 'left' ? 'default' : 'outline'}
              onClick={() => updateStyle('textAlign', 'left')}
              className="h-8 w-8 p-0"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={element.style.textAlign === 'center' ? 'default' : 'outline'}
              onClick={() => updateStyle('textAlign', 'center')}
              className="h-8 w-8 p-0"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={element.style.textAlign === 'right' ? 'default' : 'outline'}
              onClick={() => updateStyle('textAlign', 'right')}
              className="h-8 w-8 p-0"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={element.style.textAlign === 'justify' ? 'default' : 'outline'}
              onClick={() => updateStyle('textAlign', 'justify')}
              className="h-8 w-8 p-0"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Line Height and Letter Spacing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Line Height</Label>
            <Input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={element.style.lineHeight}
              onChange={(e) => updateStyle('lineHeight', parseFloat(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-xs text-gray-600">Letter Spacing</Label>
            <Input
              type="number"
              min="-2"
              max="10"
              step="0.1"
              value={element.style.letterSpacing}
              onChange={(e) => updateStyle('letterSpacing', parseFloat(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Color Controls */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Colors</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Text Color</Label>
            <ColorPicker
              color={element.style.color}
              onChange={(color) => updateStyle('color', color)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-xs text-gray-600">Background Color</Label>
            <ColorPicker
              color={element.style.backgroundColor}
              onChange={(color) => updateStyle('backgroundColor', color)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
