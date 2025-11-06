'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Home,
  CheckSquare,
  BarChart3,
  Settings,
  Plus,
  Calendar,
  MoreVertical,
  Eye,
  Search,
  Bell,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AnimatedProgressBar } from '@/components/ui/animated-progress-bar'

export default function StyleGuidePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-[#0d1117] p-4 rounded-lg overflow-x-auto text-sm">
        <code className="text-gray-300">{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 bg-[#38bdbb] hover:bg-[#2ea9a7] text-white px-3 py-1 rounded text-xs transition-colors"
      >
        {copiedCode === id ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#070e0e] text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[#38bdbb] hover:text-[#2ea9a7] mb-6 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-5xl font-medium mb-4">Design System & Style Guide</h1>
          <p className="text-[#595d60] text-lg">
            Complete reference for Core Home Render Portal UI components, colors, typography, and patterns
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-[#1a1e1f] rounded-2xl p-6 mb-12">
          <h2 className="text-2xl font-medium mb-4">Table of Contents</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="#colors" className="text-[#38bdbb] hover:text-[#2ea9a7]">Colors</a>
            <a href="#typography" className="text-[#38bdbb] hover:text-[#2ea9a7]">Typography</a>
            <a href="#spacing" className="text-[#38bdbb] hover:text-[#2ea9a7]">Spacing</a>
            <a href="#buttons" className="text-[#38bdbb] hover:text-[#2ea9a7]">Buttons</a>
            <a href="#progress" className="text-[#38bdbb] hover:text-[#2ea9a7]">Progress Bar</a>
            <a href="#cards" className="text-[#38bdbb] hover:text-[#2ea9a7]">Cards</a>
            <a href="#navigation" className="text-[#38bdbb] hover:text-[#2ea9a7]">Navigation</a>
            <a href="#tables" className="text-[#38bdbb] hover:text-[#2ea9a7]">Tables</a>
            <a href="#icons" className="text-[#38bdbb] hover:text-[#2ea9a7]">Icons</a>
          </div>
        </nav>

        {/* Colors Section */}
        <section id="colors" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Primary Colors */}
            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <div className="w-full h-24 bg-[#38bdbb] rounded-lg mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Primary (Teal)</h3>
              <p className="text-sm text-[#595d60] mb-2">Used for CTAs, links, accents</p>
              <code className="text-xs bg-[#0d1117] px-2 py-1 rounded">#38bdbb</code>
              <div className="mt-3 space-y-1 text-xs">
                <p className="text-[#595d60]">Hover: #2ea9a7</p>
                <p className="text-[#595d60]">RGB: 56, 189, 187</p>
              </div>
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <div className="w-full h-24 bg-[#f9903c] rounded-lg mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Secondary (Orange)</h3>
              <p className="text-sm text-[#595d60] mb-2">Used for status, badges</p>
              <code className="text-xs bg-[#0d1117] px-2 py-1 rounded">#f9903c</code>
              <div className="mt-3 space-y-1 text-xs">
                <p className="text-[#595d60]">RGB: 249, 144, 60</p>
              </div>
            </div>

            {/* Background Colors */}
            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <div className="w-full h-24 bg-[#070e0e] rounded-lg mb-4 border border-gray-700"></div>
              <h3 className="text-lg font-medium mb-2">Background Dark</h3>
              <p className="text-sm text-[#595d60] mb-2">Main page background</p>
              <code className="text-xs bg-[#0d1117] px-2 py-1 rounded">#070e0e</code>
              <div className="mt-3 space-y-1 text-xs">
                <p className="text-[#595d60]">RGB: 7, 14, 14</p>
              </div>
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <div className="w-full h-24 bg-[#1a1e1f] rounded-lg mb-4 border border-gray-700"></div>
              <h3 className="text-lg font-medium mb-2">Card Background</h3>
              <p className="text-sm text-[#595d60] mb-2">Cards, sidebar, modals</p>
              <code className="text-xs bg-[#0d1117] px-2 py-1 rounded">#1a1e1f</code>
              <div className="mt-3 space-y-1 text-xs">
                <p className="text-[#595d60]">Hover: #222a31</p>
                <p className="text-[#595d60]">RGB: 26, 30, 31</p>
              </div>
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <div className="w-full h-24 bg-[#595d60] rounded-lg mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Text Secondary</h3>
              <p className="text-sm text-[#595d60] mb-2">Muted text, descriptions</p>
              <code className="text-xs bg-[#0d1117] px-2 py-1 rounded">#595d60</code>
              <div className="mt-3 space-y-1 text-xs">
                <p className="text-[#595d60]">RGB: 89, 93, 96</p>
              </div>
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <div className="w-full h-24 bg-white rounded-lg mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Text Primary</h3>
              <p className="text-sm text-[#595d60] mb-2">Headings, body text</p>
              <code className="text-xs bg-[#0d1117] px-2 py-1 rounded">#ffffff</code>
              <div className="mt-3 space-y-1 text-xs">
                <p className="text-[#595d60]">RGB: 255, 255, 255</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1e1f] rounded-xl p-6">
            <h3 className="text-xl font-medium mb-4">CSS Variables Reference</h3>
            <CodeBlock
              id="colors-css"
              code={`:root {
  /* Primary Colors */
  --primary: #38bdbb;
  --primary-hover: #2ea9a7;
  --secondary: #f9903c;
  
  /* Backgrounds */
  --bg-dark: #070e0e;
  --bg-card: #1a1e1f;
  --bg-card-hover: #222a31;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #595d60;
  
  /* Borders */
  --border-color: #374151;
}`}
            />
          </div>
        </section>

        {/* Typography Section */}
        <section id="typography" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Typography</h2>
          
          <div className="bg-[#1a1e1f] rounded-xl p-6 mb-6">
            <h3 className="text-xl font-medium mb-4">Font Family</h3>
            <p className="mb-4 text-[#595d60]">
              We use <strong className="text-white">Inter Tight</strong> as the primary font with Inter as fallback.
            </p>
            <CodeBlock
              id="font-family"
              code={`font-family: 'Inter Tight', 'Inter', sans-serif;

/* Import in globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@100;200;300;400;500;600;700;800;900&display=swap');`}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h1 className="text-5xl font-medium mb-3">Heading 1 - 40px/48px</h1>
              <CodeBlock
                id="h1"
                code={`<h1 className="text-4xl lg:text-5xl font-medium">
  Heading 1
</h1>`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h2 className="text-3xl font-medium mb-3">Heading 2 - 30px</h2>
              <CodeBlock
                id="h2"
                code={`<h2 className="text-2xl lg:text-3xl font-medium">
  Heading 2
</h2>`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-3">Heading 3 - 20px</h3>
              <CodeBlock
                id="h3"
                code={`<h3 className="text-xl font-medium">
  Heading 3
</h3>`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <p className="text-base mb-2">Body Text Regular - 15px</p>
              <p className="text-[#595d60] mb-3">Body Text Muted - 15px</p>
              <CodeBlock
                id="body"
                code={`<p className="text-base">Regular body text</p>
<p className="text-[#595d60]">Muted body text</p>`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <p className="text-sm mb-3">Small Text - 14px</p>
              <CodeBlock
                id="small"
                code={`<p className="text-sm">Small text</p>`}
              />
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section id="spacing" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Spacing Scale</h2>
          
          <div className="bg-[#1a1e1f] rounded-xl p-6">
            <p className="text-[#595d60] mb-6">
              We use Tailwind's default spacing scale (1 unit = 0.25rem = 4px)
            </p>
            <div className="space-y-4">
              {[
                { value: '2', px: '8px', usage: 'Tight spacing, icon gaps' },
                { value: '3', px: '12px', usage: 'Small gaps, button padding' },
                { value: '4', px: '16px', usage: 'Standard gap between items' },
                { value: '6', px: '24px', usage: 'Section spacing, card padding' },
                { value: '8', px: '32px', usage: 'Large spacing' },
                { value: '12', px: '48px', usage: 'Section breaks' },
              ].map((space) => (
                <div key={space.value} className="flex items-center gap-4">
                  <div
                    className="bg-[#38bdbb] h-8"
                    style={{ width: `${parseInt(space.value) * 4}px` }}
                  ></div>
                  <div className="flex-1">
                    <code className="text-[#38bdbb]">{`p-${space.value}`}</code>
                    <span className="text-[#595d60] ml-3">{space.px}</span>
                    <span className="text-[#595d60] ml-3">- {space.usage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section id="buttons" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Buttons</h2>
          
          <div className="space-y-6">
            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-4">Primary Button</h3>
              <button className="bg-[#38bdbb] hover:bg-[#2ea9a7] text-white px-6 py-2.5 rounded-lg transition-colors font-medium mb-4">
                Primary Button
              </button>
              <CodeBlock
                id="btn-primary"
                code={`<button className="bg-[#38bdbb] hover:bg-[#2ea9a7] text-white px-6 py-2.5 rounded-lg transition-colors font-medium">
  Primary Button
</button>`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-4">Primary Button with Icon</h3>
              <button className="flex items-center gap-2 bg-[#38bdbb] hover:bg-[#2ea9a7] text-white px-5 py-2.5 rounded-lg transition-colors font-medium mb-4">
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
              <CodeBlock
                id="btn-icon"
                code={`<button className="flex items-center gap-2 bg-[#38bdbb] hover:bg-[#2ea9a7] text-white px-5 py-2.5 rounded-lg transition-colors font-medium">
  <Plus className="w-4 h-4" />
  <span>New Project</span>
</button>`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-4">Text Link Button</h3>
              <button className="text-[#38bdbb] hover:text-[#2ea9a7] transition-colors text-sm font-medium mb-4">
                View Details
              </button>
              <CodeBlock
                id="btn-link"
                code={`<button className="text-[#38bdbb] hover:text-[#2ea9a7] transition-colors text-sm font-medium">
  View Details
</button>`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-4">Icon Button</h3>
              <button className="text-[#595d60] hover:text-white transition-colors mb-4">
                <MoreVertical className="w-5 h-5" />
              </button>
              <CodeBlock
                id="btn-icon-only"
                code={`<button className="text-[#595d60] hover:text-white transition-colors">
  <MoreVertical className="w-5 h-5" />
</button>`}
              />
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section id="cards" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Cards</h2>
          
          <div className="space-y-6">
            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-4">Basic Card</h3>
              <div className="bg-[#1a1e1f] rounded-2xl p-6 mb-4">
                <h3 className="text-xl font-medium mb-2">Card Title</h3>
                <p className="text-[#595d60]">Card content goes here</p>
              </div>
              <CodeBlock
                id="card-basic"
                code={`<div className="bg-[#1a1e1f] rounded-2xl p-6">
  <h3 className="text-xl font-medium mb-2">Card Title</h3>
  <p className="text-[#595d60]">Card content goes here</p>
</div>`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-4">Hover Card</h3>
              <div className="bg-[#1a1e1f] hover:bg-[#222a31] rounded-2xl p-6 transition-colors mb-4 cursor-pointer">
                <h3 className="text-xl font-medium mb-2">Hover Me</h3>
                <p className="text-[#595d60]">Hover to see background change</p>
              </div>
              <CodeBlock
                id="card-hover"
                code={`<div className="bg-[#1a1e1f] hover:bg-[#222a31] rounded-2xl p-6 transition-colors">
  <h3 className="text-xl font-medium mb-2">Hover Me</h3>
  <p className="text-[#595d60]">Hover to see background change</p>
</div>`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-4">Card with Header Actions</h3>
              <div className="bg-[#1a1e1f] rounded-2xl p-6 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-medium">Card Title</h3>
                  <button className="text-[#595d60] hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[#595d60]">Card content with action menu</p>
              </div>
              <CodeBlock
                id="card-actions"
                code={`<div className="bg-[#1a1e1f] rounded-2xl p-6">
  <div className="flex items-start justify-between mb-4">
    <h3 className="text-xl font-medium">Card Title</h3>
    <button className="text-[#595d60] hover:text-white transition-colors">
      <MoreVertical className="w-5 h-5" />
    </button>
  </div>
  <p className="text-[#595d60]">Card content</p>
</div>`}
              />
            </div>
          </div>
        </section>

        {/* Navigation Section */}
        <section id="navigation" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Navigation</h2>
          
          <div className="bg-[#1a1e1f] rounded-xl p-6">
            <h3 className="text-xl font-medium mb-4">Sidebar Navigation Link</h3>
            <div className="space-y-2 mb-6 max-w-xs">
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#222a31] text-[#38bdbb]">
                <Home className="w-5 h-5" />
                <span className="font-medium">Active Link</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-[#222a31] hover:text-[#38bdbb] transition-all">
                <CheckSquare className="w-5 h-5" />
                <span className="font-medium">Inactive Link</span>
              </a>
            </div>
            <CodeBlock
              id="nav-link"
              code={`/* Active State */
<a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#222a31] text-[#38bdbb]">
  <Home className="w-5 h-5" />
  <span className="font-medium">Active Link</span>
</a>

/* Inactive State */
<a className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-[#222a31] hover:text-[#38bdbb] transition-all">
  <CheckSquare className="w-5 h-5" />
  <span className="font-medium">Inactive Link</span>
</a>`}
            />
          </div>
        </section>

        {/* Tables Section */}
        <section id="tables" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Tables</h2>
          
          <div className="bg-[#1a1e1f] rounded-xl p-6">
            <h3 className="text-xl font-medium mb-4">Data Table</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
                      Column 1
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
                      Column 2
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800 hover:bg-[#222a31] transition-colors">
                    <td className="py-4 px-4">Data 1</td>
                    <td className="py-4 px-4 text-[#595d60]">Data 2</td>
                    <td className="py-4 px-4">
                      <button className="text-[#38bdbb] hover:text-[#2ea9a7] text-sm font-medium">
                        Action
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800 hover:bg-[#222a31] transition-colors">
                    <td className="py-4 px-4">Data 3</td>
                    <td className="py-4 px-4 text-[#595d60]">Data 4</td>
                    <td className="py-4 px-4">
                      <button className="text-[#38bdbb] hover:text-[#2ea9a7] text-sm font-medium">
                        Action
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <CodeBlock
              id="table"
              code={`<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-700">
        <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
          Column 1
        </th>
        <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
          Column 2
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-800 hover:bg-[#222a31] transition-colors">
        <td className="py-4 px-4">Data 1</td>
        <td className="py-4 px-4 text-[#595d60]">Data 2</td>
      </tr>
    </tbody>
  </table>
</div>`}
            />
          </div>
        </section>

        {/* Icons Section */}
        <section id="icons" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Icons</h2>
          
          <div className="bg-[#1a1e1f] rounded-xl p-6">
            <p className="text-[#595d60] mb-6">
              We use <strong className="text-white">Lucide React</strong> icons throughout the application.
            </p>
            
            <h3 className="text-xl font-medium mb-4">Common Icons</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-6">
              {[
                { Icon: Home, name: 'Home' },
                { Icon: CheckSquare, name: 'CheckSquare' },
                { Icon: BarChart3, name: 'BarChart3' },
                { Icon: Settings, name: 'Settings' },
                { Icon: Plus, name: 'Plus' },
                { Icon: Calendar, name: 'Calendar' },
                { Icon: MoreVertical, name: 'MoreVertical' },
                { Icon: Eye, name: 'Eye' },
                { Icon: Search, name: 'Search' },
                { Icon: Bell, name: 'Bell' },
              ].map(({ Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-[#38bdbb]/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#38bdbb]" />
                  </div>
                  <span className="text-xs text-[#595d60]">{name}</span>
                </div>
              ))}
            </div>
            
            <CodeBlock
              id="icons-usage"
              code={`import { Home, Plus, Settings } from 'lucide-react'

// Standard size (w-5 h-5 = 20px)
<Home className="w-5 h-5" />

// Large size (w-6 h-6 = 24px)
<Plus className="w-6 h-6" />

// With color
<Settings className="w-5 h-5 text-[#38bdbb]" />`}
            />
          </div>
        </section>

        {/* Progress Bar */}
        <section id="progress" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Animated Progress Bar</h2>
          
          <div className="bg-[#1a1e1f] rounded-xl p-6">
            <h3 className="text-xl font-medium mb-4">Multi-Step Progress Indicator</h3>
            <p className="text-[#595d60] mb-6">
              Animated progress bar with smooth transitions for multi-step workflows.
            </p>
            
            <div className="mb-6 bg-[#070e0e] p-8 rounded-lg">
              <AnimatedProgressBar
                steps={[
                  { id: 1, title: 'Project Details', description: 'Basic information' },
                  { id: 2, title: 'Add Items', description: 'Upload content' },
                  { id: 3, title: 'Configure', description: 'Set parameters' },
                  { id: 4, title: 'Review', description: 'Final review' },
                ]}
                currentStep={2}
              />
            </div>
            
            <CodeBlock
              id="progress-bar"
              code={`import { AnimatedProgressBar } from '@/components/ui/animated-progress-bar'

const steps = [
  { id: 1, title: 'Project Details', description: 'Basic information' },
  { id: 2, title: 'Add Items', description: 'Upload content' },
  { id: 3, title: 'Configure', description: 'Set parameters' },
  { id: 4, title: 'Review', description: 'Final review' },
]

<AnimatedProgressBar 
  steps={steps} 
  currentStep={2} 
/>`}
            />
          </div>
        </section>

        {/* Badges & Tags */}
        <section id="badges" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Badges & Status Tags</h2>
          
          <div className="bg-[#1a1e1f] rounded-xl p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#38bdbb]/10 text-[#38bdbb]">
                Primary Badge
              </span>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#f9903c]/10 text-[#f9903c]">
                Warning Badge
              </span>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                Success Badge
              </span>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                Error Badge
              </span>
            </div>
            <CodeBlock
              id="badges"
              code={`/* Primary */
<span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#38bdbb]/10 text-[#38bdbb]">
  Primary Badge
</span>

/* Warning/Secondary */
<span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#f9903c]/10 text-[#f9903c]">
  Warning Badge
</span>

/* Success */
<span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
  Success Badge
</span>`}
            />
          </div>
        </section>

        {/* Layout Components */}
        <section id="layout" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Layout Components</h2>
          
          <div className="space-y-6">
            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-4">DashboardLayout</h3>
              <p className="text-[#595d60] mb-4">
                Wrapper component that includes sidebar navigation and main content area.
              </p>
              <CodeBlock
                id="dashboard-layout"
                code={`import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function MyPage() {
  return (
    <DashboardLayout user={user} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12 text-white">
        {/* Your page content */}
      </div>
    </DashboardLayout>
  )
}`}
              />
            </div>

            <div className="bg-[#1a1e1f] rounded-xl p-6">
              <h3 className="text-xl font-medium mb-4">Grid Layouts</h3>
              <CodeBlock
                id="grid"
                code={`/* Responsive Card Grid */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

/* Two Column Layout */
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Content */}
</div>`}
              />
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section id="best-practices" className="mb-16">
          <h2 className="text-3xl font-medium mb-6">Best Practices</h2>
          
          <div className="bg-[#1a1e1f] rounded-xl p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-[#38bdbb]">✓ Do's</h3>
                <ul className="space-y-2 text-[#595d60]">
                  <li>• Use consistent spacing (multiples of 4px)</li>
                  <li>• Apply hover states to all interactive elements</li>
                  <li>• Use transition-colors for smooth hover effects</li>
                  <li>• Keep card padding consistent at p-6</li>
                  <li>• Use rounded-2xl (16px) for cards, rounded-lg (8px) for buttons</li>
                  <li>• Always include text-[#595d60] for muted/secondary text</li>
                  <li>• Use font-medium (500) for headings and buttons</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 text-[#f9903c]">✗ Don'ts</h3>
                <ul className="space-y-2 text-[#595d60]">
                  <li>• Don't use arbitrary colors outside the palette</li>
                  <li>• Don't mix border radius sizes inconsistently</li>
                  <li>• Don't forget hover states on clickable elements</li>
                  <li>• Don't use font-bold unless specifically needed</li>
                  <li>• Don't forget transition classes for animations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Responsive Breakpoints</h3>
                <CodeBlock
                  id="breakpoints"
                  code={`/* Tailwind Breakpoints */
sm:  640px  /* Mobile landscape */
md:  768px  /* Tablet */
lg:  1024px /* Desktop */
xl:  1280px /* Large desktop */

/* Common pattern */
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-3xl lg:text-5xl">
    Responsive Heading
  </h1>
</div>`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-700 pt-8 mt-16">
          <p className="text-center text-[#595d60]">
            Core Home Render Portal Design System · Updated {new Date().toLocaleDateString()}
          </p>
        </footer>
      </div>
    </div>
  )
}

