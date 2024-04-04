// Generated by ts-to-zod (https://www.npmjs.com/package/ts-to-zod)
import { z } from 'zod';

export const aDXL345SensorNameSchema = z.union([
	z.literal('toolboard_t0'),
	z.literal('toolboard_t1'),
	z.literal('controlboard'),
	z.literal('rpi'),
]);

export const aDXL345ResponseHeaderSchema = z.union([
	z.literal('time'),
	z.literal('x_acceleration'),
	z.literal('y_acceleration'),
	z.literal('z_acceleration'),
]);

export const klipperADXL345SubscriptionResponseSchema = z.object({
	header: z.tuple([
		aDXL345ResponseHeaderSchema,
		aDXL345ResponseHeaderSchema,
		aDXL345ResponseHeaderSchema,
		aDXL345ResponseHeaderSchema,
	]),
});

export const klipperADXL345SubscriptionDataSchema = z.object({
	data: z.array(z.tuple([z.number(), z.number(), z.number(), z.number()])),
	overflows: z.number().optional(),
});

export const psdSchema = z.object({
	frequencies: z.array(z.number()),
	estimates: z.array(z.number()),
	powerRange: z.object({
		max: z.number(),
		min: z.number(),
	}),
});

export const accumulatedPSDSchema = z.object({
	x: psdSchema,
	y: psdSchema,
	z: psdSchema,
	total: psdSchema,
	source: z.object({
		x: z.array(psdSchema),
		y: z.array(psdSchema),
		z: z.array(psdSchema),
		total: z.array(psdSchema),
	}),
});

// Macro data structure
export const macroIDSchema = z.string().brand('MacroID');

export const macroSequenceIDSchema = z.string().brand('MacroSequenceID');

export const macroRecordingIdSchema = z.string().brand('MacroRecordingID');

export const macroRecordingRunIdSchema = z.string().brand('MacroRecordingRunID');

export const macroRecordingSettingsSchema = z
	.object({
		capturePSD: z.boolean().default(false),
		accelerometer: aDXL345SensorNameSchema.optional(),
		color: z.string().optional(),
	})
	.superRefine((val, ctx) => {
		if (val.capturePSD && val.accelerometer == null) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Required when recording resonance data',
				path: ['accelerometer'],
			});
		}
		return val;
	});

export const macroRecordingSchema = z.object({
	id: macroRecordingIdSchema,
	macroRecordingRunId: macroRecordingRunIdSchema,
	macroId: macroIDSchema,
	sequenceId: macroSequenceIDSchema,
	startTimeStamp: z.number(),
	endTimeStamp: z.number(),
	accelerometer: aDXL345SensorNameSchema,
	recordingHardwareName: z.string(),
	psd: accumulatedPSDSchema,
	name: z.string(),
});

export const macroRecordingSchemaWithoutSourcePSDs = macroRecordingSchema.extend({
	psd: accumulatedPSDSchema.omit({ source: true }),
});

export const macroSequenceSchema = z.object({
	id: macroSequenceIDSchema,
	name: z.string(),
	recording: macroRecordingSettingsSchema.nullable(),
	gcode: z.string().min(2),
});

export const macroSchema = z.object({
	id: macroIDSchema,
	name: z.string(),
	description: z.string(),
	createdAtTimeStamp: z.number(),
	updatedAtTimeStamp: z.number().nullable(),
	recordingCount: z.record(macroSequenceIDSchema, z.number()),
	sequences: z.array(macroSequenceSchema),
});

export const createMacroSchema = macroSchema.omit({
	recordingCount: true,
	createdAtTimeStamp: true,
	updatedAtTimeStamp: true,
});

// inferred types:
export type ADXL345SensorName = z.infer<typeof aDXL345SensorNameSchema>;

export type ADXL345ResponseHeader = z.infer<typeof aDXL345ResponseHeaderSchema>;

export type KlipperADXL345SubscriptionResponse = z.infer<typeof klipperADXL345SubscriptionResponseSchema>;

export type KlipperADXL345SubscriptionData = z.infer<typeof klipperADXL345SubscriptionDataSchema>;

export type PSD = z.infer<typeof psdSchema>;

export type AccumulatedPSD = z.infer<typeof accumulatedPSDSchema>;

export type MacroID = z.infer<typeof macroIDSchema>;

export type MacroRecordingSettings = z.infer<typeof macroRecordingSettingsSchema>;

export type MacroRecording = z.infer<typeof macroRecordingSchema>;

export type MacroRecordingWithoutSourcePSDs = z.infer<typeof macroRecordingSchemaWithoutSourcePSDs>;

export type MacroSequence = z.infer<typeof macroSequenceSchema>;

export type Macro = z.infer<typeof macroSchema>;
