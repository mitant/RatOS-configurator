'use client';

import { useRef, useState } from 'react';

import { useToolheads } from '@/hooks/useToolheadConfiguration';
import { Card } from '@/components/common/card';
import {
	PSDChartMinimumYVisibleRange,
	PSD_CHART_AXIS_AMPLITUDE_ID,
	useADXLSignalChart,
	usePSDChart,
} from '@/app/analysis/charts';
import { MicrophoneIcon } from '@heroicons/react/20/solid';
import { useGcodeCommand } from '@/app/_hooks/toolhead';
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from '@/components/ui/menubar';
import { twJoin } from 'tailwind-merge';
import { DotFilledIcon, MixIcon } from '@radix-ui/react-icons';
import { Spinner } from '@/components/common/spinner';
import { SciChartReact } from 'scichart-react';
import {
	useADXLFifoTensor,
	useAccumulatedPSD,
	useBufferedADXLSignal,
	useBufferedPSD,
	useDynamicAxisRange,
	useRealtimeADXL,
	useTicker,
} from '@/app/analysis/hooks';
import { MountainAnimation, SciChartSurface, easing } from 'scichart';
import { detrendSignal } from '@/app/analysis/periodogram';

SciChartSurface.configure({
	wasmUrl: '/configure/scichart2d.wasm',
	dataUrl: '/configure/scichart2d.data',
});

