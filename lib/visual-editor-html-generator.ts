import { Project, Item, Part, hasVersions, getAllItemParts } from '../types'

// Extended interfaces for visual editor
interface ExtendedItem extends Omit<Item, 'parts' | 'versions'> {
  needs_packaging?: boolean
  needs_logo?: boolean
  packaging_type?: string
  custom_logo?: string
  notes?: string
  parts?: Array<{
    name: string
    finish: string
    color: string
    texture: string
    notes?: string
    annotation_data?: {
      x: number
      y: number
      id: string
    }
  }>
  versions?: Array<{
    id: string
    versionNumber: number
    versionName?: string
    parts: Array<{
      name: string
      finish: string
      color: string
      texture: string
      notes?: string
      annotation_data?: {
        x: number
        y: number
        id: string
      }
    }>
  }>
}

export interface VisualEditorExportOptions {
  title: string
  imageFit: 'contain' | 'cover' | 'fill' | 'stretch'
  showAnnotations: boolean
  showPartDetails: boolean
  showNavigation: boolean
  theme: 'light' | 'dark' | 'auto'
  slideTransition: 'fade' | 'slide' | 'none'
  autoPlay: boolean
  autoPlayInterval: number // in seconds
}

export class VisualEditorHTMLGenerator {
  private project: Project & { items?: ExtendedItem[] }
  private options: VisualEditorExportOptions

  constructor(project: Project, options: VisualEditorExportOptions) {
    this.project = project as Project & { items?: ExtendedItem[] }
    this.options = options
  }

  generate(): string {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.options.title}</title>
    <style>
        ${this.generateCSS()}
    </style>
</head>
<body class="${this.options.theme}">
    <div class="presentation-container">
        <!-- Navigation Controls -->
        ${this.options.showNavigation ? this.generateNavigation() : ''}
        
        <!-- Slides Container -->
        <div class="slides-container">
            ${this.generateSlides()}
        </div>
        
        <!-- Slide Counter -->
        <div class="slide-counter">
            <span class="current-slide">1</span> / <span class="total-slides">${this.project.items?.length || 1}</span>
        </div>
        
        <!-- Controls -->
        <div class="presentation-controls">
            <button class="control-btn" id="prevBtn" onclick="previousSlide()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
            </button>
            <button class="control-btn" id="playPauseBtn" onclick="toggleAutoPlay()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
            </button>
            <button class="control-btn" id="nextBtn" onclick="nextSlide()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
            </button>
            <button class="control-btn" id="fullscreenBtn" onclick="toggleFullscreen()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
            </button>
        </div>
        
        <!-- Image Fit Controls -->
        <div class="image-controls">
            <label for="imageFit">Image Fit:</label>
            <select id="imageFit" onchange="changeImageFit(this.value)">
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
                <option value="fill">Fill</option>
                <option value="stretch">Stretch</option>
            </select>
        </div>
    </div>

