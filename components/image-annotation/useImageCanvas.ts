import { useState, useCallback, useRef, useEffect } from 'react'
import { CanvasState, CanvasTransform, ImageData, ZoomLimits } from './types'

const DEFAULT_ZOOM_LIMITS: ZoomLimits = { min: 0.25, max: 4 }

export function useImageCanvas(
  image: ImageData | null | undefined,
  containerRef: React.RefObject<HTMLDivElement>,
  zoomLimits: ZoomLimits = DEFAULT_ZOOM_LIMITS,
  initialZoom: 'fit' | '100%' = 'fit'
) {
  const [state, setState] = useState<CanvasState>({
    transform: { scale: 1, translateX: 0, translateY: 0 },
    isDragging: false,
    lastMousePos: null,
    image: image || null,
    containerSize: { width: 0, height: 0 },
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  // Fit image to container
  const fitImageToContainer = useCallback(
    (containerWidth: number, containerHeight: number, img: ImageData) => {
      const scaleX = containerWidth / img.width
      const scaleY = containerHeight / img.height
      const scale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond 100%

      const translateX = (containerWidth - img.width * scale) / 2
      const translateY = (containerHeight - img.height * scale) / 2

      setState((prev) => ({
        ...prev,
        transform: { scale, translateX, translateY },
      }))
    },
    []
  )

  // Update image state when image prop changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      image: image || null,
    }))
  }, [image])

  // Initialize canvas size and fit image
  useEffect(() => {
    if (!containerRef.current || !image) return

    const updateContainerSize = () => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()

      setState((prev) => ({
        ...prev,
        containerSize: {
          width: containerRect.width,
          height: containerRect.height,
        },
      }))

      // Fit image to container initially
      if (initialZoom === 'fit') {
        fitImageToContainer(containerRect.width, containerRect.height, image)
      }
    }

    // Initial size
    updateContainerSize()

    // Resize observer for responsive updates
    const resizeObserver = new ResizeObserver(updateContainerSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [image, containerRef, initialZoom, fitImageToContainer])

  // Handle zoom
  const handleZoom = useCallback(
    (delta: number, mouseX: number, mouseY: number) => {
      setState((prev) => {
        const newScale = Math.max(
          zoomLimits.min,
          Math.min(zoomLimits.max, prev.transform.scale * (1 + delta * 0.1))
        )

        // Zoom towards mouse position
        const scaleRatio = newScale / prev.transform.scale
        const newTranslateX =
          mouseX - (mouseX - prev.transform.translateX) * scaleRatio
        const newTranslateY =
          mouseY - (mouseY - prev.transform.translateY) * scaleRatio

        return {
          ...prev,
          transform: {
            scale: newScale,
            translateX: newTranslateX,
            translateY: newTranslateY,
          },
        }
      })
    },
    [zoomLimits]
  )

  // Handle mouse wheel for zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const delta = e.deltaY > 0 ? -1 : 1

      handleZoom(delta, mouseX, mouseY)
    },
    [handleZoom, containerRef]
  )

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button

    setState((prev) => ({
      ...prev,
      isDragging: true,
      lastMousePos: { x: e.clientX, y: e.clientY },
    }))
  }, [])

  // Handle mouse move for panning
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!state.isDragging || !state.lastMousePos) return

      const deltaX = e.clientX - state.lastMousePos.x
      const deltaY = e.clientY - state.lastMousePos.y

      setState((prev) => ({
        ...prev,
        transform: {
          ...prev.transform,
          translateX: prev.transform.translateX + deltaX,
          translateY: prev.transform.translateY + deltaY,
        },
        lastMousePos: { x: e.clientX, y: e.clientY },
      }))
    },
    [state.isDragging, state.lastMousePos]
  )

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
      lastMousePos: null,
    }))
  }, [])

  // Reset zoom and position
  const resetView = useCallback(() => {
    if (!containerRef.current || !image) return
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    fitImageToContainer(containerRect.width, containerRect.height, image)
  }, [fitImageToContainer, containerRef, image])

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !image) return

    // Set canvas size
    canvas.width = state.containerSize.width
    canvas.height = state.containerSize.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image with transformations
    const img = new Image()
    img.onload = () => {
      // Apply transformations
      ctx.save()
      ctx.translate(state.transform.translateX, state.transform.translateY)
      ctx.scale(state.transform.scale, state.transform.scale)

      // Draw image at origin since we're translating
      ctx.drawImage(img, 0, 0)

      ctx.restore()
    }
    img.src = image.src
  }, [state, image])

  // Render on state change
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = requestAnimationFrame(renderCanvas)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [renderCanvas])

  return {
    state,
    canvasRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    fitImageToContainer,
    handleZoom,
  }
}
