import { useEffect, useState } from 'react';
import { useToolheadConfiguration } from '../../hooks/useToolheadConfiguration';
import { stringToTitleObject } from '../../utils/serialization';
import { ToolOrAxis, ToolheadConfiguration } from '../../zods/toolhead';
import { Dropdown, DropdownWithPrinterQuery } from '../forms/dropdown';
import { Spinner } from '../common/spinner';
import { twMerge } from 'tailwind-merge';
import { badgeBackgroundColorStyle, badgeBorderColorStyle, badgeTextColorStyle } from '../common/badge';
import { WarningMessage } from '../warning-message';
import { Nozzle } from '../../zods/hardware';
import { TextInput } from '../forms/text-input';
import { z } from 'zod';

interface ToolheadSettingsProps {
	toolOrAxis: ToolOrAxis;
}

type ToolheadSettingsErrors = z.typeToFlattenedError<ToolheadConfiguration<any>>;

export const ToolheadSettings: React.FC<ToolheadSettingsProps> = (props) => {
	const { toolhead, setToolhead } = useToolheadConfiguration(props.toolOrAxis);
	const [selectedHotend, setSelectedHotend] = useState(toolhead.getHotend() ?? null);
	const [selectedNozzle, setSelectedNozzle] = useState(toolhead.getNozzle() ?? null);
	const [selectedExtruder, setSelectedExtruder] = useState(toolhead.getExtruder() ?? null);
	const [selectedThermistor, setSelectedThermistor] = useState(toolhead.getThermistor() ?? null);
	const [selectedProbe, setSelectedProbe] = useState(toolhead.getProbe() ?? null);
	const [selectedXEndstop, setSelectedXEndstop] = useState(toolhead.getXEndstop() ?? null);
	const [selectedYEndstop, setSelectedYEndstop] = useState(toolhead.getYEndstop() ?? null);
	const [selectedPartFan, setSelectedPartFan] = useState(toolhead.getPartFan() ?? null);
	const [selectedHotendFan, setSelectedHotendFan] = useState(toolhead.getHotendFan() ?? null);
	const [selectedXAccelerometer, setSelectedXAccelerometer] = useState(toolhead.getXAccelerometer() ?? null);
	const [selectedYAccelerometer, setSelectedYAccelerometer] = useState(toolhead.getYAccelerometer() ?? null);
	const [errors, setErrors] = useState<ToolheadSettingsErrors | null>(null);

	const setNozzleType = (val: ReturnType<typeof stringToTitleObject<z.infer<typeof Nozzle>['type']>>) => {
		setSelectedNozzle({ ...selectedNozzle, type: val.id });
	};

	const setNozzleDiameter = (diameter: number) => {
		setSelectedNozzle({ ...selectedNozzle, diameter });
	};

	useEffect(() => {
		const updated = toolhead.getChangeSet({
			hotend: selectedHotend,
			extruder: selectedExtruder,
			thermistor: selectedThermistor,
			probe: selectedProbe ?? undefined,
			xEndstop: selectedXEndstop,
			yEndstop: selectedYEndstop,
			partFan: selectedPartFan,
			nozzle: selectedNozzle,
			hotendFan: selectedHotendFan,
			xAccelerometer: selectedXAccelerometer,
			yAccelerometer: selectedYAccelerometer,
		});
		if (updated?.success && updated.data && Object.keys(updated.data).length > 0) {
			const ret = setToolhead({ ...toolhead.getConfig(), ...updated.data });
			ret.then((res) => {
				if (!res.success) {
					setErrors(res.error.formErrors);
				} else {
					setErrors(null);
				}
			});
		} else if (!updated?.success) {
			setErrors(updated?.error.formErrors ?? null);
		} else {
			setErrors(null);
		}
	}, [
		selectedExtruder,
		selectedHotend,
		selectedHotendFan,
		selectedNozzle,
		selectedPartFan,
		selectedProbe,
		selectedThermistor,
		selectedXAccelerometer,
		selectedXEndstop,
		selectedYAccelerometer,
		selectedYEndstop,
		setToolhead,
		toolhead,
	]);

	if (toolhead == null) {
		return (
			<div>
				<div className="mt-4">
					<h3 className="text-base font-medium leading-7 text-zinc-900 dark:text-zinc-100">Toolhead...</h3>
					<p className="mt-2 max-w-4xl text-sm text-zinc-500 dark:text-zinc-400">
						Configure the hardware installed on your toolhead...
					</p>
				</div>
				<div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-700 sm:grid-cols-2">
					<div className="mb-4 flex h-96 items-center justify-center">
						<Spinner />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={twMerge(badgeBorderColorStyle({ color: 'gray' }), 'col-span-1 rounded-md border p-4 shadow-lg')}>
			<div
				className={twMerge(
					badgeBackgroundColorStyle({ color: 'gray' }),
					badgeTextColorStyle({ color: 'gray' }),
					badgeBorderColorStyle({ color: 'gray' }),
					'-m-4 mb-0 rounded-t-md border-b p-4',
				)}
			>
				<h3 className="text-base font-medium leading-7 text-zinc-900 dark:text-zinc-100">
					Toolhead {toolhead.getToolCommand()} Hardware
				</h3>
				<p className="mt-2 max-w-4xl text-sm">
					Configure the hardware installed on {toolhead.getDescription().toLocaleLowerCase()}
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
				<div>
					<DropdownWithPrinterQuery
						query="hotends"
						value={selectedHotend}
						label="Hotend"
						onSelect={setSelectedHotend}
					/>
				</div>
				<div>
					<DropdownWithPrinterQuery
						label="Hotend Thermistor"
						query="thermistors"
						onSelect={(thermistor) => {
							setSelectedThermistor(thermistor.id);
						}}
						value={stringToTitleObject(selectedThermistor)}
					/>
				</div>
				<div>
					<Dropdown
						label="Nozzle Type"
						onSelect={setNozzleType}
						options={Object.values(Nozzle.shape.type.Values).map(stringToTitleObject)}
						value={stringToTitleObject(selectedNozzle.type)}
					/>
				</div>
				<div>
					<TextInput
						type="number"
						label="Nozzle Diameter"
						error={errors?.fieldErrors.nozzle?.join('\n')}
						value={selectedNozzle.diameter}
						onChange={setNozzleDiameter}
						inputMode="decimal"
						step={0.1}
						min={0.2}
						max={1.8}
					/>
				</div>
				{toolhead.getToolboard()?.alternativePT1000Resistor && toolhead.getThermistor() === 'PT1000' && (
					<div className="col-span-2">
						<WarningMessage title="RatOS uses your toolboards alternate pullup resistor setting">
							Your toolboard has an option to use a separate pullup resistor for PT1000 sensors. This is usually done by
							inserting a jumper. Make sure you read the documentation for your board on how to enable the alternative
							resistor or you'll get ADC temperature errors in klipper.
						</WarningMessage>
					</div>
				)}
				<div>
					<DropdownWithPrinterQuery
						label="Extruder"
						query="extruders"
						onSelect={setSelectedExtruder}
						value={selectedExtruder}
					/>
				</div>
				<div>
					<DropdownWithPrinterQuery label="Probe" query="probes" onSelect={setSelectedProbe} value={selectedProbe} />
				</div>
			</div>
			<div className="mt-4 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-700 sm:grid-cols-2">
				<div>
					<DropdownWithPrinterQuery
						vars={{ toolOrAxis: toolhead.getTool(), config: {} }}
						serializedPrinterConfiguration="config"
						label="X Endstop"
						query="xEndstops"
						onSelect={setSelectedXEndstop}
						value={selectedXEndstop}
					/>
				</div>
				<div>
					<DropdownWithPrinterQuery
						vars={{ toolOrAxis: toolhead.getTool(), config: {} }}
						serializedPrinterConfiguration="config"
						label="Y Endstop"
						query="yEndstops"
						onSelect={setSelectedYEndstop}
						value={selectedYEndstop}
					/>
				</div>
			</div>
			<div className="mt-4 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-700 sm:grid-cols-2">
				<div>
					<DropdownWithPrinterQuery
						vars={{ toolOrAxis: toolhead.getTool(), config: {} }}
						serializedPrinterConfiguration="config"
						label="Part cooling fan"
						query="partFanOptions"
						onSelect={setSelectedPartFan}
						value={selectedPartFan}
					/>
				</div>
				<div>
					<DropdownWithPrinterQuery
						vars={{ toolOrAxis: toolhead.getTool(), config: {} }}
						serializedPrinterConfiguration="config"
						label="Hotend fan"
						query="hotendFanOptions"
						onSelect={setSelectedHotendFan}
						value={selectedHotendFan}
					/>
				</div>
			</div>
			<div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-700">
				<h3 className="text-base font-medium leading-7 text-zinc-900 dark:text-zinc-100">Accelerometers</h3>
				<p className="mt-2 max-w-4xl text-sm text-zinc-500 dark:text-zinc-400">
					You can use the same accelerometer for both axes. If you don't plan on using an accelerometer, you can skip
					this and come back later if you change your mind.
				</p>
			</div>
			<div className="mt-4 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-700 sm:grid-cols-2">
				<div>
					<DropdownWithPrinterQuery
						vars={{ toolOrAxis: toolhead.getTool(), config: {} }}
						serializedPrinterConfiguration="config"
						label="X axis accelerometer"
						query="xAccelerometerOptions"
						onSelect={setSelectedXAccelerometer}
						value={selectedXAccelerometer}
						sort={false}
					/>
				</div>
				<div>
					<DropdownWithPrinterQuery
						vars={{ toolOrAxis: toolhead.getTool(), config: {} }}
						serializedPrinterConfiguration="config"
						label="Y axis accelerometer"
						query="yAccelerometerOptions"
						onSelect={setSelectedYAccelerometer}
						value={selectedYAccelerometer}
						sort={false}
					/>
				</div>
			</div>
		</div>
	);
};
