import { createQuery, useInterval, World } from "@javelin/ecs";

import { Allegiance, Countdown, HuntScore } from "../../../server/components";
import { actions, Score } from "../ui/state";
import { teamColors, teamNames } from '../ui/colors'

const teamScores = createQuery(HuntScore, Allegiance)
const countdowns = createQuery(Countdown)

export default function huntScoreDisplaySystem(world: World) {
	const update = useInterval(1000)
	if (update) {
		const scores = Array<Score>()
		teamScores((e, [score, allegiance]) => {
			scores.push({
				name: teamNames[allegiance.team],
				color: '#' + teamColors[allegiance.team].toString(16),
				points: score.points })
		})
		actions.setScores(scores)
		countdowns((e, [countdown]) => {
			console.log('setting time')
			actions.setTime(countdown.current)
		})
	}
}