# File Upload & Color Picker Features

## Overview

The Core Render Portal now supports advanced file upload functionality for hero images and a sophisticated color picker for part colors. These features enhance the user experience and provide more precise control over project data.

## 🖼️ File Upload Feature

### Hero Image Upload
- **Drag & Drop Support**: Users can drag images directly onto the upload area
- **Click to Upload**: Traditional file selection via click
- **Image Preview**: Real-time preview of uploaded images
- **File Validation**: Automatic validation of file type and size
- **Supabase Storage**: Secure cloud storage with public URLs

### Technical Implementation

#### FileUpload Component
```tsx
<FileUpload
  value={item.hero_image}
  onChange={(url) => updateItem(itemIndex, { ...item, hero_image: url })}
  label="Hero Image"
  placeholder="Upload hero image for this item"
  onError={(error) => console.error('Upload error:', error)}
  maxSize={5} // 5MB limit
  accept="image/*"
/>
```

#### Features
- **File Type Validation**: Only accepts image files
- **Size Limits**: Configurable file size limits (default: 5MB)
- **Unique Filenames**: Auto-generates unique filenames to prevent conflicts
- **Progress Feedback**: Shows upload progress and status
- **Error Handling**: Comprehensive error handling with user feedback
- **Remove Functionality**: Users can remove uploaded images

#### Storage Configuration
- **Bucket**: `project-files` in Supabase Storage
- **Public Access**: Images are publicly accessible via URLs
- **Security**: Authenticated users can upload, public can view
- **File Path**: `uploads/{unique-filename}.{extension}`

### Setup Instructions

1. **Run Storage Setup**:
   ```bash
   npm run setup-storage
   ```

2. **Environment Variables**:
   Ensure your `.env.local` has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Supabase Dashboard**:
   - Enable Storage in your Supabase project
   - Verify the `project-files` bucket exists
   - Check storage policies are applied

## 🎨 Color Picker Feature

### Advanced Color Selection
- **Multiple Formats**: Support for HEX, RGB, and other color formats
- **Color Picker**: Native browser color picker integration
- **Eye Dropper**: Screen color picker (modern browsers)
- **Auto-Conversion**: Automatic format detection and conversion
- **Visual Preview**: Color preview with click-to-open picker

### Technical Implementation

#### ColorPicker Component
```tsx
<ColorPicker
  value={part.color}
  onChange={(color) => updatePart(itemIndex, partIndex, { ...part, color })}
  label="Color"
  placeholder="Enter color value"
/>
```

#### Features
- **Format Support**:
  - HEX: `#ff0000`, `ff0000` (auto-adds #)
  - RGB: `rgb(255, 0, 0)`, `255, 0, 0` (auto-adds rgb())
  - Auto-detection and conversion between formats

- **Interactive Elements**:
  - **Color Preview**: Click to open color picker
  - **Format Toggle**: Switch between HEX/RGB display
  - **Eye Dropper**: Pick colors from screen (modern browsers)
  - **Manual Input**: Direct color value entry

- **Smart Conversion**:
  - HEX to RGB: `#ff0000` → `rgb(255, 0, 0)`
  - RGB to HEX: `rgb(255, 0, 0)` → `#ff0000`
  - Partial input handling: `ff0000` → `#ff0000`

### User Experience

#### Color Input Methods
1. **Manual Entry**: Type color values directly
2. **Color Picker**: Click preview to open native picker
3. **Eye Dropper**: Click pipette icon to pick from screen
4. **Format Toggle**: Switch between HEX and RGB display

#### Supported Input Formats
- `#ff0000` (HEX with #)
- `ff0000` (HEX without #)
- `rgb(255, 0, 0)` (RGB with function)
- `255, 0, 0` (RGB values only)

## 🔧 Integration

### Edit Project Form
The edit project form now uses both components:
- **Hero Images**: FileUpload component replaces URL input
- **Part Colors**: ColorPicker component replaces text input

### New Project Form
The new project creation form also includes:
- **Step 2 (Items)**: FileUpload for hero images
- **Step 3 (Parts)**: ColorPicker for part colors

### Review Step
The review step now shows:
- **Image Previews**: Actual uploaded images
- **Color Previews**: Visual color swatches

## 🛡️ Security & Performance

### File Upload Security
- **File Type Validation**: Only image files accepted
- **Size Limits**: Configurable maximum file sizes
- **Unique Filenames**: Prevents filename conflicts
- **Authenticated Uploads**: Only logged-in users can upload
- **Public Read Access**: Images are publicly viewable

### Color Picker Security
- **Input Sanitization**: Validates color format inputs
- **Format Conversion**: Safe conversion between formats
- **Browser Compatibility**: Graceful fallbacks for older browsers

## 📱 Browser Support

### File Upload
- **Modern Browsers**: Full drag & drop support
- **Mobile**: Touch-friendly file selection
- **Fallbacks**: Traditional file input for older browsers

### Color Picker
- **Modern Browsers**: Full color picker and eye dropper
- **Older Browsers**: Manual input with format conversion
- **Mobile**: Touch-optimized color selection

## 🚀 Usage Examples

### Uploading a Hero Image
1. Click the upload area or drag an image file
2. Select an image file (JPG, PNG, GIF, etc.)
3. File uploads to Supabase Storage
4. Preview appears with remove option
5. URL is automatically saved to project

### Setting a Part Color
1. Click the color preview or use the eye dropper
2. Select a color from the picker
3. Color value updates in HEX format
4. Toggle to RGB format if needed
5. Manual entry also supported

## 🔄 Migration

### Existing Projects
- **Hero Images**: Existing URL-based images continue to work
- **Colors**: Existing color values are preserved
- **Backward Compatibility**: No breaking changes

### New Projects
- **Enhanced UX**: Better file and color selection
- **Improved Data**: More accurate color values
- **Visual Feedback**: Immediate previews and feedback

## 📊 Benefits

### For Users
- **Easier Uploads**: Drag & drop file uploads
- **Better Colors**: Visual color selection
- **Immediate Feedback**: Real-time previews
- **Multiple Formats**: Flexible color input methods

### For Developers
- **Reusable Components**: Modular file upload and color picker
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error management
- **Extensible**: Easy to customize and extend

## 🔮 Future Enhancements

### Planned Features
- **Image Cropping**: In-browser image editing
- **Color Palettes**: Predefined color schemes
- **Bulk Upload**: Multiple file uploads
- **Advanced Formats**: Support for more color formats
- **Image Optimization**: Automatic image compression 