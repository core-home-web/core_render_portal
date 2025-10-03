'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { BulkFileUpload } from '@/components/ui/bulk-file-upload'
import { ColorPicker } from '@/components/ui/color-picker'
import { ScreenColorPicker } from '@/components/ui/screen-color-picker'
import { AnnotationPopupEditor } from '@/components/ui/annotation-popup-editor'
import { ItemDetailPopup } from '@/components/ui/item-detail-popup'
import { useProject } from '@/hooks/useProject'

const steps = [
  { id: 1, title: 'Project Details', description: 'Basic project information' },
  { id: 2, title: 'Items', description: 'Add items to be rendered' },
  { id: 3, title: 'Editor', description: 'Edit and annotate your items' },
  { id: 4, title: 'Review', description: 'Review and submit project' },
]

export default function NewProjectPage() {
  const router = useRouter()
  const { createProject, loading, error } = useProject()
  const [currentStep, setCurrentStep] = useState(1)
  const [localError, setLocalError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    retailer: '',
    items: [] as any[],
  })

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
      console.log('Submitting form data:', formData)

      // Clean up the data to ensure it matches the expected format
      const cleanData = {
        title: formData.title,
        retailer: formData.retailer,
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

      console.log('Cleaned data for submission:', cleanData)

      const project = await createProject(cleanData)
      if (project) {
        // Redirect to success page with project details
        router.push(
          `/project/success?id=${project.id}&title=${encodeURIComponent(project.title)}`
        )
      }
    } catch (err) {
      console.error('Failed to create project:', err)
      setLocalError('Failed to create project')
    }
  }

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.retailer
      case 2:
        return (
          formData.items.length > 0 &&
          formData.items.every((item: any) => item.name)
        )
      case 3:
        // Editor step - only require item names
        return (
          formData.items.length > 0 &&
          formData.items.every((item: any) => item.name)
        )
      case 4:
        // For the review step, we consider it complete if all previous steps are complete
        return (
          formData.title &&
          formData.retailer &&
          formData.items.length > 0 &&
          formData.items.every((item: any) => item.name)
        )
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectDetailsStep formData={formData} setFormData={setFormData} />
        )
      case 2:
        return <ItemsStep formData={formData} setFormData={setFormData} />
      case 3:
        return <EditorStep formData={formData} setFormData={setFormData} />
      case 4:
        return <ReviewStep formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-muted-foreground">
            Follow the steps below to create your project
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-medium">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {(error || localError) && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error || localError}
            <br />
            <small className="text-red-600">
              Check the browser console for more details.
            </small>
          </div>
        )}

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
          >
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepComplete(currentStep)}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !isStepComplete(currentStep)}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectDetailsStep({ formData, setFormData }: any) {
  const [showCustomRetailer, setShowCustomRetailer] = useState(false)
  const [customRetailer, setCustomRetailer] = useState('')

  const retailers = [
    'Amazon',
    'Walmart',
    'Target',
    'Best Buy',
    'Home Depot',
    'Costco',
    'Lowe\'s',
    'Macy\'s',
    'Nike',
    'Apple Store'
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Project Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded-md"
          placeholder="Enter project title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Retailer</label>
        
        {showCustomRetailer ? (
          <div className="space-y-3">
            <input
              type="text"
              value={customRetailer}
              onChange={(e) => setCustomRetailer(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter custom retailer name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCustomRetailerSubmit()
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCustomRetailerSubmit}
                size="sm"
                disabled={!customRetailer.trim()}
              >
                Add Retailer
              </Button>
              <Button
                onClick={() => {
                  setShowCustomRetailer(false)
                  setCustomRetailer('')
                }}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <select
            value={formData.retailer || ''}
            onChange={(e) => handleRetailerChange(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a retailer</option>
            {retailers.map((retailer) => (
              <option key={retailer} value={retailer}>
                {retailer}
              </option>
            ))}
            <option value="custom">+ Add New Retailer</option>
          </select>
        )}
        
        {formData.retailer && !showCustomRetailer && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">Selected: {formData.retailer}</span>
            <Button
              onClick={() => {
                setFormData({ ...formData, retailer: '' })
              }}
              size="sm"
              variant="outline"
            >
              Change
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ItemsStep({ formData, setFormData }: any) {
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

  // Bulk upload functionality
  const handleBulkImagesUpload = (urls: string[]) => {
    setBulkImages(urls)
  }

  const createItemsFromBulkImages = () => {
    const newItems = bulkImages.map((url, index) => ({
      name: `Item ${formData.items.length + index + 1}`,
      hero_image: url,
      needs_packaging: false,
      needs_logo: false,
    }))
    
    setFormData({
      ...formData,
      items: [...formData.items, ...newItems],
    })
    
    // Reset bulk upload state
    setBulkImages([])
    setBulkUploadMode(false)
  }

  const cancelBulkUpload = () => {
    setBulkImages([])
    setBulkUploadMode(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Items</h3>
        <div className="flex gap-2">
          <Button 
            onClick={() => setBulkUploadMode(true)} 
            size="sm"
            variant="outline"
          >
            Bulk Add Images
          </Button>
          <Button onClick={addItem} size="sm">
            Add Item
          </Button>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {bulkUploadMode && (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
          <div className="text-center space-y-4">
            <h4 className="text-lg font-medium text-blue-900">Bulk Image Upload</h4>
            <p className="text-blue-700">
              Upload multiple images at once to create items automatically
            </p>
            
            <BulkFileUpload 
              onImagesUploaded={handleBulkImagesUpload}
              maxFiles={10}
            />
            
            {bulkImages.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bulkImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center gap-2">
                  <Button 
                    onClick={createItemsFromBulkImages}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create {bulkImages.length} Items
                  </Button>
                  <Button 
                    onClick={cancelBulkUpload}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {formData.items.map((item: any, index: number) => (
        <div key={index} className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Item {index + 1}</h4>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeItem(index)}
            >
              Remove
            </Button>
          </div>
          
          {/* Gallery View with Image Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <FileUpload
                value={item.hero_image}
                onChange={(url) => updateItem(index, 'hero_image', url)}
                label="Hero Image"
                placeholder="Upload hero image for this item"
                onError={(error) => console.error('Upload error:', error)}
              />
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Item Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter item name"
                />
              </div>
              
              {/* Packaging and Logo Checkboxes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`needs-packaging-${index}`}
                    checked={item.needs_packaging || false}
                    onChange={(e) => updateItem(index, 'needs_packaging', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`needs-packaging-${index}`} className="text-sm font-medium text-gray-700">
                    Needs Packaging
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`needs-logo-${index}`}
                    checked={item.needs_logo || false}
                    onChange={(e) => updateItem(index, 'needs_logo', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`needs-logo-${index}`} className="text-sm font-medium text-gray-700">
                    Needs Logo
                  </label>
                </div>
              </div>
              
              {/* Packaging Details */}
              {item.needs_packaging && (
                <div>
                  <label className="block text-sm font-medium mb-2">Packaging Type</label>
                  <select
                    value={item.packaging_type || ''}
                    onChange={(e) => updateItem(index, 'packaging_type', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select packaging type</option>
                    <option value="box">Box</option>
                    <option value="bag">Bag</option>
                    <option value="sleeve">Sleeve</option>
                    <option value="wrap">Shrink Wrap</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              )}
              
              {/* Logo Details */}
              {item.needs_logo && (
                <div>
                  <label className="block text-sm font-medium mb-2">Logo Finish</label>
                  <select
                    value={item.logo_finish || ''}
                    onChange={(e) => updateItem(index, 'logo_finish', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select logo finish</option>
                    <option value="matte">Matte</option>
                    <option value="glossy">Glossy</option>
                    <option value="foil">Foil</option>
                    <option value="embossed">Embossed</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {formData.items.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No items added yet. Click "Add Item" to get started.
        </p>
      )}
    </div>
  )
}

function EditorStep({ formData, setFormData }: any) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [showAnnotationEditor, setShowAnnotationEditor] = useState(false)
  const [showItemDetailPopup, setShowItemDetailPopup] = useState(false)
  const currentItem = formData.items[currentItemIndex]

  const handleNextItem = () => {
    if (currentItemIndex < formData.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    }
  }

  const handlePreviousItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1)
    }
  }

  const updateCurrentItem = (field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[currentItemIndex] = { ...newItems[currentItemIndex], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const addPartToCurrentItem = () => {
    const newItems = [...formData.items]
    const currentItem = newItems[currentItemIndex]
    
    if (!currentItem.parts) {
      currentItem.parts = []
    }
    
    currentItem.parts.push({
      name: '',
      finish: '',
      color: '',
      texture: '',
      files: [],
    })
    
    setFormData({ ...formData, items: newItems })
  }

  const removePartFromCurrentItem = (partIndex: number) => {
    const newItems = [...formData.items]
    const currentItem = newItems[currentItemIndex]
    
    if (currentItem.parts) {
      currentItem.parts = currentItem.parts.filter((_: any, i: number) => i !== partIndex)
      setFormData({ ...formData, items: newItems })
    }
  }

  const updatePartInCurrentItem = (partIndex: number, field: string, value: string) => {
    const newItems = [...formData.items]
    const currentItem = newItems[currentItemIndex]
    
    if (currentItem.parts && currentItem.parts[partIndex]) {
      currentItem.parts[partIndex] = {
        ...currentItem.parts[partIndex],
        [field]: value,
      }
      setFormData({ ...formData, items: newItems })
    }
  }

  const openColorPicker = (partIndex: number) => {
    // Create a temporary input element for color picking
    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.value = currentItem?.parts?.[partIndex]?.color || '#000000'
    
    // Handle color selection
    colorInput.addEventListener('change', (e) => {
      const color = (e.target as HTMLInputElement).value
      updatePartInCurrentItem(partIndex, 'color', color)
    })
    
    // Trigger the color picker
    colorInput.click()
  }

  const handleAnnotationSave = (annotations: any[]) => {
    const newItems = [...formData.items]
    const currentItem = newItems[currentItemIndex]
    
    // Update parts with annotation data
    currentItem.parts = annotations.map(annotation => ({
      name: annotation.name,
      finish: annotation.finish,
      color: annotation.color,
      texture: annotation.texture,
      notes: annotation.notes,
      annotation_data: {
        x: annotation.x,
        y: annotation.y,
        id: annotation.id
      }
    }))
    
    setFormData({ ...formData, items: newItems })
    setShowAnnotationEditor(false)
  }

  if (formData.items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No items to edit. Please go back and add some items first.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Item Navigation */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <div>
          <h3 className="text-lg font-medium">
            Editing: {currentItem?.name || `Item ${currentItemIndex + 1}`}
          </h3>
          <p className="text-sm text-muted-foreground">
            Item {currentItemIndex + 1} of {formData.items.length}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handlePreviousItem}
            disabled={currentItemIndex === 0}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <Button
            onClick={handleNextItem}
            disabled={currentItemIndex === formData.items.length - 1}
            size="sm"
          >
            Next Item
          </Button>
        </div>
      </div>

      {/* Item Editor */}
      <div className="border rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div>
            <h4 className="font-medium mb-4">Image Preview</h4>
            {currentItem?.hero_image ? (
              <div className="relative">
                <img
                  src={currentItem.hero_image}
                  alt={currentItem.name}
                  className="w-full h-64 object-contain border rounded-lg bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowItemDetailPopup(true)}
                  title="Click to view full image and details"
                />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs">
                  {currentItem.name}
                </div>
                {/* Show annotation dots on main preview */}
                {currentItem.parts && currentItem.parts.map((part: any, partIdx: number) => {
                  if (part.annotation_data) {
                    return (
                      <div
                        key={partIdx}
                        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                        style={{
                          left: `${part.annotation_data.x}%`,
                          top: `${part.annotation_data.y}%`,
                          backgroundColor: part.color || '#3b82f6',
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={`${part.name || 'Part'} - ${part.color || '#3b82f6'}`}
                      >
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {partIdx + 1}
                        </div>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            ) : (
              <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <p className="text-muted-foreground">No image uploaded</p>
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Item Details</h4>
            
            <div>
              <label className="block text-sm font-medium mb-2">Item Name</label>
              <input
                type="text"
                value={currentItem?.name || ''}
                onChange={(e) => updateCurrentItem('name', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter item name"
              />
            </div>

            {/* Packaging and Logo Checkboxes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`editor-needs-packaging`}
                  checked={currentItem?.needs_packaging || false}
                  onChange={(e) => updateCurrentItem('needs_packaging', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`editor-needs-packaging`} className="text-sm font-medium text-gray-700">
                  Needs Packaging
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`editor-needs-logo`}
                  checked={currentItem?.needs_logo || false}
                  onChange={(e) => updateCurrentItem('needs_logo', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`editor-needs-logo`} className="text-sm font-medium text-gray-700">
                  Needs Logo
                </label>
              </div>
            </div>

            {/* Packaging Details */}
            {currentItem?.needs_packaging && (
              <div>
                <label className="block text-sm font-medium mb-2">Packaging Type</label>
                <select
                  value={currentItem?.packaging_type || ''}
                  onChange={(e) => updateCurrentItem('packaging_type', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select packaging type</option>
                  <option value="box">Box</option>
                  <option value="bag">Bag</option>
                  <option value="sleeve">Sleeve</option>
                  <option value="wrap">Shrink Wrap</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}

            {/* Logo Details */}
            {currentItem?.needs_logo && (
              <div>
                <label className="block text-sm font-medium mb-2">Logo Finish</label>
                <select
                  value={currentItem?.logo_finish || ''}
                  onChange={(e) => updateCurrentItem('logo_finish', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select logo finish</option>
                  <option value="matte">Matte</option>
                  <option value="glossy">Glossy</option>
                  <option value="foil">Foil</option>
                  <option value="embossed">Embossed</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}

            {/* Parts Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium">Parts</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAnnotationEditor(true)}
                    size="sm"
                    variant="default"
                  >
                    Part Annotations
                  </Button>
                  <Button
                    onClick={() => addPartToCurrentItem()}
                    size="sm"
                    variant="outline"
                  >
                    Add Part
                  </Button>
                </div>
              </div>
              
              {currentItem?.parts && currentItem.parts.length > 0 ? (
                <div className="space-y-3">
                  {currentItem.parts.map((part: any, partIndex: number) => (
                    <div key={partIndex} className="border rounded-md p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-sm">Part {partIndex + 1}</h5>
                        <Button
                          onClick={() => removePartFromCurrentItem(partIndex)}
                          size="sm"
                          variant="destructive"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Part Name</label>
                          <input
                            type="text"
                            value={part.name || ''}
                            onChange={(e) => updatePartInCurrentItem(partIndex, 'name', e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Enter part name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Finish</label>
                          <input
                            type="text"
                            value={part.finish || ''}
                            onChange={(e) => updatePartInCurrentItem(partIndex, 'finish', e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Enter finish"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Texture</label>
                          <input
                            type="text"
                            value={part.texture || ''}
                            onChange={(e) => updatePartInCurrentItem(partIndex, 'texture', e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Enter texture"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Color</label>
                          <ScreenColorPicker
                            currentColor={part.color || '#000000'}
                            onColorSelect={(color, format) => updatePartInCurrentItem(partIndex, 'color', color)}
                            className="mb-2"
                          />
                          <input
                            type="text"
                            value={part.color || ''}
                            onChange={(e) => updatePartInCurrentItem(partIndex, 'color', e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Or enter color manually"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-500">No parts added yet</p>
                  <p className="text-xs text-gray-400">Click "Add Part" to get started</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={currentItem?.notes || ''}
                onChange={(e) => updateCurrentItem('notes', e.target.value)}
                className="w-full p-2 border rounded-md h-20 resize-none"
                placeholder="Add any notes about this item..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Quick Navigation</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {formData.items.map((item: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentItemIndex(index)}
              className={`p-3 text-left border rounded-md transition-colors ${
                index === currentItemIndex
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Item Thumbnail with Annotations */}
              {item.hero_image && (
                <div className="relative mb-2">
                  <img
                    src={item.hero_image}
                    alt={item.name || `Item ${index + 1}`}
                    className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentItemIndex(index)
                      setShowItemDetailPopup(true)
                    }}
                    title="Click to view full image and details"
                  />
                  {/* Show annotation dots on thumbnail */}
                  {item.parts && item.parts.map((part: any, partIdx: number) => {
                    if (part.annotation_data) {
                      return (
                        <div
                          key={partIdx}
                          className="absolute w-2 h-2 rounded-full border border-white"
                          style={{
                            left: `${part.annotation_data.x}%`,
                            top: `${part.annotation_data.y}%`,
                            backgroundColor: part.color || '#3b82f6',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      )
                    }
                    return null
                  })}
                </div>
              )}
              
              <div className="font-medium text-sm">
                {item.name || `Item ${index + 1}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.needs_packaging && '📦'} {item.needs_logo && '🏷️'} {item.parts && item.parts.length > 0 && `🔧${item.parts.length}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Annotation Popup Editor */}
      <AnnotationPopupEditor
        item={currentItem}
        isOpen={showAnnotationEditor}
        onClose={() => setShowAnnotationEditor(false)}
        onSave={handleAnnotationSave}
      />

      {/* Item Detail Popup */}
      <ItemDetailPopup
        item={currentItem}
        isOpen={showItemDetailPopup}
        onClose={() => setShowItemDetailPopup(false)}
      />
    </div>
  )
}

function ReviewStep({ formData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Project Details</h3>
        <div className="space-y-2">
          <p>
            <strong>Title:</strong> {formData.title}
          </p>
          <p>
            <strong>Retailer:</strong> {formData.retailer}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">
          Items ({formData.items.length})
        </h3>
        {formData.items.map((item: any, index: number) => (
          <div key={index} className="border rounded-md p-4 mb-4">
            <h4 className="font-medium">{item.name || `Item ${index + 1}`}</h4>
            {item.hero_image && (
              <div className="mt-3">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Hero Image:
                </p>
                <div className="space-y-2">
                  <img
                    src={item.hero_image}
                    alt={`Hero image for ${item.name}`}
                    className="w-48 h-32 object-cover rounded border"
                  />
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {item.hero_image}
                  </p>
                </div>
              </div>
            )}
            {item.parts && item.parts.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Parts ({item.parts.length}):
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {item.parts.map((part: any, partIndex: number) => (
                    <div
                      key={partIndex}
                      className="border rounded-md p-3 bg-muted/50"
                    >
                      <h5 className="font-medium mb-2">
                        {part.name || `Part ${partIndex + 1}`}
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Finish:</strong> {part.finish}
                        </p>
                        <p>
                          <strong>Color:</strong>
                          <span
                            className="inline-block w-4 h-4 rounded border ml-2"
                            style={{ backgroundColor: part.color }}
                            title={part.color}
                          />
                          <span className="ml-1">{part.color}</span>
                        </p>
                        <p>
                          <strong>Texture:</strong> {part.texture}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
