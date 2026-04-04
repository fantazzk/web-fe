export interface ResultPlayer {
	name: string;
	position: string;
	price: string;
}

export interface ResultTeam {
	captain: string;
	players: ResultPlayer[];
	total: string;
}
