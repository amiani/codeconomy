import { createEffect, World } from '@javelin/ecs'
import { Viewport } from 'pixi-viewport'

import app from './pixiApp'

export default createEffect((world: World) => {
	const viewport = app.stage.addChild(new Viewport({
		screenWidth: app.view.width,
		screenHeight: app.view.height,
		worldWidth: 1000,
		worldHeight: 1000,

		interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
	}))

	// activate plugins
	viewport
		.drag()
		.wheel()
		.decelerate()

	viewport.fit()
	viewport.moveCenter(0, 0)
	viewport.scaled = 32

	return () => {
		return viewport
	}
}, { shared: true })