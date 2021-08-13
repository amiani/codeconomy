import { createEffect, World } from '@javelin/ecs'
import { Viewport } from 'pixi-viewport'
import * as PIXI from 'pixi.js';

import app from '../pixiApp'

const updateBackground = (background: PIXI.TilingSprite, viewport: Viewport) => {
	background.x = viewport.left
	background.y = viewport.top
	background.tilePosition.x = -viewport.left * viewport.scale.x
	background.tilePosition.y = -viewport.top * viewport.scale.y
	background.width = viewport.screenWidth * (32 / viewport.scale.x)
	background.height = viewport.screenHeight * (32 / viewport.scale.y)
}

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

	viewport.on('moved', () => {
		if (hasBackground) {
			updateBackground(background, viewport)
		}
	})

	let hasBackground = false
	let background: PIXI.TilingSprite

	return () => {
		if (!hasBackground && app.loader.resources.goldstartile.texture) {
			background = new PIXI.TilingSprite(app.loader.resources.goldstartile.texture)
			background.scale.x = 1/viewport.scale.x
			background.scale.y = 1/viewport.scale.y
			viewport.addChild(background)
			updateBackground(background, viewport)
			hasBackground = true
		}
		return viewport
	}
}, { shared: true })