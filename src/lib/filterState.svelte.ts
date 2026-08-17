import type { Measure } from './types';

export const filters = $state({
	selectedUpls: [] as string[],
	measure: 'personas' as Measure
});
