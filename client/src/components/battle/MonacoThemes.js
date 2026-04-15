export const synthwaveTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { background: '0d0914' },
    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'ff7edb', fontStyle: 'bold' },
    { token: 'string', foreground: 'f1fa8c' },
    { token: 'number', foreground: 'bd93f9' },
    { token: 'identifier', foreground: 'f8f8f2' },
    { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
    { token: 'function', foreground: '50fa7b' },
  ],
  colors: {
    'editor.background': '#0d0914',
    'editor.foreground': '#f8f8f2',
    'editor.lineHighlightBackground': '#ff7edb20',
    'editorCursor.foreground': '#ff7edb',
    'editorLineNumber.foreground': '#6272a4',
    'editorIndentGuide.background': '#44475a80',
    'editorIndentGuide.activeBackground': '#ff7edb80',
    'editor.selectionBackground': '#bd93f940',
  }
};
