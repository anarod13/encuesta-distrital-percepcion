import type { EChartsOption, TooltipComponentFormatterCallbackParams } from 'echarts';
import type { ChartKind, Measure } from './types';

export type ChartSeries = {
	name: string;
	counts: number[];
	pcts: number[];
	cv?: number[];
};

export type BuildOptionArgs = {
	kind: ChartKind;
	title: string;
	categories: string[];
	series: ChartSeries[];
	measure: Measure;
};

const HIGH_CV = 20;

const MEASURE_LABEL: Record<Measure, string> = {
	personas: 'Personas',
	hogares: 'Hogares'
};

type PointData = {
	value: number;
	count: number;
	pct: number;
	cv?: number;
};

function cvSuffix(cv?: number) {
	if (cv == null) return '';
	const flag = cv > HIGH_CV ? ' · CV alto' : '';
	return ` · CV ${cv.toFixed(1)}%${flag}`;
}

function formatCount(n: number) {
	return n.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

function formatPct(n: number) {
	return `${n.toFixed(2)}%`;
}

function formatPair(count: number, pct: number) {
	return `${formatCount(count)} (${formatPct(pct)})`;
}

function pointData(data: unknown): PointData | undefined {
	if (!data || typeof data !== 'object') return undefined;
	const d = data as Partial<PointData>;
	if (typeof d.count !== 'number' || typeof d.pct !== 'number') return undefined;
	return d as PointData;
}

function itemTooltip(params: TooltipComponentFormatterCallbackParams, measure: Measure) {
	const p = Array.isArray(params) ? params[0] : params;
	if (!p) return '';
	const d = pointData(p.data);
	const value = d ? formatPair(d.count, d.pct) : String(p.value ?? '');
	return `${p.name}<br/>${MEASURE_LABEL[measure]}: ${value}${cvSuffix(d?.cv)}`;
}

function axisTooltip(params: TooltipComponentFormatterCallbackParams, measure: Measure) {
	const list = Array.isArray(params) ? params : [params];
	const header = list[0]?.name ?? '';
	const lines = list.map((p) => {
		const d = pointData(p.data);
		const value = d ? formatPair(d.count, d.pct) : String(p.value ?? '');
		return `${p.marker}${p.seriesName}: ${value}${cvSuffix(d?.cv)}`;
	});
	return [`${header} · ${MEASURE_LABEL[measure]}`, ...lines].join('<br/>');
}

function toPoint(series: ChartSeries, categoryIndex: number, value: number): PointData {
	return {
		value,
		count: series.counts[categoryIndex] ?? 0,
		pct: series.pcts[categoryIndex] ?? 0,
		cv: series.cv?.[categoryIndex]
	};
}

function doughnutOption(args: BuildOptionArgs): EChartsOption {
	const primary = args.series[0];
	return {
		title: { text: args.title, left: 'center' },
		tooltip: {
			trigger: 'item',
			formatter: (params) => itemTooltip(params, args.measure)
		},
		legend: { bottom: 0 },
		series: [
			{
				type: 'pie',
				radius: ['42%', '68%'],
				label: {
					formatter: (params) => {
						const d = pointData(params.data);
						if (!d) return String(params.name ?? '');
						return `${params.name}\n${formatPair(d.count, d.pct)}`;
					}
				},
				data: args.categories.map((name, i) => ({
					name,
					...toPoint(primary ?? { name: '', counts: [], pcts: [] }, i, primary?.counts[i] ?? 0)
				}))
			}
		]
	};
}

function stackedOption(args: BuildOptionArgs): EChartsOption {
	return {
		title: { text: args.title, left: 'center' },
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			formatter: (params) => axisTooltip(params, args.measure)
		},
		legend: { bottom: 0 },
		grid: { left: 24, right: 24, top: 56, bottom: 72, containLabel: true },
		xAxis: {
			type: 'value',
			max: 100,
			axisLabel: { formatter: '{value}%' }
		},
		yAxis: { type: 'category', data: args.series.map((s) => s.name), inverse: true },
		series: args.categories.map((cat, i) => ({
			name: cat,
			type: 'bar',
			stack: 'total',
			emphasis: { focus: 'series' },
			data: args.series.map((s) => toPoint(s, i, s.pcts[i] ?? 0))
		}))
	};
}

function hbarOption(args: BuildOptionArgs): EChartsOption {
	const zoom = args.categories.length > 8;
	return {
		title: { text: args.title, left: 'center' },
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			formatter: (params) => axisTooltip(params, args.measure)
		},
		legend: args.series.length > 1 ? { bottom: 0 } : undefined,
		grid: { left: 24, right: zoom ? 40 : 24, top: 56, bottom: 72, containLabel: true },
		xAxis: {
			type: 'value',
			axisLabel: { formatter: '{value}%' }
		},
		yAxis: { type: 'category', data: args.categories, inverse: true },
		dataZoom: zoom
			? [
					{ type: 'slider', yAxisIndex: 0, width: 12, right: 8 },
					{ type: 'inside', yAxisIndex: 0 }
				]
			: undefined,
		series: args.series.map((s) => ({
			name: s.name,
			type: 'bar',
			label: {
				show: true,
				position: 'right',
				formatter: (params) => {
					const d = pointData(params.data);
					return d ? formatPair(d.count, d.pct) : '';
				}
			},
			data: s.pcts.map((_, i) => toPoint(s, i, s.pcts[i] ?? 0))
		}))
	};
}

export function buildOption(args: BuildOptionArgs): EChartsOption {
	if (args.kind === 'doughnut') return doughnutOption(args);
	if (args.kind === 'stacked') return stackedOption(args);
	return hbarOption(args);
}
