import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import ship from '../../assets/images/ship1.png'
import smallbluelaser from '../../assets/images/smallbluelaser.png'

const app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialias: true,
})

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

app.loader
    .add('ship', ship)
    .add('smallbluelaser', smallbluelaser)
    .load()

export { app, viewport }