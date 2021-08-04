import React, { MutableRefObject, useEffect, useRef } from "react"
import { app } from './app'

export default function Game() {
	const ref = useRef() as MutableRefObject<HTMLDivElement>
	useEffect(() => {
		ref.current.appendChild(app.view)
		app.start()

		return () => {
			app.stop()
		}
	}, [])

	return <div ref={ref} />
}