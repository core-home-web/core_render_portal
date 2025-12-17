# Image Annotation

The image annotation feature allows users to mark parts on hero images with specifications.

## Overview

Users can:
- Upload hero images for items
- Click on images to place part markers
- Define part specifications (name, finish, color, texture)
- Store marker positions with coordinates

## How It Works

1. **Upload Image:** Add a hero image to an item
2. **Click to Add Marker:** Click on the image to place a part marker
3. **Enter Details:** Fill in part specifications in the popup
4. **Save:** Markers are saved with x/y coordinates

## Data Structure

Parts store their annotation coordinates:

```typescript
interface Part {
  id?: string
  name: string
  finish: string
  color: string
  texture: string
  files?: string[]
  notes?: string
  // Annotation data
  x?: number        // X coordinate (0-100 percentage)
  y?: number        // Y coordinate (0-100 percentage)
  annotation_data?: {
    x: number
    y: number
    id: string
  }
}
```

## Components

### AnnotationWorkspace

The main container for the annotation interface:

```typescript
// components/image-annotation/AnnotationWorkspace.tsx
export function AnnotationWorkspace({ 
  item, 
  onUpdateParts 
}: {
  item: Item
  onUpdateParts: (parts: Part[]) => void
}) {
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)

  return (
    <div className="flex gap-4">
      <ImageCanvas 
        imageUrl={item.hero_image}
        parts={item.parts}
        onAddMarker={(x, y) => {
          // Create new part at coordinates
        }}
        onSelectPart={setSelectedPart}
      />
      <PartDetailsPanel 
        part={selectedPart}
        onUpdate={(updated) => {
          // Update part details
        }}
      />
    </div>
  )
}
```

### ImageCanvas

Displays the image with clickable markers:

```typescript
// components/image-annotation/ImageCanvas.tsx
export function ImageCanvas({
  imageUrl,
  parts,
  onAddMarker,
  onSelectPart
}: {
  imageUrl: string
  parts: Part[]
  onAddMarker: (x: number, y: number) => void
  onSelectPart: (part: Part) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Calculate percentage position
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    onAddMarker(x, y)
  }

  return (
    <div 
      ref={containerRef}
      className="relative cursor-crosshair"
      onClick={handleClick}
    >
      <img src={imageUrl} alt="Item" className="w-full" />
      
      {parts.map(part => (
        part.x !== undefined && part.y !== undefined && (
          <PartMarker
            key={part.id}
            part={part}
            onClick={() => onSelectPart(part)}
            style={{
              left: `${part.x}%`,
              top: `${part.y}%`
            }}
          />
        )
      ))}
    </div>
  )
}
```

### PartMarker

A clickable marker on the image:

```typescript
// Part of ImageCanvas
function PartMarker({ part, onClick, style }) {
  return (
    <button
      className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full 
                 bg-teal-500 border-2 border-white shadow-lg
                 hover:scale-110 transition-transform"
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <span className="sr-only">{part.name}</span>
    </button>
  )
}
```

### PartDetailsPanel

Form for editing part specifications:

```typescript
// components/image-annotation/PartDetailsPanel.tsx
export function PartDetailsPanel({
  part,
  onUpdate,
  onDelete
}: {
  part: Part | null
  onUpdate: (part: Part) => void
  onDelete: (partId: string) => void
}) {
  if (!part) {
    return (
      <div className="p-4 text-gray-500">
        Click on the image to add a part marker
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Input
        label="Part Name"
        value={part.name}
        onChange={(e) => onUpdate({ ...part, name: e.target.value })}
      />
      
      <Select
        label="Finish"
        value={part.finish}
        onChange={(value) => onUpdate({ ...part, finish: value })}
        options={['Matte', 'Gloss', 'Satin', 'Textured']}
      />
      
      <ColorPicker
        label="Color"
        value={part.color}
        onChange={(color) => onUpdate({ ...part, color })}
      />
      
      <Input
        label="Texture"
        value={part.texture}
        onChange={(e) => onUpdate({ ...part, texture: e.target.value })}
      />
      
      <Textarea
        label="Notes"
        value={part.notes || ''}
        onChange={(e) => onUpdate({ ...part, notes: e.target.value })}
      />
      
      <Button
        variant="destructive"
        onClick={() => onDelete(part.id!)}
      >
        Delete Part
      </Button>
    </div>
  )
}
```

## Usage

### In Project Edit Form

```typescript
// Example usage in edit form
function EditProjectForm({ project }) {
  const [items, setItems] = useState(project.items)

  const updateItemParts = (itemId: string, parts: Part[]) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, parts } : item
    ))
  }

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          {item.hero_image && (
            <AnnotationWorkspace
              item={item}
              onUpdateParts={(parts) => updateItemParts(item.id, parts)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
```

## Coordinate System

Coordinates are stored as percentages (0-100) to be resolution-independent:

```typescript
// Converting click to percentage
const x = (clickX / containerWidth) * 100
const y = (clickY / containerHeight) * 100

// Rendering marker at percentage position
style={{ left: `${part.x}%`, top: `${part.y}%` }}
```

## File Upload

Parts can have associated reference files:

```typescript
// components/image-annotation/FileUpload.tsx
export function FileUpload({ 
  files, 
  onUpload, 
  onRemove 
}: {
  files: string[]
  onUpload: (urls: string[]) => void
  onRemove: (url: string) => void
}) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles) return

    const urls = await Promise.all(
      Array.from(uploadedFiles).map(async (file) => {
        const { data } = await supabase.storage
          .from('project-images')
          .upload(`parts/${crypto.randomUUID()}`, file)
        
        return supabase.storage
          .from('project-images')
          .getPublicUrl(data!.path).data.publicUrl
      })
    )

    onUpload(urls)
  }

  return (
    <div>
      <input type="file" multiple onChange={handleUpload} />
      <div className="flex flex-wrap gap-2 mt-2">
        {files.map(url => (
          <div key={url} className="relative">
            <img src={url} alt="" className="w-20 h-20 object-cover" />
            <button onClick={() => onRemove(url)}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Related Files

| File | Purpose |
|------|---------|
| `components/image-annotation/AnnotationWorkspace.tsx` | Main container |
| `components/image-annotation/ImageCanvas.tsx` | Image with markers |
| `components/image-annotation/PartDetailsPanel.tsx` | Part editing |
| `components/image-annotation/FileUpload.tsx` | File upload |
| `components/ui/color-picker.tsx` | Color selection |

## Troubleshooting

### Markers Not Showing

- Check part has x and y coordinates
- Verify coordinates are within 0-100 range
- Check z-index of markers

### Click Not Registering

- Ensure image has loaded
- Check container has dimensions
- Verify onClick handler is attached

### Image Not Loading

- Check image URL is valid
- Verify Supabase storage policies
- Check CORS settings

---

← [Whiteboard](./whiteboard.md) | Next: [Export](./export.md) →

