export interface EditorState {
	code: string
}

export interface UIState {
	editor: EditorState
	showWelcomeModal: boolean
}
