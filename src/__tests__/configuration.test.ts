import { getPrinters, parseDirectory } from '../server/router/printer';
import { Extruder, Hotend, Probe, deserializePrinterRail } from '../zods/hardware';
import { getBoards } from '../server/router/mcu';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { serverSchema } from '../env/schema.mjs';
const environment = serverSchema.parse(process.env);
import { describe, expect, test } from 'vitest';
import { PartialPrinterConfiguration } from '../zods/printer-configuration';
import { xEndstopOptions, yEndstopOptions } from '../data/endstops';
import { serializePartialPrinterConfiguration } from '../hooks/usePrinterConfiguration';
import { Steppers } from '../data/steppers';

describe('configuration', async () => {
	const parsedHotends = await parseDirectory('hotends', Hotend);
	const parsedExtruders = await parseDirectory('extruders', Extruder);
	const parsedProbes = await parseDirectory('z-probe', Probe);
	const parsedBoards = await getBoards();
	const parsedPrinters = await getPrinters();
	test('has valid hotend configuration files', async () => {
		expect(parsedHotends.length).toBeGreaterThan(0);
	});
	test('has valid extruder configuration files', async () => {
		expect(parsedExtruders.length).toBeGreaterThan(0);
	});
	test('has valid z-probe configuration files', async () => {
		expect(parsedProbes.length).toBeGreaterThan(0);
	});
	test('has valid board configuration files', async () => {
		expect(parsedBoards.length).toBeGreaterThan(0);
	});
	const scripts = (await promisify(fs.readdir)(path.join(environment.RATOS_CONFIGURATION_PATH, 'scripts'))).filter(
		(f) => f.substring(f.length - 3) === '.sh',
	);
	test('has non zero bash scripts', async () => {
		expect(scripts.length).toBeGreaterThan(0);
	});
	describe('has executable bash scripts', async () => {
		test.each(scripts)('%s is executable', async (script) => {
			await promisify(fs.access)(path.join(environment.RATOS_CONFIGURATION_PATH, 'scripts', script), fs.constants.X_OK);
		});
	});
	describe('has valid board definitions', async () => {
		const rules: string[] = [];
		describe.each(parsedBoards)('$name', async (board) => {
			test('has executable scripts', async () => {
				const boardFiles = await promisify(fs.readdir)(`${board.path}`);
				const boardScripts = boardFiles.filter((f) => f.substring(f.length - 3) === '.sh');
				expect(boardScripts.length).toBeGreaterThan(0);
				await Promise.all(
					boardScripts.map(async (file) => {
						return await promisify(fs.access)(`${board.path}/${file}`, fs.constants.X_OK);
					}),
				);
			});
			test.skipIf(board.isHost)('has a valid single unique udev rule', async () => {
				const boardFiles = await promisify(fs.readdir)(`${board.path}`);
				const boardRules = boardFiles.filter((f) => f.substring(f.length - 6) === '.rules');
				expect(boardRules.length).toBe(1);
				expect(rules.filter((r) => r === boardRules[0]).length).toBe(0);
				rules.push(boardRules[0]);
				expect(fs.existsSync(`${board.path}/${boardRules[0]}`)).toBeTruthy();
				const ruleContents = await promisify(fs.readFile)(`${board.path}/${boardRules[0]}`, 'utf8');
				const firmwareConfig = path.join(board.path, 'firmware.config');
				expect(fs.existsSync(firmwareConfig)).toBeTruthy();
				const firmwareConfigContents = await promisify(fs.readFile)(firmwareConfig, 'utf8');
				if (firmwareConfigContents.includes(`CONFIG_MCU="atmega2560"`)) {
					// can't override serial numbers on atmega2560 boards. Don't look for it.
					return;
				}
				const attr = `ATTRS{serial}=="${board.serialPath.replace('/dev/', '')}"`;
				const symlink = `SYMLINK+="${board.serialPath.replace('/dev/', '')}"`;
				const devlink = `ENV{DEVLINKS}=="${board.serialPath}"`;
				expect(ruleContents.includes(attr)).toBeTruthy();
				expect(ruleContents.includes(symlink)).toBeTruthy();
				expect(ruleContents.includes(devlink)).toBeTruthy();
			});
			test('has config file', async () => {
				expect(
					fs.existsSync(path.join(board.path, board.isToolboard ? 'toolboard-config.cfg' : 'config.cfg')),
				).toBeTruthy();
			});
			test.skipIf(board.extruderlessConfig == null)('has extruderless config file', async () => {
				expect(fs.existsSync(path.join(board.path, board.extruderlessConfig ?? ''))).toBeTruthy();
			});
			test.skipIf(board.isHost)('has firmware config file with correct USB Serial number', async () => {
				const firmwareConfig = path.join(board.path, 'firmware.config');
				expect(fs.existsSync(firmwareConfig)).toBeTruthy();
				const firmwareConfigContents = await promisify(fs.readFile)(firmwareConfig, 'utf8');
				if (firmwareConfigContents.includes(`CONFIG_MCU="atmega2560"`)) {
					// can't override serial numbers on atmega2560 boards. Don't look for it.
					return;
				}
				expect(
					firmwareConfigContents.includes(`CONFIG_USB_SERIAL_NUMBER="${board.serialPath.replace('/dev/', '')}"`),
				).toBeTruthy();
			});
		});
	});
	const printerConfigs = parsedPrinters.filter((p) => p.defaults != null);
	test('has valid printer configuration files', async () => {
		expect(parsedPrinters.length).toBeGreaterThan(0);
	});
	describe.each(printerConfigs)('has valid $manufacturer $name definition', async (printer) => {
		test('has a valid image', async () => {
			expect(fs.existsSync(path.join(printer.path, printer.image))).toBeTruthy();
		});
		test('has an existing template file', async () => {
			expect(
				fs.existsSync(path.join(environment.RATOS_CONFIGURATION_PATH, 'templates', printer.template)),
			).toBeTruthy();
		});
		test('has valid defaults', async () => {
			const defaultBoard = parsedBoards.find((board) => board.serialPath === '/dev/' + printer.defaults?.board);
			const defaultHotend = parsedHotends.find((hotend) => hotend.id === printer.defaults?.hotend + '.cfg');
			const defaultExtruder = parsedExtruders.find((extruder) => extruder.id === printer.defaults?.extruder + '.cfg');
			const defaultProbe = parsedProbes.find((probe) => probe.id === printer.defaults?.probe + '.cfg');
			const defaultXEndstop = xEndstopOptions().find((option) => option.id === printer.defaults?.xEndstop);
			const defaultYEndstop = yEndstopOptions().find((option) => option.id === printer.defaults?.yEndstop);
			const defaultToolboard = parsedBoards.find((board) => board.serialPath === '/dev/' + printer.defaults?.toolboard);
			const defaultRails = printer.defaults?.rails?.map((r) => {
				return deserializePrinterRail(r);
			});
			const partialConfigResult = PartialPrinterConfiguration.safeParse({
				printer: printer,
				board: defaultBoard,
				hotend: defaultHotend,
				extruder: defaultExtruder,
				probe: defaultProbe,
				xEndstop: defaultXEndstop,
				yEndstop: defaultYEndstop,
				toolboard: defaultToolboard,
				rails: defaultRails,
			});
			const partialConfig =
				partialConfigResult.success && partialConfigResult.data != null
					? serializePartialPrinterConfiguration(partialConfigResult.data)
					: undefined;

			printer.defaults.board && expect(defaultBoard).not.toBeNull();

			printer.defaults.toolboard && expect(defaultToolboard).not.toBeNull();
			printer.defaults.hotend && expect(defaultHotend).not.toBeNull();
			printer.defaults.extruder && expect(defaultExtruder).not.toBeNull();
			printer.defaults.probe && expect(defaultProbe).not.toBeNull();
			printer.defaults.xEndstop &&
				expect(
					xEndstopOptions(partialConfig).find((option) => option.id === printer.defaults?.xEndstop),
				).not.toBeNull();
			printer.defaults.yEndstop &&
				expect(
					yEndstopOptions(partialConfig).find((option) => option.id === printer.defaults?.yEndstop),
				).not.toBeNull();
			printer.defaults.rails && expect(defaultRails?.length).toBeGreaterThan(0);
		});
	});
});
