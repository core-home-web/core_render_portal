'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Plus, X, Check, ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatedProgressBar } from '@/components/ui/animated-progress-bar'
import { FileUpload } from '@/components/ui/file-upload'
import { BulkFileUpload } from '@/components/ui/bulk-file-upload'
import { ProjectOverview } from '@/components/ui/project-overview'
import { ItemEditor } from '@/components/ui/item-editor'
import { useProject } from '@/hooks/useProject'
import { useNotification } from '@/components/ui/notification'
import { useTheme } from '@/lib/theme-context'
import { ThemedButton } from '@/components/ui/themed-button'

const steps = [
  { id: 1, title: 'Project Details', description: 'Basic project information' },
  { id: 2, title: 'Add Items', description: 'Add items to be rendered' },
  { id: 3, title: 'Project Overview', description: 'Manage and edit items' },
  { id: 4, title: 'Review', description: 'Review and submit project' },
]

export default function NewProjectPage() {
  const router = useRouter()
  const { createProject, loading, error } = useProject()
  const { colors } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [localError, setLocalError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    retailer: '',
    project_logo: '',
    due_date: '',
    items: [] as any[],
  })
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const { showSuccess, showError, NotificationContainer } = useNotification()

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const cleanData = {
        title: formData.title,
        retailer: formData.retailer,
        due_date: formData.due_date || null,
        items: formData.items.map((item: any) => ({
          name: item.name,
          hero_image: item.hero_image || '',
          parts: (item.parts || []).map((part: any) => ({
            name: part.name,
            finish: part.finish,
            color: part.color || '',
            texture: part.texture,
            files: part.files || [],
          })),
        })),
      }

      const project = await createProject(cleanData)
      if (project) {
        showSuccess('Project Created', 'Your project has been successfully created.')
        router.push(`/project/success?id=${project.id}&title=${encodeURIComponent(project.title)}`)
      }
    } catch (err) {
      console.error('Failed to create project:', err)
      const errorMessage = 'Failed to create project'
      setLocalError(errorMessage)
      showError('Creation Failed', errorMessage)
    }
  }

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.retailer
      case 2:
        return formData.items.length > 0 && formData.items.every((item: any) => item.name)
      case 3:
        return formData.items.length > 0 && formData.items.every((item: any) => item.name)
      case 4:
        return formData.title && formData.retailer && formData.items.length > 0
      default:
        return false
    }
  }

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index)
  }

  const handleSaveItem = (updatedItem: any) => {
    const newItems = [...formData.items]
    newItems[editingItemIndex!] = updatedItem
    setFormData({ ...formData, items: newItems })
    setEditingItemIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingItemIndex(null)
  }

  const handleDeleteItem = (index: number) => {
    const newItems = formData.items.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, items: newItems })
    if (editingItemIndex === index) {
      setEditingItemIndex(null)
    }
  }

  const handleAddItemFromOverview = () => {
    setCurrentStep(2)
  }

  const renderStep = () => {
    if (editingItemIndex !== null) {
      return (
        <ItemEditor
          item={formData.items[editingItemIndex]}
          projectLogo={formData.project_logo}
          onSave={handleSaveItem}
          onCancel={handleCancelEdit}
          onDelete={() => handleDeleteItem(editingItemIndex)}
        />
      )
    }

    switch (currentStep) {
      case 1:
        return <ProjectDetailsStep formData={formData} setFormData={setFormData} colors={colors} />
      case 2:
        return <ItemsStep formData={formData} setFormData={setFormData} colors={colors} />
      case 3:
        return (
          <ProjectOverview
            items={formData.items}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItemFromOverview}
          />
        )
      case 4:
        return <ReviewStep formData={formData} colors={colors} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#070e0e]">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-6 transition-colors"
            style={{ color: colors.primary }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-4xl font-medium text-white mb-3">Create New Project</h1>
          <p className="text-[#595d60] text-lg">
            Follow the steps below to create your render project
          </p>
        </div>

        {/* Animated Progress Bar */}
        {editingItemIndex === null && (
          <div className="mb-12">
            <AnimatedProgressBar steps={steps} currentStep={currentStep} />
          </div>
        )}

        {/* Error Display */}
        {(error || localError) && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl">
            <strong className="font-semibold">Error:</strong> {error || localError}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-[#1a1e1f] rounded-2xl p-8 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        {editingItemIndex === null && (
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
                currentStep === 1
                  ? 'bg-[#222a31] text-[#595d60] cursor-not-allowed'
                  : 'bg-[#222a31] text-white hover:bg-[#2a3239]'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <ThemedButton
                onClick={handleNext}
                disabled={!isStepComplete(currentStep)}
                variant="primary"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </ThemedButton>
            ) : (
              <ThemedButton
                onClick={handleSubmit}
                disabled={loading || !isStepComplete(currentStep)}
                variant="primary"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </ThemedButton>
            )}
          </div>
        )}
      </div>
      {NotificationContainer}
    </div>
  )
}

