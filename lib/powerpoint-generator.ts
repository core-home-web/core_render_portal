import PptxGenJS from 'pptxgenjs'
import { ExportOptions } from '../components/project/export-project-modal'
import { Project, Item, Part, PartGroup } from '../types'

export class PowerPointGenerator {
  private pptx: PptxGenJS
  private options: ExportOptions
  private project: Project

  constructor(project: Project, options: ExportOptions) {
    this.pptx = new PptxGenJS()
    this.options = options
    this.project = project
  }

  async generate(): Promise<Blob> {
    try {
      // Set presentation properties
      this.pptx.author = 'Core Home Render Portal'
      this.pptx.company = 'Core Home'
      this.pptx.title = this.options.customTitle || this.project.title
      this.pptx.subject = `Project: ${this.project.title}`
      this.pptx.revision = '1'

      // Generate slides based on options
      if (this.options.includeProjectOverview) {
        this.addTitleSlide()
        this.addProjectOverviewSlide()
      }

      if (this.options.includeAnnotatedImages) {
        await this.addImageSlides()
      }

      if (this.options.includePartDetails) {
        this.addPartDetailsSlides()
      }

      if (this.options.includePartGroups) {
        this.addGroupSummarySlide()
      }

      if (this.options.includeTeamInfo) {
        this.addTeamInfoSlide()
      }

      if (this.options.includeNotes) {
        this.addNotesSlide()
      }

      // Generate and return the PowerPoint file
      const blob = await this.pptx.write('blob')
      return blob
    } catch (error) {
      console.error('Error generating PowerPoint:', error)
      throw new Error('Failed to generate PowerPoint presentation')
    }
  }

