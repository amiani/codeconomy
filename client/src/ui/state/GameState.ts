export interface Score {
	name: string;
	points: number;
}

export interface GameState {
	scores: Array<Score>,
	timer: number,
}