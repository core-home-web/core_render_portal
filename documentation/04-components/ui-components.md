# UI Components

Base UI components built with shadcn/ui and Radix UI primitives.

## Overview

The UI components are located in `components/ui/` and are based on [shadcn/ui](https://ui.shadcn.com/).

## Button

A clickable button with multiple variants.

```typescript
import { Button } from '@/components/ui/button'

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

// With icon
<Button>
  <Save className="mr-2 h-4 w-4" />
  Save
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | 'default' | Visual style |
| `size` | string | 'default' | Button size |
| `asChild` | boolean | false | Render as child element |
| `disabled` | boolean | false | Disable button |

## Input

Text input field with optional label.

```typescript
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Basic
<Input type="text" placeholder="Enter text" />

// With label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="email@example.com" />
</div>

// Disabled
<Input disabled placeholder="Disabled" />

// With error
<Input className="border-red-500" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | 'text' | Input type |
| `placeholder` | string | - | Placeholder text |
| `disabled` | boolean | false | Disable input |

## Select

Dropdown selection component.

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

## Card

Container with optional header and footer.

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Dialog

Modal dialog component.

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      Content here
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Badge

Status or category indicator.

```typescript
import { Badge } from '@/components/ui/badge'

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

## Checkbox

Selectable checkbox.

```typescript
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

<div className="flex items-center space-x-2">
  <Checkbox id="terms" checked={checked} onCheckedChange={setChecked} />
  <Label htmlFor="terms">Accept terms</Label>
</div>
```

## Tooltip

Hover tooltip for additional information.

```typescript
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Progress

Progress bar indicator.

```typescript
import { Progress } from '@/components/ui/progress'

<Progress value={33} />
<Progress value={66} className="h-2" />
```

## Textarea

Multi-line text input.

```typescript
import { Textarea } from '@/components/ui/textarea'

<Textarea 
  placeholder="Enter description..." 
  rows={4}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

## Color Picker

Custom color selection component.

```typescript
import { ColorPicker } from '@/components/ui/color-picker'

<ColorPicker 
  color={selectedColor} 
  onChange={setSelectedColor}
/>
```

## Custom Components

### Notification

Toast notification component.

```typescript
import { Notification } from '@/components/ui/notification'

<Notification
  type="success"
  title="Saved!"
  message="Your changes have been saved."
  onClose={() => setShowNotification(false)}
/>
```

### Confirm Dialog

Confirmation modal.

```typescript
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Project?"
  message="This action cannot be undone."
  confirmText="Delete"
  variant="destructive"
/>
```

### File Upload

File upload component.

```typescript
import { FileUpload } from '@/components/ui/file-upload'

<FileUpload
  accept="image/*"
  multiple
  onUpload={(files) => handleUpload(files)}
/>
```

## Using the cn() Utility

The `cn()` function merges Tailwind classes safely:

```typescript
import { cn } from '@/lib/utils'

// Merging classes
cn('px-4 py-2', 'bg-blue-500')
// Result: 'px-4 py-2 bg-blue-500'

// Conditional classes
cn('base-class', isActive && 'active-class')

// Overriding classes
cn('px-4', className)  // className can override px-4
```

## Accessibility

All components follow accessibility best practices:

- **Keyboard navigation** - Tab through interactive elements
- **Screen reader support** - ARIA labels and roles
- **Focus indicators** - Visible focus states
- **Color contrast** - WCAG compliant colors

---

← [Components Overview](./README.md) | Next: [Layout Components](./layout-components.md) →

