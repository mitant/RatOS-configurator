import { z } from 'zod';
import { Driver } from '../zods/hardware';

export const Drivers: z.infer<typeof Driver>[] = [
	{
		id: 'BTT-TMC2209-13',
		title: 'BTT TMC2209 v1.3',
		type: 'TMC2209',
		protocol: 'UART',
		senseResistor: 0.11,
		coolingCurrentThreshold: 1.1,
		voltages: [24],
		maxCurrent: 2.0,
	},
	{
		id: 'BTT-TMC2226-10',
		title: 'BTT TMC2226 v1.0',
		type: 'TMC2226',
		protocol: 'UART',
		senseResistor: 0.11,
		coolingCurrentThreshold: 1.1,
		voltages: [24],
		maxCurrent: 2.0,
	},
	{
		id: 'BTT-TMC5160-PRO-11',
		title: 'BTT TMC5160 Pro v1.1',
		type: 'TMC5160',
		protocol: 'SPI',
		senseResistor: 0.075,
		voltages: [24, 36, 48, 56],
		maxCurrent: 3,
		coolingCurrentThreshold: 1.5,
	},
	{
		id: 'BTT-TMC5160T-PLUS-10',
		title: 'BTT TMC5160T Plus v1.0',
		type: 'TMC5160',
		protocol: 'SPI',
		senseResistor: 0.022,
		voltages: [24, 36, 48, 56, 60],
		maxCurrent: 10.6,
		coolingCurrentThreshold: 3,
		external: true,
	},
	{
		id: 'BTT-EZ2209',
		title: 'BTT EZ2209',
		type: 'TMC2209',
		protocol: 'UART',
		senseResistor: 0.11,
		coolingCurrentThreshold: 1.3,
		voltages: [24],
		maxCurrent: 2.0,
	},
	{
		id: 'BTT-EZ2226',
		title: 'BTT EZ2226',
		type: 'TMC2226',
		protocol: 'UART',
		senseResistor: 0.11,
		coolingCurrentThreshold: 1.3,
		voltages: [24],
		maxCurrent: 2.0,
	},
	{
		id: 'BTT-EZ2130',
		title: 'BTT EZ2130',
		type: 'TMC2130',
		protocol: 'SPI',
		senseResistor: 0.11,
		coolingCurrentThreshold: 0.9,
		voltages: [24],
		maxCurrent: 2.0,
	},
	{
		id: 'BTT-EZ5160-PRO',
		title: 'BTT EZ5160 Pro',
		type: 'TMC5160',
		protocol: 'SPI',
		senseResistor: 0.075,
		coolingCurrentThreshold: 1.6,
		voltages: [24, 36, 48],
		maxCurrent: 2.5,
	},
	{
		id: 'BTT-EZ5160-RGB',
		title: 'BTT EZ5160 RGB',
		type: 'TMC5160',
		protocol: 'SPI',
		senseResistor: 0.05,
		coolingCurrentThreshold: 3,
		voltages: [24, 48, 36, 56],
		maxCurrent: 4.7,
	},
	{
		id: 'MELLOW-FLY-HV-TMC5160-PRO-12',
		title: 'Mellow FLY HV TMC5160 Pro v1.2',
		type: 'TMC5160',
		protocol: 'SPI',
		senseResistor: 0.033,
		coolingCurrentThreshold: 3,
		voltages: [24, 36, 48],
		maxCurrent: 4.25,
		external: true,
	},
	{
		id: 'PRUSA-EINSY-RAMBO-TMC2130',
		title: 'Prusa Einsy Rambo TMC2130',
		type: 'TMC2130',
		protocol: 'SPI',
		senseResistor: 0.22,
		coolingCurrentThreshold: 0.9,
		voltages: [24],
		maxCurrent: 2.0,
	},
];
