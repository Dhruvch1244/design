export type ThemeColors = {
  void: string
  surface: string
  panel: string
  ink: string
  inkSoft: string
  inkFaint: string
  rule: string
  ruleSoft: string
  cyan: string
  emerald: string
  rose: string
  warm: string
  violet: string
}

export type Theme = {
  id: string
  name: string
  swatch: [string, string, string]
  colors: ThemeColors
}

export const THEMES: Theme[] = [
  {
    id: 'void',
    name: 'Void',
    swatch: ['#050506', '#2fe6f2', '#9a6bff'],
    colors: {
      void: '#050506', surface: '#0b0c11', panel: '#101218',
      ink: '#f2f4f8', inkSoft: '#9ba1b0', inkFaint: '#5c6274',
      rule: 'rgba(255,255,255,0.08)', ruleSoft: 'rgba(255,255,255,0.05)',
      cyan: '#2fe6f2', emerald: '#34e8ab', rose: '#ff6f8f', warm: '#f2b45e', violet: '#9a6bff',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    swatch: ['#282a36', '#bd93f9', '#ff79c6'],
    colors: {
      void: '#191a21', surface: '#282a36', panel: '#333545',
      ink: '#f8f8f2', inkSoft: '#c6c8d1', inkFaint: '#6272a4',
      rule: 'rgba(255,255,255,0.09)', ruleSoft: 'rgba(255,255,255,0.05)',
      cyan: '#8be9fd', emerald: '#50fa7b', rose: '#ff5555', warm: '#f1fa8c', violet: '#bd93f9',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    swatch: ['#2e3440', '#88c0d0', '#b48ead'],
    colors: {
      void: '#242933', surface: '#2e3440', panel: '#3b4252',
      ink: '#eceff4', inkSoft: '#d8dee9', inkFaint: '#767e93',
      rule: 'rgba(216,222,233,0.10)', ruleSoft: 'rgba(216,222,233,0.06)',
      cyan: '#88c0d0', emerald: '#a3be8c', rose: '#bf616a', warm: '#ebcb8b', violet: '#b48ead',
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    swatch: ['#1a1b26', '#7dcfff', '#bb9af7'],
    colors: {
      void: '#13141c', surface: '#1a1b26', panel: '#232433',
      ink: '#c0caf5', inkSoft: '#9aa5d1', inkFaint: '#565f89',
      rule: 'rgba(192,202,245,0.09)', ruleSoft: 'rgba(192,202,245,0.05)',
      cyan: '#7dcfff', emerald: '#9ece6a', rose: '#f7768e', warm: '#e0af68', violet: '#bb9af7',
    },
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox',
    swatch: ['#282828', '#fabd2f', '#fe8019'],
    colors: {
      void: '#1d2021', surface: '#282828', panel: '#3c3836',
      ink: '#ebdbb2', inkSoft: '#bdae93', inkFaint: '#928374',
      rule: 'rgba(235,219,178,0.10)', ruleSoft: 'rgba(235,219,178,0.06)',
      cyan: '#8ec07c', emerald: '#b8bb26', rose: '#fb4934', warm: '#fabd2f', violet: '#d3869b',
    },
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin',
    swatch: ['#1e1e2e', '#89dceb', '#cba6f7'],
    colors: {
      void: '#11111b', surface: '#1e1e2e', panel: '#313244',
      ink: '#cdd6f4', inkSoft: '#a6adc8', inkFaint: '#6c7086',
      rule: 'rgba(205,214,244,0.10)', ruleSoft: 'rgba(205,214,244,0.06)',
      cyan: '#89dceb', emerald: '#a6e3a1', rose: '#f38ba8', warm: '#f9e2af', violet: '#cba6f7',
    },
  },
  {
    id: 'solarized',
    name: 'Solarized',
    swatch: ['#002b36', '#2aa198', '#6c71c4'],
    colors: {
      void: '#00212b', surface: '#002b36', panel: '#073642',
      ink: '#eee8d5', inkSoft: '#93a1a1', inkFaint: '#586e75',
      rule: 'rgba(147,161,161,0.14)', ruleSoft: 'rgba(147,161,161,0.08)',
      cyan: '#2aa198', emerald: '#859900', rose: '#dc322f', warm: '#b58900', violet: '#6c71c4',
    },
  },
]

const VAR_MAP: Record<keyof ThemeColors, string> = {
  void: '--void', surface: '--surface', panel: '--panel',
  ink: '--ink', inkSoft: '--ink-soft', inkFaint: '--ink-faint',
  rule: '--rule', ruleSoft: '--rule-soft',
  cyan: '--cyan', emerald: '--emerald', rose: '--rose', warm: '--warm', violet: '--violet',
}

const STORAGE_KEY = 'devtools.theme'

export function applyTheme(id: string) {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0]
  const root = document.documentElement.style
  for (const key of Object.keys(theme.colors) as (keyof ThemeColors)[]) {
    root.setProperty(VAR_MAP[key], theme.colors[key])
  }
  localStorage.setItem(STORAGE_KEY, theme.id)
}

export function getStoredTheme(): string {
  return localStorage.getItem(STORAGE_KEY) ?? THEMES[0].id
}
