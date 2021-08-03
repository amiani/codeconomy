import React, { MutableRefObject, useEffect, useRef } from "react"
import pixiApp from './pixiApp'

export default function Game() {
	const ref = useRef() as MutableRefObject<HTMLDivElement>
	useEffect(() => {
		ref.current.appendChild(pixiApp.view)
		pixiApp.start()

		return () => {
			pixiApp.stop()
		}
	}, [])

	return <div ref={ref} />
}