export const Analysis = () => {
	const [isChartEnabled, setIsChartEnabled] = useState(false);
	const toolheads = useToolheads();
	const psdChart = usePSDChart();
	const xSignalChart = useADXLSignalChart('x');
	const ySignalChart = useADXLSignalChart('y');
	const zSignalChart = useADXLSignalChart('z');

	const xSignalYAxis = xSignalChart.data.current?.yAxis ?? null;
	const ySignalYAxis = ySignalChart.data.current?.yAxis ?? null;
	const zSignalYAxis = zSignalChart.data.current?.yAxis ?? null;
	const updateSignalChartRange = useDynamicAxisRange([xSignalYAxis, ySignalYAxis, zSignalYAxis]);

	const psdYAxis = psdChart.surface.current?.yAxes.getById(PSD_CHART_AXIS_AMPLITUDE_ID) ?? null;
	const updatePsdChartRange = useDynamicAxisRange(psdYAxis, PSDChartMinimumYVisibleRange);

	const fifo = useADXLFifoTensor();
	const timeSinceLastPsd = useRef<number>(new Date().getTime());
	const psds = useAccumulatedPSD((res) => {
		const surface = psdChart.surface.current;
		if (surface == null) {
			return;
		}
		const elapsed = new Date().getTime() - timeSinceLastPsd.current;
		timeSinceLastPsd.current = new Date().getTime();
		const animationDS = psdChart.data.current?.animationSeries;
		if (animationDS == null) {
			throw new Error('No animation data series');
		}
		animationDS.x.clear();
		animationDS.y.clear();
		animationDS.z.clear();
		animationDS.total.clear();
		animationDS.x.appendRange(res.x.frequencies, res.x.estimates);
		animationDS.y.appendRange(res.y.frequencies, res.y.estimates);
		animationDS.z.appendRange(res.z.frequencies, res.z.estimates);
		animationDS.total.appendRange(res.total.frequencies, res.total.estimates);
		surface.renderableSeries
			.getById('x')
			.runAnimation(new MountainAnimation({ duration: elapsed, ease: easing.inOutCirc, dataSeries: animationDS.x }));
		surface.renderableSeries
			.getById('y')
			.runAnimation(new MountainAnimation({ duration: elapsed, ease: easing.inOutCirc, dataSeries: animationDS.y }));
		surface.renderableSeries
			.getById('z')
			.runAnimation(new MountainAnimation({ duration: elapsed, ease: easing.inOutCirc, dataSeries: animationDS.z }));
		surface.renderableSeries
			.getById('total')
			.runAnimation(
				new MountainAnimation({ duration: elapsed, ease: easing.inOutCirc, dataSeries: animationDS.total }),
			);
		updatePsdChartRange(res.total.powerRange);
	});
	const updatePsd = useBufferedPSD(fifo.sampleRate, psds.onData);
	const updateSignals = useBufferedADXLSignal(fifo, async (time, x, y, z) => {
		// Center the signals by subtracting the mean
		const dX = detrendSignal(x);
		const dY = detrendSignal(y);
		const dZ = detrendSignal(z);
		x.dispose();
		y.dispose();
		z.dispose();
		Promise.all([time.array(), dX.array(), dY.array(), dZ.array()]).then(([timeData, xData, yData, zData]) => {
			xSignalChart.data.current?.signalData.appendRange(timeData, xData);
			ySignalChart.data.current?.signalData.appendRange(timeData, yData);
			zSignalChart.data.current?.signalData.appendRange(timeData, zData);
			xSignalChart.data.current?.historyData.appendRange(timeData, xData);
			ySignalChart.data.current?.historyData.appendRange(timeData, yData);
			zSignalChart.data.current?.historyData.appendRange(timeData, zData);
		});
		updateSignalChartRange();
		updatePsd(time, dX, dY, dZ, true);
	});
	useTicker(updateSignals);

	useRealtimeADXL({
		sensor: toolheads[0].getYAccelerometerName(),
		enabled: isChartEnabled,
		onDataUpdate: fifo.onData,
	});

	const [isRecording, setIsRecording] = useState(false);
	const [isMacroRunning, setIsMacroRunning] = useState(false);
	const G = useGcodeCommand();

	const recordShaperGraph = async (axis: 'x' | 'y') => {
		setIsChartEnabled(true);
		await G`
		MAYBE_HOME
		M400
		`;
		await psds.startAccumulation();
		setIsRecording(true);
		await G`
			GENERATE_RESONANCES AXIS=${axis.toUpperCase()}
			M400
		`;
		const psd = await psds.stopAccumulation();
		setIsRecording(false);
		setIsChartEnabled(false);
	};

	const recordBeltGraph = async () => {
		setIsChartEnabled(true);
		await G`
		MAYBE_HOME
		M400
		`;
		await psds.startAccumulation();
		setIsRecording(true);
		await G`
			GENERATE_RESONANCES AXIS=1,1
			M400
		`;
		const upperpsd = await psds.stopAccumulation();
		await psds.startAccumulation();
		setIsRecording(true);
		await G`
			GENERATE_RESONANCES AXIS=1,-1
			M400
		`;
		const lowerpsd = await psds.stopAccumulation();
		setIsRecording(false);
		setIsChartEnabled(false);
	};

	const runMacro =
		<T extends (...args: Parameters<T>) => Promise<any>>(macro: T, ...args: Parameters<T>) =>
		async () => {
			setIsMacroRunning(true);
			await macro(...args);
			setIsMacroRunning(false);
		};

	const MacroIcon = isRecording ? (
		<DotFilledIcon className="h-4 w-4 scale-150 text-red-400" />
	) : isMacroRunning ? (
		<Spinner noMargin={true} className="h-4 w-4" />
	) : (
		<MixIcon className="h-4 w-4" />
	);

	return (
		<div className="flex max-h-full min-h-full flex-col space-y-4">
			{/* <Toolbar buttons={toolbarButtons} /> */}
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger className="flex-nowrap space-x-2 whitespace-nowrap text-nowrap">
						<MicrophoneIcon className={twJoin('h-4 w-4', isChartEnabled && 'text-brand-400')} /> <span>Stream</span>
					</MenubarTrigger>
					<MenubarContent onCloseAutoFocus={(e) => e.preventDefault()}>
						<MenubarItem
							disabled={isChartEnabled}
							onClick={async () => {
								setIsChartEnabled(true);
							}}
						>
							Start
						</MenubarItem>
						<MenubarItem
							disabled={!isChartEnabled}
							onClick={async () => {
								setIsChartEnabled(false);
							}}
						>
							Stop
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem disabled={!isRecording}>Stop recording</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger className="flex-nowrap space-x-2 whitespace-nowrap text-nowrap">
						{MacroIcon} <span>Macros</span>
					</MenubarTrigger>
					<MenubarContent onCloseAutoFocus={(e) => e.preventDefault()}>
						<MenubarItem disabled={isRecording} onSelect={runMacro(recordBeltGraph)}>
							CoreXY Belt Tension
						</MenubarItem>
						<MenubarItem disabled={isRecording} onSelect={runMacro(recordShaperGraph, 'x')}>
							X Shaper Graph
						</MenubarItem>
						<MenubarItem disabled={isRecording} onSelect={runMacro(recordShaperGraph, 'y')}>
							Y Shaper Graph
						</MenubarItem>
						<MenubarSeparator />
						<MenubarItem disabled={!isRecording}>Abort</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card className="flex max-h-32 overflow-hidden sm:max-h-72 sm:min-h-72">
					<SciChartReact {...xSignalChart.forwardProps} className="flex-1 rounded-lg" />
				</Card>
				<Card className="flex max-h-32 overflow-hidden sm:max-h-72 sm:min-h-72">
					<SciChartReact {...ySignalChart.forwardProps} className="flex-1 rounded-lg" />
				</Card>
				<Card className="flex max-h-32 overflow-hidden sm:max-h-72 sm:min-h-72">
					<SciChartReact {...zSignalChart.forwardProps} className="flex-1 rounded-lg" />
				</Card>
			</div>
			<Card className="flex flex-1 overflow-hidden">
				<SciChartReact {...psdChart.forwardProps} className="flex-1" />
			</Card>
		</div>
	);
};
