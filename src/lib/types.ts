export type ChartKind = "doughnut" | "hbar" | "stacked";
export type Measure = 'personas' | 'hogares';

export type Question = {
	id: string;
	title: string;
	chartKind: ChartKind;
	categories: string[];
};
 export type UPL = {
	id: string;
     name: string;
    questionsIds: string[];
};

export type AnswerRow = {
	cat: string;
	personasPct: number;
	hogaresPct: number;
	personas: number;
	hogares: number;
	pCvPct: number;
	hCvPct: number;
};

export type Answers = Record<string, Record<string, AnswerRow[]>>;