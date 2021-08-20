import { component, World } from "@javelin/ecs";
import { Clock } from "@javelin/hrtime-loop";
import { Allegiance } from "../components";
import { useTeams } from "../effects";
import { playerTopic } from "../topics";

// Attaches an Allegiance with the next available team to the player entity

export default function ffaSystem(world: World<Clock>) {
	const teams = useTeams()
	for (const event of playerTopic) {
		switch (event.type) {
			case 'player-joined':
				try {
					const team = teams.assign(event.entity)
					world.attachImmediate(event.entity, [component(Allegiance, { player: event.entity, team })])
				} catch (err) {
					console.error(`Error assigning team to player`)
					console.log(err)
				}
				break
			case 'player-left':
				try {
					teams.remove(event.entity)
				} catch (err) {
					console.error(`Error removing player from team`)
				}
				break
		}
	}
}