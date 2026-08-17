<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';
	import type { ECharts, EChartsOption } from 'echarts';

	let { option }: { option: EChartsOption } = $props();

	let el: HTMLDivElement | undefined = $state();
	let chart: ECharts | undefined;

	onMount(() => {
		if (!el) return;
		chart = echarts.init(el);
		chart.setOption(option, true);
		const observer = new ResizeObserver(() => chart?.resize());
		observer.observe(el);
		return () => {
			observer.disconnect();
			chart?.dispose();
			chart = undefined;
		};
	});

	$effect(() => {
		const next = option;
		if (chart) chart.setOption(next, true);
	});
</script>

<div class="chart" bind:this={el}></div>

<style>
	.chart {
		width: 100%;
		height: 480px;
		min-width: 0;
	}
</style>
