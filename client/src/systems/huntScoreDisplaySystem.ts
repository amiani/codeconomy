import { createQuery, useInterval, World } from "@javelin/ecs";
import { Countdown, HuntScore, Player } from "../../../server/components";
import { actions, Score } from "../ui/state";

const playerScores = createQuery(Player, HuntScore)
const countdowns = createQuery(Countdown)

export default function huntScoreDisplaySystem(world: World) {
	const update = useInterval(1000)
	if (update) {
		const scores = Array<Score>()
		playerScores((e, [player, score]) => {
			scores.push({ name: player.name, points: score.points })
		})
		actions.setScores(scores)
		countdowns((e, [countdown]) => {
			console.log('setting time')
			actions.setTime(countdown.current)
		})
	}
}