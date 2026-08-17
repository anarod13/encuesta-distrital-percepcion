<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Chart from '$lib/Chart.svelte';
	import Filters from '$lib/Filters.svelte';
	import UplMap from '$lib/UplMap.svelte';
	import { buildOption } from '$lib/chartOption';
	import { filters } from '$lib/filterState.svelte';
	import type { Measure } from '$lib/types';

	let { data } = $props();
	const doughnutMaxUpls = 3;

	function parseMeasure(raw: string | null): Measure {
		if (raw === 'hogares' || raw === 'hogaresPct') return 'hogares';
		return 'personas';
	}

	function measureFields(m: Measure) {
		return m === 'hogares'
			? { count: 'hogares' as const, pct: 'hogaresPct' as const, cv: 'hCvPct' as const }
			: { count: 'personas' as const, pct: 'personasPct' as const, cv: 'pCvPct' as const };
	}

	const upls = $derived(Object.keys(data.slice));
	let seededId = $state('');

	$effect(() => {
		const id = data.question.id;
		if (seededId === id) return;
		const fromUrl = page.url.searchParams.getAll('upl').filter((name) => name in data.slice);
		const kept = filters.selectedUpls.filter((name) => name in data.slice);
		filters.selectedUpls = fromUrl.length ? fromUrl : kept.length ? kept : upls.slice(0, 1);
		if (data.question.chartKind === 'doughnut') {
			filters.selectedUpls = filters.selectedUpls.slice(0, doughnutMaxUpls);
		}
		if (page.url.searchParams.has('measure')) {
			filters.measure = parseMeasure(page.url.searchParams.get('measure'));
		}
		seededId = id;
	});

	$effect(() => {
		if (seededId !== data.question.id) return;
		const params = new URLSearchParams();
		for (const name of filters.selectedUpls) params.append('upl', name);
		params.set('measure', filters.measure);
		const next = params.toString();
		if (page.url.search.slice(1) === next) return;
		goto(`${page.url.pathname}?${next}`, { replaceState: true, keepFocus: true, noScroll: true });
	});

	const options = $derived.by(() => {
		const fields = measureFields(filters.measure);
		const series = filters.selectedUpls.flatMap((name) => {
			const rows = data.slice[name];
			if (!rows?.length) return [];
			return [
				{
					name,
					counts: rows.map((row) => row[fields.count]),
					pcts: rows.map((row) => row[fields.pct]),
					cv: rows.map((row) => row[fields.cv])
				}
			];
		});
		if (data.question.chartKind === 'doughnut') {
			return series.map((s) =>
				buildOption({
					kind: 'doughnut',
					title: s.name,
					categories: data.slice[s.name]?.map((row) => row.cat) ?? data.question.categories,
					series: [s],
					measure: filters.measure
				})
			);
		}
		const first = filters.selectedUpls[0];
		const categories =
			first && data.slice[first]
				? data.slice[first].map((row) => row.cat)
				: data.question.categories;
		return [
			buildOption({
				kind: data.question.chartKind,
				title: data.question.title,
				categories,
				series,
				measure: filters.measure
			})
		];
	});
</script>

<svelte:head>
	<title>{data.question.title}</title>
</svelte:head>

<h1>{data.question.title}</h1>
<div class="toolbar">
	<div class="filters">
		<Filters
			{upls}
			bind:selectedUpls={filters.selectedUpls}
			bind:measure={filters.measure}
			maxUpls={data.question.chartKind === 'doughnut' ? doughnutMaxUpls : undefined}
		/>
	</div>
	<div class="map">
		<UplMap />
	</div>
</div>
{#if filters.selectedUpls.length === 0}
	<p>Selecciona al menos una UPL.</p>
{:else}
	<div class:doughnuts={data.question.chartKind === 'doughnut'}>
		{#each options as opt, i (`${filters.selectedUpls[i] ?? i}`)}
			<div class="doughnut">
				<Chart option={opt} />
			</div>
		{/each}
	</div>
{/if}

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: start;
		justify-content: space-between;
		gap: 1rem 1.5rem;
		margin: 1rem 5rem 1rem 4rem;
	}

	.filters {
		flex: 1 1 16rem;
		min-width: 0;
		width: 70%;
	}
	.map {
		width: 30%;
		align-items: center;
	}

	.doughnuts {
		display: flex;
		justify-content: center;
		align-items: start;
		gap: 0.5rem 1rem;
	}

	.doughnut {
		flex: 1 1 0;
		min-width: 0;
		max-width: 100%;
	}
</style>
