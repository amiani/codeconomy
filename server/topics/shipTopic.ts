import { ComponentOf, createTopic, Entity } from "@javelin/ecs";
import { CombatHistory } from '../components'

interface ShipEvent {
	entity: Entity,
	type: string,
	combatHistory: ComponentOf<typeof CombatHistory>
}

export default createTopic<ShipEvent>()