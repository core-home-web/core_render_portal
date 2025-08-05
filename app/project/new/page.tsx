'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { ColorPicker } from '@/components/ui/color-picker'
import { useProject } from '@/hooks/useProject'

const steps = [
  { id: 1, title: 'Project Details', description: 'Basic project information' },
  { id: 2, title: 'Items', description: 'Add items to be rendered' },
  { id: 3, title: 'Parts', description: 'Configure parts for each item' },
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
            files: part.files || []
          }))
        }))
      }
      
      console.log('Cleaned data for submission:', cleanData)
      
      const project = await createProject(cleanData)
      if (project) {
        // Redirect to success page with project details
        router.push(`/project/success?id=${project.id}&title=${encodeURIComponent(project.title)}`)
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
        return formData.items.length > 0 && formData.items.every((item: any) => item.name)
      case 3:
        return formData.items.every((item: any) => 
          item.parts && item.parts.length > 0 && 
          item.parts.every((part: any) => part.name && part.finish && part.texture)
        )
      case 4:
        // For the review step, we consider it complete if all previous steps are complete
        return formData.title && formData.retailer && 
          formData.items.length > 0 && 
          formData.items.every((item: any) => item.name) &&
          formData.items.every((item: any) => 
            item.parts && item.parts.length > 0 && 
            item.parts.every((part: any) => part.name && part.finish && part.texture)
          )
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProjectDetailsStep formData={formData} setFormData={setFormData} />
      case 2:
        return <ItemsStep formData={formData} setFormData={setFormData} />
      case 3:
        return <PartsStep formData={formData} setFormData={setFormData} />
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
            <small className="text-red-600">Check the browser console for more details.</small>
          </div>
        )}

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
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
        <input
          type="text"
          value={formData.retailer}
          onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
          className="w-full p-2 border rounded-md"
          placeholder="Enter retailer name"
        />
      </div>
    </div>
  )
}

function ItemsStep({ formData, setFormData }: any) {
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', hero_image: '' }],
    })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Items</h3>
        <Button onClick={addItem} size="sm">
          Add Item
        </Button>
      </div>
      
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
          <div>
            <FileUpload
              value={item.hero_image}
              onChange={(url) => updateItem(index, 'hero_image', url)}
              label="Hero Image"
              placeholder="Upload hero image for this item"
              onError={(error) => console.error('Upload error:', error)}
            />
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

function PartsStep({ formData, setFormData }: any) {
  const addPart = (itemIndex: number) => {
    const newItems = [...formData.items]
    if (!newItems[itemIndex].parts) {
      newItems[itemIndex].parts = []
    }
    newItems[itemIndex].parts.push({
      name: '',
      finish: '',
      color: '',
      texture: '',
      files: [],
    })
    setFormData({ ...formData, items: newItems })
  }

  const updatePart = (itemIndex: number, partIndex: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[itemIndex].parts[partIndex] = {
      ...newItems[itemIndex].parts[partIndex],
      [field]: value,
    }
    setFormData({ ...formData, items: newItems })
  }

  const removePart = (itemIndex: number, partIndex: number) => {
    const newItems = [...formData.items]
    newItems[itemIndex].parts = newItems[itemIndex].parts.filter(
      (_: any, i: number) => i !== partIndex
    )
    setFormData({ ...formData, items: newItems })
  }

  return (
    <div className="space-y-6">
      {formData.items.map((item: any, itemIndex: number) => (
        <div key={itemIndex} className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{item.name || `Item ${itemIndex + 1}`}</h3>
            <Button onClick={() => addPart(itemIndex)} size="sm">
              Add Part
            </Button>
          </div>
          
          {item.parts && item.parts.map((part: any, partIndex: number) => (
            <div key={partIndex} className="border rounded-md p-4 mb-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Part {partIndex + 1}</h4>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removePart(itemIndex, partIndex)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Part Name</label>
                  <input
                    type="text"
                    value={part.name}
                    onChange={(e) => updatePart(itemIndex, partIndex, 'name', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter part name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Finish</label>
                  <input
                    type="text"
                    value={part.finish}
                    onChange={(e) => updatePart(itemIndex, partIndex, 'finish', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter finish"
                  />
                </div>
                <div className="col-span-2">
                  <ColorPicker
                    value={part.color}
                    onChange={(color) => updatePart(itemIndex, partIndex, 'color', color)}
                    label="Color"
                    placeholder="Enter color value"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Texture</label>
                  <input
                    type="text"
                    value={part.texture}
                    onChange={(e) => updatePart(itemIndex, partIndex, 'texture', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter texture"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(!item.parts || item.parts.length === 0) && (
            <p className="text-muted-foreground text-center py-4">
              No parts added yet. Click "Add Part" to get started.
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function ReviewStep({ formData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Project Details</h3>
        <div className="space-y-2">
          <p><strong>Title:</strong> {formData.title}</p>
          <p><strong>Retailer:</strong> {formData.retailer}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Items ({formData.items.length})</h3>
        {formData.items.map((item: any, index: number) => (
          <div key={index} className="border rounded-md p-4 mb-4">
            <h4 className="font-medium">{item.name || `Item ${index + 1}`}</h4>
            {item.hero_image && (
              <div className="mt-3">
                <p className="text-sm font-medium text-muted-foreground mb-2">Hero Image:</p>
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
                <p className="text-sm font-medium text-muted-foreground mb-2">Parts ({item.parts.length}):</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {item.parts.map((part: any, partIndex: number) => (
                    <div key={partIndex} className="border rounded-md p-3 bg-muted/50">
                      <h5 className="font-medium mb-2">{part.name || `Part ${partIndex + 1}`}</h5>
                      <div className="space-y-1 text-sm">
                        <p><strong>Finish:</strong> {part.finish}</p>
                        <p><strong>Color:</strong> 
                          <span 
                            className="inline-block w-4 h-4 rounded border ml-2"
                            style={{ backgroundColor: part.color }}
                            title={part.color}
                          />
                          <span className="ml-1">{part.color}</span>
                        </p>
                        <p><strong>Texture:</strong> {part.texture}</p>
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