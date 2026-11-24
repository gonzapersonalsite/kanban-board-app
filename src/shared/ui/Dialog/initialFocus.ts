const INITIAL_FOCUS_ATTRIBUTE = 'data-dialog-initial-focus'

// React keeps autoFocus off the DOM and focuses on mount, when a dialog is still closed and nothing in it
// can take the focus: #which-element-takes-the-focus-when-a-dialog-opens
export const DIALOG_INITIAL_FOCUS = { [INITIAL_FOCUS_ATTRIBUTE]: '' } as const

export const DIALOG_INITIAL_FOCUS_SELECTOR = `[${INITIAL_FOCUS_ATTRIBUTE}]`
