import React from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteSlideDialogProps {
  isOpen: boolean
  slideTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteSlideDialog({
  isOpen,
  slideTitle,
  onConfirm,
  onCancel,
}: DeleteSlideDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Delete Slide</h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700">
              Are you sure you want to delete the slide{' '}
              <strong>"{slideTitle}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All content and elements on this slide will be permanently
              removed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Slide
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
