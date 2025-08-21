import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { X, Eye, Check } from 'lucide-react'
import { PRESENTATION_THEMES, PresentationTheme } from '../../lib/presentation-themes'

interface ThemePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTheme: (theme: PresentationTheme) => void
  currentTheme: string
}

export function ThemePreviewModal({
  isOpen,
  onClose,
  onSelectTheme,
  currentTheme
}: ThemePreviewModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(currentTheme)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Preview Presentation Themes</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PRESENTATION_THEMES.map((theme) => (
              <div
                key={theme.name}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTheme === theme.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTheme(theme.name)}
              >
                {/* Theme Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{theme.name}</h3>
                    <p className="text-sm text-gray-600">{theme.description}</p>
                  </div>
                  {selectedTheme === theme.name && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>

                {/* Theme Preview */}
                <div className="space-y-3">
                  {/* Title Slide Preview */}
                  <div
                    className="h-32 rounded-lg p-4 text-center flex flex-col justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                      color: 'white'
                    }}
                  >
                    <div className="text-lg font-bold">Sample Title</div>
                    <div className="text-sm opacity-80">Project Name</div>
                  </div>

                  {/* Content Slide Preview */}
                  <div
                    className="h-32 rounded-lg p-4 border"
                    style={{
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div
                        className="text-sm font-medium"
                        style={{ color: theme.colors.primary }}
                      >
                        Sample Part
                      </div>
                    </div>
                    <div className="text-xs space-y-1" style={{ color: theme.colors.textLight }}>
                      <div>Finish: Matte</div>
                      <div>Color: Blue</div>
                      <div>Texture: Smooth</div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.colors.background }}
                      title="Background"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const theme = PRESENTATION_THEMES.find(t => t.name === selectedTheme)
                if (theme) {
                  onSelectTheme(theme)
                  onClose()
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Use {selectedTheme} Theme
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
