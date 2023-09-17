import { z } from 'zod';

export const Board = z.object({
	serialPath: z.string(),
	isToolboard: z.boolean().optional(),
	isHost: z.boolean().optional(),
	name: z.string(),
	manufacturer: z.string(),
	firmwareBinaryName: z.string(),
	compileScript: z.string(),
	flashScript: z.string().optional(),
	flashInstructions: z.string().optional(),
	disableAutoFlash: z.boolean().optional(),
	documentationLink: z.string().optional(),
	dfu: z
		.object({
			dfuBootImage: z.string(),
			flashDevice: z.string(),
			instructions: z.array(z.string()),
			reminder: z.string().optional(),
		})
		.optional(),
	path: z.string(),
});

export const BoardWithDetectionStatus = Board.extend({
	detected: z.boolean(),
});

export const AutoFlashableBoard = z.object({
	serialPath: z.string(),
	isToolboard: z.boolean().optional(),
	compileScript: z.string(),
	flashScript: z.string(),
	path: z.string(),
});

export const Toolboard = Board.extend({
	isToolboard: z.literal(true),
	isHost: z.literal(false).optional(),
});

export type Board = z.infer<typeof Board>;
export type BoardWithDetectionStatus = z.infer<typeof BoardWithDetectionStatus>;
export type Toolboard = z.infer<typeof Toolboard>;
export type AutoFlashableBoard = z.infer<typeof AutoFlashableBoard>;