// Helper function (needed for cn() calls)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function ProjectDetailsStep({ formData, setFormData, colors }: any) {
  const [showCustomRetailer, setShowCustomRetailer] = useState(false)
  const [customRetailer, setCustomRetailer] = useState('')

  const retailers = [
    'Amazon',
    'Walmart',
    'Target',
    'Best Buy',
    'Home Depot',
    'Costco',
    "Lowe's",
    "Macy's",
    'Nike',
    'Apple Store',
  ]

  const handleRetailerChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomRetailer(true)
      setFormData({ ...formData, retailer: '' })
    } else {
      setShowCustomRetailer(false)
      setCustomRetailer('')
      setFormData({ ...formData, retailer: value })
    }
  }

  const handleCustomRetailerSubmit = () => {
    if (customRetailer.trim()) {
      setFormData({ ...formData, retailer: customRetailer.trim() })
      setShowCustomRetailer(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Title */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Project Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-[#595d60] transition-colors focus:ring-1"
          style={{
            '--focus-color': colors.primary,
          } as React.CSSProperties}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary
            e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.primary}`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#374151'
            e.currentTarget.style.boxShadow = 'none'
          }}
          placeholder="Enter project title"
        />
      </div>

      {/* Project Logo */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Project Logo <span className="text-[#595d60]">(Optional)</span>
        </label>
        <div 
          className="border-2 border-dashed border-gray-700 rounded-xl p-6 transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#374151'}
        >
          <FileUpload
            value={formData.project_logo}
            onChange={(url) => setFormData({ ...formData, project_logo: url })}
            accept="image/*"
            maxSize={20}
            label=""
            placeholder="Click to upload project logo (Max size: 20MB)"
          />
        </div>
        {formData.project_logo && (
          <div className="mt-4 p-4 bg-[#0d1117] rounded-lg">
            <label className="block text-xs font-medium text-[#595d60] mb-2">Logo Preview</label>
            <div className="w-32 h-32 border border-gray-700 rounded-lg overflow-hidden bg-[#070e0e]">
              <img
                src={formData.project_logo}
                alt="Project Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Retailer */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Retailer <span className="text-red-400">*</span>
        </label>
        {showCustomRetailer ? (
          <div className="space-y-3">
            <input
              type="text"
              value={customRetailer}
              onChange={(e) => setCustomRetailer(e.target.value)}
              className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-[#595d60] focus:border-[#38bdbb] focus:ring-1 focus:ring-[#38bdbb] transition-colors"
              placeholder="Enter custom retailer name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCustomRetailerSubmit()
                }
              }}
            />
            <div className="flex gap-3">
              <ThemedButton
                onClick={handleCustomRetailerSubmit}
                disabled={!customRetailer.trim()}
                variant="primary"
                size="sm"
              >
                Add Retailer
              </ThemedButton>
              <button
                onClick={() => {
                  setShowCustomRetailer(false)
                  setCustomRetailer('')
                }}
                className="px-4 py-2 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <select
            value={formData.retailer || ''}
            onChange={(e) => handleRetailerChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-[#38bdbb] focus:ring-1 focus:ring-[#38bdbb] transition-colors"
          >
            <option value="" className="bg-[#1a1e1f]">Select a retailer</option>
            {retailers.map((retailer) => (
              <option key={retailer} value={retailer} className="bg-[#1a1e1f]">
                {retailer}
              </option>
            ))}
            <option value="custom" className="bg-[#1a1e1f]">+ Add New Retailer</option>
          </select>
        )}

          {formData.retailer && !showCustomRetailer && (
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-[#595d60]">Selected:</span>
            <span className="font-medium" style={{ color: colors.primary }}>{formData.retailer}</span>
            <button
              onClick={() => setFormData({ ...formData, retailer: '' })}
              className="text-[#595d60] hover:text-white transition-colors"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Due Date <span className="text-[#595d60]">(Optional)</span>
        </label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white transition-colors focus:ring-1"
          style={{
            colorScheme: 'dark',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary
            e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.primary}`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#374151'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <p className="text-xs text-[#595d60] mt-2">
          Set a target completion date for this project
        </p>
      </div>
    </div>
  )
}

function ItemsStep({ formData, setFormData, colors }: any) {
  const [bulkUploadMode, setBulkUploadMode] = useState(false)
  const [bulkImages, setBulkImages] = useState<string[]>([])

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', hero_image: '' }],
    })
  }

  const updateItem = (index: number, field: string, value: string | boolean) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleBulkImagesUpload = (urls: string[]) => {
    setBulkImages(urls)
  }

  const createItemsFromBulkImages = () => {
    const newItems = bulkImages.map((url, index) => ({
      name: `Item ${formData.items.length + index + 1}`,
      hero_image: url,
    }))

    setFormData({
      ...formData,
      items: [...formData.items, ...newItems],
    })

    setBulkImages([])
    setBulkUploadMode(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-white">Items to Render</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setBulkUploadMode(true)}
            className="px-4 py-2 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors text-sm"
          >
            Bulk Add Images
          </button>
          <ThemedButton
            onClick={addItem}
            variant="primary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </ThemedButton>
        </div>
      </div>

      {/* Bulk Upload */}
      {bulkUploadMode && (
        <div className="border-2 rounded-xl p-6" style={{ borderColor: colors.primary, backgroundColor: colors.primaryLight }}>
          <div className="text-center space-y-4">
            <h4 className="text-lg font-medium text-white">Bulk Image Upload</h4>
            <p className="text-[#595d60]">
              Upload multiple images at once to create items automatically
            </p>

            <BulkFileUpload onImagesUploaded={handleBulkImagesUpload} maxFiles={10} />

            {bulkImages.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {bulkImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-700"
                      />
                      <span className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.primary }}>
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-3">
                  <ThemedButton
                    onClick={createItemsFromBulkImages}
                    variant="primary"
                  >
                    Create {bulkImages.length} Items
                  </ThemedButton>
                  <button
                    onClick={() => {
                      setBulkImages([])
                      setBulkUploadMode(false)
                    }}
                    className="px-6 py-3 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {formData.items.map((item: any, index: number) => (
          <div
            key={index}
            className="bg-[#0d1117] border border-gray-700 rounded-xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-white">Item {index + 1}</h4>
              <button
                onClick={() => removeItem(index)}
                className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-white mb-2">Hero Image</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-[#38bdbb] transition-colors">
                  <FileUpload
                    value={item.hero_image}
                    onChange={(url) => updateItem(index, 'hero_image', url)}
                    label=""
                    placeholder="Upload hero image"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">Item Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="w-full px-4 py-3 bg-[#070e0e] border border-gray-700 rounded-lg text-white placeholder-[#595d60] focus:border-[#38bdbb] focus:ring-1 focus:ring-[#38bdbb] transition-colors"
                  placeholder="Enter item name"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {formData.items.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
          <Upload className="w-12 h-12 text-[#595d60] mx-auto mb-4" />
          <p className="text-[#595d60] mb-4">No items added yet</p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2"
          >
            <ThemedButton variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </ThemedButton>
          </button>
        </div>
      )}
    </div>
  )
}

function ReviewStep({ formData, colors }: any) {
  return (
    <div className="space-y-8">
      {/* Project Details */}
      <div className="bg-[#0d1117] rounded-xl p-6">
        <h3 className="text-xl font-medium text-white mb-6">Project Details</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[#595d60]">Title:</span>
            <span className="text-white font-medium">{formData.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#595d60]">Retailer:</span>
            <span className="text-white font-medium">{formData.retailer}</span>
          </div>
          {formData.due_date && (
            <div className="flex items-center gap-3">
              <span className="text-[#595d60]">Due Date:</span>
              <span className="text-white font-medium">
                {new Date(formData.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div>
        <h3 className="text-xl font-medium text-white mb-6">
          Items ({formData.items.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formData.items.map((item: any, index: number) => (
            <div key={index} className="bg-[#0d1117] rounded-xl overflow-hidden border border-gray-700">
              {item.hero_image ? (
                <img
                  src={item.hero_image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-[#070e0e] flex items-center justify-center">
                  <span className="text-[#595d60]">No image</span>
                </div>
              )}
              <div className="p-4">
                <h4 className="font-medium text-white">{item.name || `Item ${index + 1}`}</h4>
                {item.parts && item.parts.length > 0 && (
                  <p className="text-sm text-[#595d60] mt-2">{item.parts.length} parts configured</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl p-6" style={{ backgroundColor: colors.primaryLight, borderWidth: '1px', borderStyle: 'solid', borderColor: `${colors.primary}50` }}>
        <div className="flex items-start gap-4">
          <Check className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: colors.primary }} />
          <div>
            <h4 className="text-lg font-medium text-white mb-2">Ready to Create</h4>
            <p className="text-[#595d60]">
              Your project is configured with {formData.items.length} item
              {formData.items.length !== 1 ? 's' : ''}. Click "Create Project" to finalize.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

