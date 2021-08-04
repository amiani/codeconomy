import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import ship from '../../assets/images/ship1.png'

const app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialias: true,
})

const viewport = new Viewport({
    screenWidth: app.view.width,
    screenHeight: app.view.height,
    worldWidth: 1000,
    worldHeight: 1000,

    interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
})

app.stage.addChild(viewport)

// activate plugins
viewport
    .drag()
    .wheel()
    .decelerate()
app.loader.add('ship', ship).load()

/*
const dot = viewport.addChild(new PIXI.Graphics())
dot.beginFill(0xffffff)
dot.drawCircle(0, 0, 20)
*/
viewport.fit()
viewport.moveCenter(0, 0)

export { app, viewport }