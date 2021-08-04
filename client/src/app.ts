import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport'
import ship from '../../assets/images/ship1.png'

export const app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	resolution: window.devicePixelRatio,
	antialias: true,
})

export const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
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