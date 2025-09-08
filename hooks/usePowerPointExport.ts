import { useState, useCallback } from 'react'
import { generateHTMLPresentation } from '../lib/html-presentation-generator'
import { ExportOptions } from '../components/project/export-project-modal'
import { Project } from '../types'

interface ExportState {
  isExporting: boolean
  progress: number
  currentStep: string
  error: string | null
}

export function usePowerPointExport() {
  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    progress: 0,
    currentStep: 'Preparing export...',
    error: null,
  })

  const exportToPowerPoint = useCallback(
    async (project: Project, options: ExportOptions) => {
      try {
        setExportState({
          isExporting: true,
          progress: 0,
          currentStep: 'Initializing PowerPoint...',
          error: null,
        })

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setExportState((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + 10, 90),
          }))
        }, 200)

        // Update steps
        setTimeout(() => {
          setExportState((prev) => ({
            ...prev,
            currentStep: 'Collecting project data...',
          }))
        }, 500)

        setTimeout(() => {
          setExportState((prev) => ({
            ...prev,
            currentStep: 'Processing images...',
          }))
        }, 1000)

        setTimeout(() => {
          setExportState((prev) => ({
            ...prev,
            currentStep: 'Generating HTML presentation...',
          }))
        }, 1500)

        // Generate HTML Presentation
        const htmlContent = generateHTMLPresentation(project, options)
        const blob = new Blob([htmlContent], { type: 'text/html' })

        // Clear progress interval
        clearInterval(progressInterval)

        // Final progress update
        setExportState((prev) => ({
          ...prev,
          progress: 100,
          currentStep: 'HTML presentation ready!',
          isExporting: false,
        }))

        // Trigger download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // Reset state after a delay
        setTimeout(() => {
          setExportState({
            isExporting: false,
            progress: 0,
            currentStep: 'Preparing export...',
            error: null,
          })
        }, 3000)
      } catch (error) {
        console.error('Export error:', error)
        setExportState({
          isExporting: false,
          progress: 0,
          currentStep: 'Export failed',
          error:
            error instanceof Error
              ? error.message
              : 'Failed to generate HTML presentation',
        })
      }
    },
    []
  )

  const resetExport = useCallback(() => {
    setExportState({
      isExporting: false,
      progress: 0,
      currentStep: 'Preparing export...',
      error: null,
    })
  }, [])

  return {
    ...exportState,
    exportToPowerPoint,
    resetExport,
  }
}
