import { component, createEffect, createQuery, Entity, useInit, useMonitor, World } from "@javelin/ecs";
import { Clock } from "@javelin/hrtime-loop";
import { playerTopic, shipTopic } from "../topics";

import {
	Countdown,
	Player,
	HuntScore,
	Spawner,
	Allegiance,
	Transform,
	Action,
} from '../components'
import { createSpawner } from "../factories";
import { MAX_PLAYERS } from "../env";

const players = createQuery(Player)

const ROUND_LENGTH = 180

const spawners = createQuery(Spawner, Allegiance)
const ships = createQuery(Transform, Action)

interface SpawnLocation {
	x: number;
	y: number;
	player: Entity;
}

const useSpawnLocations = createEffect(world => {
	const distance = 100
	const spawnLocations = Array<SpawnLocation>()
	for (let i = 0; i != MAX_PLAYERS; ++i) {
		const angle = 2*Math.PI * (((3 * i) % 10) / 10)
		spawnLocations.push({
			x: Math.cos(angle) * distance,
			y: Math.sin(angle) * distance,
			player: -1,
		})
	}

	const next = () => spawnLocations.find(l => l.player == -1)
	const remove = (player: Entity) => {
		const spawnLocation = spawnLocations.find(l => l.player == player)
		spawnLocation && (spawnLocation.player = -1)
	}
	return () => ({
		next,
		remove
	})
})

const handlePlayerJoined = (
	world: World<Clock>,
	player: Entity,
	team: number,
	spawnLocation: SpawnLocation
) => {
	const { x, y } = spawnLocation
	const spawner = createSpawner(world, x, y, player, team,10)
	spawnLocation.player = player
}

const handlePlayerLeft = (world: World<Clock>, player: Entity) => {
	spawners((e, [spawner, allegiance]) => {
		if (allegiance.player == player) {
			console.log(`removed spawner ${e}`)
			world.destroy(e)
		}
	})
}

export default function huntSystem(world: World<Clock>) {
	//Round timer
	let roundTimer
	if (useInit()) {
		roundTimer = component(Countdown, { current: ROUND_LENGTH, max: ROUND_LENGTH })
		world.create(roundTimer)
	}
	if (roundTimer) {
		const dt = world.latestTickData.dt
		roundTimer.current -= dt
		if (roundTimer.current <= 0) {
			world.reset()
		}
	}

	//Ship distance
	ships((e, [transform, action]) => {
		const distance = Math.sqrt(Math.pow(transform.x, 2) + Math.pow(transform.y, 2))
		if (distance > 700) {
			world.destroy(e)
		}
	})

	//Spawn locations
	const spawnLocations = useSpawnLocations()
	for (const playerEvent of playerTopic) {
		switch (playerEvent.type) {
			case 'player-joined':
				const spawnLocation = spawnLocations.next()
				if (spawnLocation) {
					handlePlayerJoined(world, playerEvent.entity, 1, spawnLocation)
				}
				break
			case 'player-left':
				handlePlayerLeft(world, playerEvent.entity)
				spawnLocations.remove(playerEvent.entity)
				break
		}
	}

	//Score
	useMonitor(players,(e, [p]) => world.attach(e, component(HuntScore)))

	for (const shipEvent of shipTopic) {
		if (shipEvent.type === 'ship-destroyed') {
			if (shipEvent.entity !== shipEvent.combatHistory.lastHitByPlayer) {
				try {
					const score = world.get(shipEvent.combatHistory.lastHitByPlayer, HuntScore)
					score && score.points++
					console.log(`Player score: ${score.points}`)
				} catch (err) {
					console.log(err)
				}
			}
		}
	}
}