    <script>
        ${this.generateJavaScript()}
    </script>
</body>
</html>`

    return html
  }

  private generateCSS(): string {
    const isDark = this.options.theme === 'dark'
    const bgColor = isDark ? '#1a1a1a' : '#ffffff'
    const textColor = isDark ? '#ffffff' : '#000000'
    const cardBg = isDark ? '#2a2a2a' : '#f8f9fa'
    const borderColor = isDark ? '#404040' : '#e0e0e0'

    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${bgColor};
            color: ${textColor};
            overflow: hidden;
            height: 100vh;
        }

        .presentation-container {
            position: relative;
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .slides-container {
            flex: 1;
            position: relative;
            overflow: hidden;
        }

        .slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: ${this.getTransitionCSS()};
            padding: 40px;
            box-sizing: border-box;
        }

        .slide.active {
            opacity: 1;
        }

        .slide-content {
            display: flex;
            width: 100%;
            height: 100%;
            gap: 40px;
            align-items: center;
        }

        .image-section {
            flex: 2;
            position: relative;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${cardBg};
            border-radius: 12px;
            padding: 20px;
        }

        .item-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: ${this.options.imageFit};
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }

        .item-image:hover {
            transform: scale(1.02);
        }

        .annotation-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        .annotation-dot {
            position: absolute;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            cursor: pointer;
            pointer-events: all;
            transition: all 0.2s ease;
            transform: translate(-50%, -50%);
        }

        .annotation-dot:hover {
            transform: translate(-50%, -50%) scale(1.2);
            z-index: 10;
        }

        .annotation-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
            margin-bottom: 8px;
        }

        .annotation-dot:hover .annotation-tooltip {
            opacity: 1;
        }

        .details-section {
            flex: 1;
            padding: 20px;
            background: ${cardBg};
            border-radius: 12px;
            overflow-y: auto;
            max-height: 100%;
        }

        .item-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 16px;
            color: ${textColor};
        }

        .item-info {
            margin-bottom: 24px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid ${borderColor};
        }

        .info-label {
            font-weight: 600;
            color: ${textColor};
        }

        .info-value {
            color: ${isDark ? '#cccccc' : '#666666'};
        }

        .parts-section {
            margin-top: 24px;
        }

        .parts-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: ${textColor};
        }

        .part-item {
            background: ${isDark ? '#1a1a1a' : '#ffffff'};
            border: 1px solid ${borderColor};
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            transition: all 0.2s ease;
        }

        .part-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .part-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .part-color {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .part-name {
            font-weight: 600;
            color: ${textColor};
        }

        .part-details {
            font-size: 0.9rem;
            color: ${isDark ? '#cccccc' : '#666666'};
            line-height: 1.4;
        }

        .navigation {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .presentation-container:hover .navigation {
            opacity: 1;
        }

        .nav-btn {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .nav-btn:hover {
            background: rgba(0, 0, 0, 0.9);
            transform: translateY(-1px);
        }

        .slide-counter {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            z-index: 100;
        }

        .presentation-controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 12px;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .presentation-container:hover .presentation-controls {
            opacity: 1;
        }

        .control-btn {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .control-btn:hover {
            background: rgba(0, 0, 0, 0.9);
            transform: scale(1.1);
        }

        .image-controls {
            position: absolute;
            bottom: 20px;
            left: 20px;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .presentation-container:hover .image-controls {
            opacity: 1;
        }

        .image-controls label {
            color: white;
            font-size: 14px;
            margin-right: 8px;
        }

        .image-controls select {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
        }

        .image-controls select:focus {
            outline: none;
            border-color: #3b82f6;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .slide-content {
                flex-direction: column;
                gap: 20px;
            }

            .image-section,
            .details-section {
                flex: none;
                height: 50%;
            }

            .item-title {
                font-size: 1.5rem;
            }

            .presentation-controls {
                bottom: 10px;
            }

            .control-btn {
                width: 40px;
                height: 40px;
            }
        }

        /* Print Styles */
        @media print {
            .navigation,
            .presentation-controls,
            .slide-counter,
            .image-controls {
                display: none;
            }

            .slide {
                page-break-after: always;
                opacity: 1;
            }

            .slide:last-child {
                page-break-after: avoid;
            }
        }
    `
  }

  private getTransitionCSS(): string {
    switch (this.options.slideTransition) {
      case 'fade':
        return 'opacity 0.5s ease-in-out'
      case 'slide':
        return 'transform 0.5s ease-in-out'
      default:
        return 'none'
    }
  }

  private generateNavigation(): string {
    return `
        <div class="navigation">
            <button class="nav-btn" onclick="previousSlide()">← Previous</button>
            <button class="nav-btn" onclick="nextSlide()">Next →</button>
        </div>
    `
  }

  private generateSlides(): string {
    if (!this.project.items || this.project.items.length === 0) {
      return this.generateEmptySlide()
    }

    return this.project.items.map((item, index) => this.generateItemSlide(item, index)).join('')
  }

  private generateItemSlide(item: ExtendedItem, index: number): string {
    const hasImage = item.hero_image
    // Get parts from versions or legacy format
    const itemWithVersions = item as Item
    const parts = hasVersions(itemWithVersions)
      ? (itemWithVersions.versions?.[0]?.parts || [])
      : (item.parts || [])
    const annotations = this.generateAnnotations(parts)

    return `
        <div class="slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <div class="slide-content">
                <div class="image-section">
                    ${hasImage ? `
                        <img 
                            src="${item.hero_image}" 
                            alt="${item.name}" 
                            class="item-image"
                            id="item-image-${index}"
                        />
                        ${this.options.showAnnotations && annotations ? `
                            <div class="annotation-overlay">
                                ${annotations}
                            </div>
                        ` : ''}
                    ` : `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
                            <div style="text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 16px;">📷</div>
                                <div>No image available</div>
                            </div>
                        </div>
                    `}
                </div>
                
                <div class="details-section">
                    <h1 class="item-title">${item.name || `Item ${index + 1}`}</h1>
                    
                    <div class="item-info">
                        <div class="info-row">
                            <span class="info-label">Item Number:</span>
                            <span class="info-value">${index + 1}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Parts Count:</span>
                            <span class="info-value">${parts.length}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Has Packaging:</span>
                            <span class="info-value">${item.needs_packaging ? 'Yes' : 'No'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Has Logo:</span>
                            <span class="info-value">${item.needs_logo ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                    
                    ${this.options.showPartDetails && parts.length > 0 ? `
                        <div class="parts-section">
                            <h3 class="parts-title">Parts (${parts.length})</h3>
                            ${parts.map((part, partIndex) => this.generatePartDetails(part, partIndex)).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `
  }

  private generateAnnotations(parts: ExtendedItem['parts']): string {
    if (!parts || parts.length === 0) {
      return ''
    }
    return parts
      .filter(part => part.annotation_data)
      .map((part, index) => {
        const { x, y } = part.annotation_data!
        const color = part.color || '#3b82f6'
        
        return `
            <div 
                class="annotation-dot" 
                style="left: ${x}%; top: ${y}%; background-color: ${color};"
                title="${part.name || `Part ${index + 1}`}"
            >
                ${index + 1}
                <div class="annotation-tooltip">
                    <div><strong>${part.name || `Part ${index + 1}`}</strong></div>
                    ${part.finish ? `<div>Finish: ${part.finish}</div>` : ''}
                    ${part.texture ? `<div>Texture: ${part.texture}</div>` : ''}
                    ${part.color ? `<div>Color: ${part.color}</div>` : ''}
                    ${part.notes ? `<div>Notes: ${part.notes}</div>` : ''}
                </div>
            </div>
        `
      })
      .join('')
  }

  private generatePartDetails(part: NonNullable<ExtendedItem['parts']>[0], index: number): string {
    return `
        <div class="part-item">
            <div class="part-header">
                <div class="part-color" style="background-color: ${part.color || '#3b82f6'};"></div>
                <span class="part-name">${part.name || `Part ${index + 1}`}</span>
            </div>
            <div class="part-details">
                ${part.finish ? `<div><strong>Finish:</strong> ${part.finish}</div>` : ''}
                ${part.texture ? `<div><strong>Texture:</strong> ${part.texture}</div>` : ''}
                ${part.color ? `<div><strong>Color:</strong> ${part.color}</div>` : ''}
                ${part.notes ? `<div><strong>Notes:</strong> ${part.notes}</div>` : ''}
                ${part.annotation_data ? `
                    <div><strong>Position:</strong> ${part.annotation_data.x.toFixed(1)}%, ${part.annotation_data.y.toFixed(1)}%</div>
                ` : ''}
            </div>
        </div>
    `
  }

  private generateEmptySlide(): string {
    return `
        <div class="slide active">
            <div class="slide-content">
                <div style="text-align: center;">
                    <h1 style="font-size: 3rem; margin-bottom: 20px;">📋</h1>
                    <h2 style="margin-bottom: 16px;">No Items Available</h2>
                    <p>This project doesn't have any items to display.</p>
                </div>
            </div>
        </div>
    `
  }

  private generateJavaScript(): string {
    return `
        let currentSlide = 0;
        let totalSlides = ${this.project.items?.length || 1};
        let isAutoPlaying = ${this.options.autoPlay};
        let autoPlayInterval;

        function updateSlideDisplay() {
            // Hide all slides
            document.querySelectorAll('.slide').forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Show current slide
            const slides = document.querySelectorAll('.slide');
            if (slides[currentSlide]) {
                slides[currentSlide].classList.add('active');
            }
            
            // Update counter
            document.querySelector('.current-slide').textContent = currentSlide + 1;
            
            // Update navigation buttons
            document.getElementById('prevBtn').disabled = currentSlide === 0;
            document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
        }

        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlideDisplay();
            }
        }

        function previousSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlideDisplay();
            }
        }

        function toggleAutoPlay() {
            isAutoPlaying = !isAutoPlaying;
            const btn = document.getElementById('playPauseBtn');
            
            if (isAutoPlaying) {
                autoPlayInterval = setInterval(() => {
                    if (currentSlide < totalSlides - 1) {
                        nextSlide();
                    } else {
                        currentSlide = 0;
                        updateSlideDisplay();
                    }
                }, ${this.options.autoPlayInterval * 1000});
                btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
            } else {
                clearInterval(autoPlayInterval);
                btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5,3 19,12 5,21"></polygon></svg>';
            }
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }

        function changeImageFit(value) {
            document.querySelectorAll('.item-image').forEach(img => {
                img.style.objectFit = value;
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    previousSlide();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    toggleAutoPlay();
                    break;
            }
        });

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            updateSlideDisplay();
            
            if (isAutoPlaying) {
                toggleAutoPlay();
            }
            
            // Set initial image fit
            document.getElementById('imageFit').value = '${this.options.imageFit}';
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    previousSlide();
                }
            }
        }
    `
  }
}

export function generateVisualEditorHTML(
  project: Project,
  options: VisualEditorExportOptions
): string {
  const generator = new VisualEditorHTMLGenerator(project, options)
  return generator.generate()
}
