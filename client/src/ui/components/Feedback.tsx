import React, { CSSProperties, FormEventHandler } from 'react'

export interface Feedback {
	name?: string;
	email?: string;
	message?: string;
}

interface FeedbackFormProps {
	onSubmit: FormEventHandler<Feedback>;
}

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
	return (
		<form onSubmit={onSubmit} style={formStyle}>
			<input type="text" name="name" placeholder="Name" style={nameStyle}/>
			<input type="email" name="email" placeholder="Email" style={emailStyle}/>
			<textarea name="message" placeholder="..." style={messageStyle}/>
			<button type="submit" style={buttonStyle}>Submit</button>
		</form>
	)
}

const formStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	minHeight: '300px',
	opacity: '92%'
}

const nameStyle: CSSProperties = {
	width: '214px',
}

const emailStyle: CSSProperties = {
	width: '214px'
}

const messageStyle: CSSProperties = {
	minHeight: '200px'
}

const buttonStyle: CSSProperties = {
	width: '60px'
}