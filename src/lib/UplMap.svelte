<script lang="ts">
	import { onMount } from 'svelte';
	import { filters } from './filterState.svelte';

	type MapFeature = { name: string; d: string };

	let viewBox = $state('0 0 160 140');
	let features = $state<MapFeature[]>([]);

	onMount(async () => {
		const data = await fetch('/data/upls-map.json').then((r) => r.json());
		viewBox = data.viewBox;
		features = data.features ?? [];
	});
</script>

<svg class="map" {viewBox} aria-hidden="true">
	{#each features as f (f.name)}
		<path d={f.d} class:selected={filters.selectedUpls.includes(f.name)}>
			<title>{f.name}</title>
		</path>
	{/each}
</svg>

<style>
	.map {
		display: block;
		width: 20rem;
		height: 20.5rem;
		flex-shrink: 0;
	}

	path {
		fill: #e8eef6;
		stroke: #5d7390;
		stroke-width: 0.6;
		vector-effect: non-scaling-stroke;
	}

	path.selected {
		fill: #3d7ac9;
		stroke: #10243e;
	}
</style>
