import React, { FormEventHandler } from 'react'

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
		<form onSubmit={onSubmit}>
			<input type="text" name="name" placeholder="Name" />
			<input type="email" name="email" placeholder="Email" />
			<textarea name="message" placeholder="..." />
			<button type="submit">Submit</button>
		</form>
	)
}