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
  scheme?: 'light' | 'dark'
  colors: ThemeColors
}

export const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    swatch: ['#ffffff', '#0891b2', '#7c3aed'],
    scheme: 'light',
    colors: {
      void: '#eef0f4', surface: '#ffffff', panel: '#f5f6f9',
      ink: '#1a1d29', inkSoft: '#4b5163', inkFaint: '#8b90a0',
      rule: 'rgba(20,22,30,0.22)', ruleSoft: 'rgba(20,22,30,0.06)',
      cyan: '#0891b2', emerald: '#059669', rose: '#e11d48', warm: '#b45309', violet: '#7c3aed',
    },
  },
  {
    id: 'void',
    name: 'Void',
    swatch: ['#050506', '#2fe6f2', '#9a6bff'],
    colors: {
      void: '#050506', surface: '#0b0c11', panel: '#101218',
      ink: '#f2f4f8', inkSoft: '#9ba1b0', inkFaint: '#5c6274',
      rule: 'rgba(255,255,255,0.18)', ruleSoft: 'rgba(255,255,255,0.05)',
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
      rule: 'rgba(255,255,255,0.19)', ruleSoft: 'rgba(255,255,255,0.05)',
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
      rule: 'rgba(216,222,233,0.20)', ruleSoft: 'rgba(216,222,233,0.06)',
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
      rule: 'rgba(192,202,245,0.19)', ruleSoft: 'rgba(192,202,245,0.05)',
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
      rule: 'rgba(235,219,178,0.20)', ruleSoft: 'rgba(235,219,178,0.06)',
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
      rule: 'rgba(205,214,244,0.20)', ruleSoft: 'rgba(205,214,244,0.06)',
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
      rule: 'rgba(147,161,161,0.24)', ruleSoft: 'rgba(147,161,161,0.08)',
      cyan: '#2aa198', emerald: '#859900', rose: '#dc322f', warm: '#b58900', violet: '#6c71c4',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai Pro',
    swatch: ['#2d2a2e', '#78dce8', '#ab9df2'],
    colors: {
      void: '#221f22', surface: '#2d2a2e', panel: '#3a373b',
      ink: '#fcfcfa', inkSoft: '#c1c0c0', inkFaint: '#727072',
      rule: 'rgba(252,252,250,0.20)', ruleSoft: 'rgba(252,252,250,0.06)',
      cyan: '#78dce8', emerald: '#a9dc76', rose: '#ff6188', warm: '#ffd866', violet: '#ab9df2',
    },
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    swatch: ['#282c34', '#56b6c2', '#c678dd'],
    colors: {
      void: '#21252b', surface: '#282c34', panel: '#333842',
      ink: '#abb2bf', inkSoft: '#8f96a3', inkFaint: '#5c6370',
      rule: 'rgba(171,178,191,0.20)', ruleSoft: 'rgba(171,178,191,0.06)',
      cyan: '#56b6c2', emerald: '#98c379', rose: '#e06c75', warm: '#e5c07b', violet: '#c678dd',
    },
  },
  {
    id: 'rose-pine',
    name: 'Rosé Pine',
    swatch: ['#191724', '#9ccfd8', '#c4a7e7'],
    colors: {
      void: '#141220', surface: '#191724', panel: '#26233a',
      ink: '#e0def4', inkSoft: '#b9b6d3', inkFaint: '#6e6a86',
      rule: 'rgba(224,222,244,0.20)', ruleSoft: 'rgba(224,222,244,0.06)',
      cyan: '#9ccfd8', emerald: '#31748f', rose: '#eb6f92', warm: '#f6c177', violet: '#c4a7e7',
    },
  },
  {
    id: 'everforest',
    name: 'Everforest',
    swatch: ['#2d353b', '#83c092', '#e69875'],
    colors: {
      void: '#232a2e', surface: '#2d353b', panel: '#374247',
      ink: '#d3c6aa', inkSoft: '#a8b39e', inkFaint: '#7a8478',
      rule: 'rgba(211,198,170,0.20)', ruleSoft: 'rgba(211,198,170,0.06)',
      cyan: '#7fbbb3', emerald: '#a7c080', rose: '#e67e80', warm: '#dbbc7f', violet: '#d699b6',
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

const DEFAULT_THEME_ID = 'void'

export function applyTheme(id: string) {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID) ?? THEMES[0]
  const root = document.documentElement.style
  for (const key of Object.keys(theme.colors) as (keyof ThemeColors)[]) {
    root.setProperty(VAR_MAP[key], theme.colors[key])
  }
  root.setProperty('color-scheme', theme.scheme ?? 'dark')
  localStorage.setItem(STORAGE_KEY, theme.id)
}

export function getStoredTheme(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID
}

export function getCurrentScheme(): 'dark' | 'light' {
  const theme = THEMES.find((t) => t.id === getStoredTheme())
  return theme?.scheme === 'light' ? 'light' : 'dark'
}
