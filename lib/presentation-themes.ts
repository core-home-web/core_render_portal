export interface PresentationTheme {
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    textLight: string
    border: string
    card: string
  }
  fonts: {
    title: string
    body: string
    accent: string
  }
  styles: {
    borderRadius: string
    shadow: string
    transition: string
  }
}

export const PRESENTATION_THEMES: PresentationTheme[] = [
  {
    name: 'Core Home Professional',
    description: 'Clean, modern design with Core Home branding',
    colors: {
      primary: '#2E5BBA',
      secondary: '#1e3a8a',
      accent: '#f59e0b',
      background: '#f8fafc',
      text: '#1e293b',
      textLight: '#64748b',
      border: '#e2e8f0',
      card: '#ffffff',
    },
    fonts: {
      title: "'Inter', 'Segoe UI', sans-serif",
      body: "'Inter', 'Segoe UI', sans-serif",
      accent: "'Inter', 'Segoe UI', sans-serif",
    },
    styles: {
      borderRadius: '12px',
      shadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
  },
  {
    name: 'Luxury Design',
    description: 'Premium, elegant styling for high-end projects',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#d97706',
      background: '#f9fafb',
      text: '#111827',
      textLight: '#6b7280',
      border: '#d1d5db',
      card: '#ffffff',
    },
    fonts: {
      title: "'Playfair Display', serif",
      body: "'Inter', sans-serif",
      accent: "'Playfair Display', serif",
    },
    styles: {
      borderRadius: '8px',
      shadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  {
    name: 'Modern Minimal',
    description: 'Clean, minimalist design with focus on content',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#0066cc',
      background: '#ffffff',
      text: '#000000',
      textLight: '#666666',
      border: '#e5e5e5',
      card: '#fafafa',
    },
    fonts: {
      title: "'Helvetica Neue', Arial, sans-serif",
      body: "'Helvetica Neue', Arial, sans-serif",
      accent: "'Helvetica Neue', Arial, sans-serif",
    },
    styles: {
      borderRadius: '4px',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
    },
  },
  {
    name: 'Warm & Inviting',
    description: 'Cozy, welcoming design for residential projects',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#f97316',
      background: '#fef7f0',
      text: '#1f2937',
      textLight: '#6b7280',
      border: '#f3e8ff',
      card: '#ffffff',
    },
    fonts: {
      title: "'Poppins', sans-serif",
      body: "'Inter', sans-serif",
      accent: "'Poppins', sans-serif",
    },
    styles: {
      borderRadius: '16px',
      shadow: '0 15px 35px rgba(139, 92, 246, 0.1)',
      transition: 'all 0.3s ease',
    },
  },
]

export function getThemeCSS(theme: PresentationTheme): string {
  return `
    :root {
      --primary: ${theme.colors.primary};
      --secondary: ${theme.colors.secondary};
      --accent: ${theme.colors.accent};
      --background: ${theme.colors.background};
      --text: ${theme.colors.text};
      --text-light: ${theme.colors.textLight};
      --border: ${theme.colors.border};
      --card: ${theme.colors.card};
      --border-radius: ${theme.styles.borderRadius};
      --shadow: ${theme.styles.shadow};
      --transition: ${theme.styles.transition};
    }

    body {
      font-family: ${theme.fonts.body};
      background: ${theme.colors.background};
      color: ${theme.colors.text};
    }

    .slide {
      transition: ${theme.styles.transition};
    }

    .title-slide {
      background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
      color: white;
    }

    .slide-title {
      font-family: ${theme.fonts.title};
      color: inherit;
    }

    .part-card {
      background: ${theme.colors.card};
      border-left: 4px solid ${theme.colors.primary};
      border-radius: ${theme.styles.borderRadius};
      box-shadow: ${theme.styles.shadow};
      transition: ${theme.styles.transition};
    }

    .part-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .part-name {
      color: ${theme.colors.primary};
      font-family: ${theme.fonts.accent};
    }

    .group-info {
      background: ${theme.colors.border};
      border-radius: ${theme.styles.borderRadius};
    }

    .project-image {
      border-radius: ${theme.styles.borderRadius};
      box-shadow: ${theme.styles.shadow};
      transition: ${theme.styles.transition};
    }

    .project-image:hover {
      transform: scale(1.02);
    }
  `
}
