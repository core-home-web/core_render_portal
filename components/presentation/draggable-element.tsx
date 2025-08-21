import React, { useState, useRef, useCallback } from 'react'
import { Move, CornerDownRight } from 'lucide-react'

interface DraggableElementProps {
  id: string
  x: number
  y: number
  width: number
  height: number
  isSelected: boolean
  onSelect: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, width: number, height: number) => void
  children: React.ReactNode
  minWidth?: number
  minHeight?: number
}

export function DraggableElement({
  id,
  x,
  y,
  width,
  height,
  isSelected,
  onSelect,
  onMove,
  onResize,
  children,
  minWidth = 50,
  minHeight = 30
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Always select the element when clicked
    onSelect(id)
    
    // Check if we should start dragging (only if clicking on the main element area)
    if (e.target === elementRef.current) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - x,
        y: e.clientY - y
      })
    }
  }, [id, x, y, onSelect])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(100 - (width / 8), (e.clientX - dragStart.x) / 8))
      const newY = Math.max(0, Math.min(100 - (height / 6), (e.clientY - dragStart.y) / 6))
      onMove(id, newX, newY)
    }
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      const newWidth = Math.max(minWidth, resizeStart.width + deltaX)
      const newHeight = Math.max(minHeight, resizeStart.height + deltaY)
      
      onResize(id, newWidth, newHeight)
    }
  }, [isDragging, isResizing, dragStart, resizeStart, width, height, minWidth, minHeight, onMove, onResize, id])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width,
      height
    })
  }, [width, height])

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}px`,
        height: `${height}px`
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* Resize Handle */}
      <div
        className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize ${
          isSelected ? 'opacity-100' : 'opacity-0'
        } transition-opacity`}
        onMouseDown={handleResizeStart}
      >
        <CornerDownRight className="w-4 h-4 text-blue-500" />
      </div>
      
      {/* Move Handle */}
      {isSelected && (
        <div className="absolute top-0 left-0 w-6 h-6 bg-blue-500 rounded-tl cursor-move opacity-75">
          <Move className="w-4 h-4 text-white m-1" />
        </div>
      )}
    </div>
  )
}