  private addTitleSlide(): void {
    const slide = this.pptx.addSlide()
    
    // Title
    slide.addText(this.options.customTitle || this.project.title, {
      x: 1,
      y: 1.5,
      w: 8,
      h: 1.5,
      fontSize: 36,
      bold: true,
      color: '2E5BBA',
      align: 'center'
    })

    // Subtitle
    slide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
      x: 1,
      y: 3.2,
      w: 8,
      h: 0.5,
      fontSize: 18,
      color: '666666',
      align: 'center'
    })

    // Project info
    if (this.project.retailer) {
      slide.addText(`Retailer: ${this.project.retailer}`, {
        x: 1,
        y: 4,
        w: 8,
        h: 0.5,
        fontSize: 16,
        color: '888888',
        align: 'center'
      })
    }

    // Decorative line
    slide.addShape('line', {
      x: 2,
      y: 5,
      w: 6,
      h: 0,
      line: { color: '2E5BBA', width: 2 }
    })
  }

  private addProjectOverviewSlide(): void {
    const slide = this.pptx.addSlide()
    
    // Title
    slide.addText('Project Overview', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: '2E5BBA'
    })

    // Project details
    const details = [
      `Project Name: ${this.project.title}`,
      `Retailer: ${this.project.retailer || 'Not specified'}`,
      `Created: ${new Date(this.project.created_at).toLocaleDateString()}`,
      `Last Updated: ${new Date(this.project.updated_at).toLocaleDateString()}`,
      `Items: ${this.project.items?.length || 0}`
    ]

    slide.addText(details.join('\n'), {
      x: 0.5,
      y: 1.5,
      w: 4,
      h: 3,
      fontSize: 16,
      color: '333333',
      lineSpacing: 1.2
    })

    // Project status or additional info
    if (this.project.items && this.project.items.length > 0) {
      const firstItem = this.project.items[0]
      if (firstItem.parts && firstItem.parts.length > 0) {
        slide.addText(`Total Parts: ${firstItem.parts.length}`, {
          x: 5.5,
          y: 1.5,
          w: 4,
          h: 0.8,
          fontSize: 16,
          color: '333333'
        })

        if (firstItem.groups && firstItem.groups.length > 0) {
          slide.addText(`Part Groups: ${firstItem.groups.length}`, {
            x: 5.5,
            y: 2.5,
            w: 4,
            h: 0.8,
            fontSize: 16,
            color: '333333'
          })
        }
      }
    }
  }

  private async addImageSlides(): Promise<void> {
    if (!this.project.items || this.project.items.length === 0) return

    for (const item of this.project.items) {
      if (item.hero_image) {
        await this.addImageSlide(item)
      }
    }
  }

  private async addImageSlide(item: Item): Promise<void> {
    const slide = this.pptx.addSlide()
    
    // Title
    slide.addText(`Item: ${item.name || 'Unnamed Item'}`, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: '2E5BBA'
    })

    try {
      // Add the main image
      const imageResponse = await fetch(item.hero_image)
      const imageBlob = await imageResponse.blob()
      const imageBuffer = await this.blobToBase64(imageBlob)
      
      slide.addImage({
        data: imageBuffer,
        x: 0.5,
        y: 1.2,
        w: 6,
        h: 4.5
      })

      // Add part information on the right
      if (item.parts && item.parts.length > 0) {
        const partInfo = item.parts.map(part => 
          `• ${part.name} (${part.finish || 'No finish'})`
        ).join('\n')

        slide.addText('Parts:', {
          x: 7,
          y: 1.2,
          w: 2.5,
          h: 0.5,
          fontSize: 16,
          bold: true,
          color: '333333'
        })

        slide.addText(partInfo, {
          x: 7,
          y: 1.8,
          w: 2.5,
          h: 3.5,
          fontSize: 12,
          color: '555555',
          lineSpacing: 1.1
        })
      }
    } catch (error) {
      console.error('Error adding image to slide:', error)
      slide.addText('Image could not be loaded', {
        x: 0.5,
        y: 1.2,
        w: 6,
        h: 4.5,
        fontSize: 16,
        color: '999999',
        align: 'center',
        valign: 'middle'
      })
    }
  }

  private addPartDetailsSlides(): void {
    if (!this.project.items || this.project.items.length === 0) return

    const item = this.project.items[0]
    if (!item.parts || item.parts.length === 0) return

    // Create slides for parts (group them to avoid too many slides)
    const partsPerSlide = 6
    const partSlides = Math.ceil(item.parts.length / partsPerSlide)

    for (let i = 0; i < partSlides; i++) {
      const slide = this.pptx.addSlide()
      const startIndex = i * partsPerSlide
      const endIndex = Math.min(startIndex + partsPerSlide, item.parts.length)
      const slideParts = item.parts.slice(startIndex, endIndex)

      // Title
      slide.addText(`Part Specifications (${startIndex + 1}-${endIndex})`, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.6,
        fontSize: 24,
        bold: true,
        color: '2E5BBA'
      })

      // Create table for parts
      const tableData = [
        ['Part Name', 'Finish', 'Color', 'Texture', 'Group', 'Notes']
      ]

      slideParts.forEach(part => {
        const groupName = item.groups?.find(g => g.id === part.groupId)?.name || 'None'
        tableData.push([
          part.name || 'Unnamed',
          part.finish || 'Not specified',
          part.color || 'Not specified',
          part.texture || 'Not specified',
          groupName,
          part.notes || ''
        ])
      })

      slide.addTable(tableData, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 4.5,
        colW: [2, 1.5, 1.5, 1.5, 1.5, 1],
        fontSize: 10,
        color: '333333',
        border: { type: 'solid', color: 'CCCCCC', pt: 1 }
      })
    }
  }

  private addGroupSummarySlide(): void {
    if (!this.project.items || this.project.items.length === 0) return

    const item = this.project.items[0]
    if (!item.groups || item.groups.length === 0) return

    const slide = this.pptx.addSlide()
    
    // Title
    slide.addText('Part Grouping & Organization', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: '2E5BBA'
    })

    // Group information
    const groupInfo = item.groups.map(group => {
      const groupParts = item.parts?.filter(part => part.groupId === group.id) || []
      return `${group.name} (${groupParts.length} parts)`
    }).join('\n')

    slide.addText('Groups:', {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 0.5,
      fontSize: 16,
      bold: true,
      color: '333333'
    })

    slide.addText(groupInfo, {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 3.5,
      fontSize: 14,
      color: '555555',
      lineSpacing: 1.2
    })
  }

  private addTeamInfoSlide(): void {
    const slide = this.pptx.addSlide()
    
    // Title
    slide.addText('Team & Collaboration', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: '2E5BBA'
    })

    // Project owner
    slide.addText(`Project Owner: ${this.project.user_id}`, {
      x: 0.5,
      y: 1.2,
      w: 4,
      h: 0.5,
      fontSize: 16,
      color: '333333'
    })

    // Created date
    slide.addText(`Created: ${new Date(this.project.created_at).toLocaleDateString()}`, {
      x: 0.5,
      y: 1.8,
      w: 4,
      h: 0.5,
      fontSize: 16,
      color: '333333'
    })

    // Last updated
    slide.addText(`Last Updated: ${new Date(this.project.updated_at).toLocaleDateString()}`, {
      x: 0.5,
      y: 2.4,
      w: 4,
      h: 0.5,
      fontSize: 16,
      color: '333333'
    })

    // Note about collaboration
    slide.addText('Note: This project may have collaborators with various permission levels', {
      x: 0.5,
      y: 4,
      w: 9,
      h: 0.5,
      fontSize: 12,
      color: '666666',
      italic: true
    })
  }

  private addNotesSlide(): void {
    const slide = this.pptx.addSlide()
    
    // Title
    slide.addText('Project Notes & Next Steps', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: '2E5BBA'
    })

    // Placeholder for notes
    slide.addText('Add your project notes, next steps, and action items here.', {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 3,
      fontSize: 16,
      color: '666666',
      align: 'center',
      valign: 'middle'
    })

    // Footer
    slide.addText('Generated by Core Home Render Portal', {
      x: 0.5,
      y: 5.5,
      w: 9,
      h: 0.5,
      fontSize: 12,
      color: '999999',
      align: 'center'
    })
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:image/...;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}

export async function generatePowerPoint(
  project: Project,
  options: ExportOptions
): Promise<Blob> {
  const generator = new PowerPointGenerator(project, options)
  return await generator.generate()
}
