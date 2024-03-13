import { KlipperConfigHelper } from '../server/helpers/klipper-config';
import { PrinterConfiguration } from '../zods/printer-configuration';
export const template = (config: PrinterConfiguration, helper: KlipperConfigHelper) => `
# WARNING. THIS FILE IS GENERATED BY THE RATOS CONFIGURATOR.
# CHANGES YOU MAKE HERE WILL BE OVERWRITTEN. KEEP YOUR CHANGES IN PRINTER.CFG.
# Config generated for ${config.printer.manufacturer} ${config.printer.name} ${config.size.x}
# Documentation: https://os.ratrig.com

#############################################################################################################
### CONTROLBOARD & TOOLBOARD
#############################################################################################################
${helper.renderBoards()}

#############################################################################################################
### BASE SETUP
#############################################################################################################
${helper.renderBase()}
[include RatOS/printers/caramba-idex/caramba.cfg]
[include RatOS/printers/caramba-idex/macros.cfg]
[include RatOS/printers/caramba-idex/${config.size.x}.cfg]

# Extruder
${helper.renderExtruder()}

# Hotend
${helper.renderHotend()}

# ADXL345 resonance testing configuration
${helper.renderInputShaper(config.size)}

#############################################################################################################
### STEPPER MOTORS, DRIVERS & SPEED LIMITS
#############################################################################################################
${helper.renderMotorSections()}
${helper.renderSpeedLimits()}

[bed_mesh]
speed: ${helper.getMacroTravelSpeed()}

[z_tilt]
speed: ${helper.getMacroTravelSpeed()}


#############################################################################################################
### HOMING
#############################################################################################################
${helper.renderProbeIncludes()}
${helper.renderEndstopSection()}


#############################################################################################################
### FANS
#############################################################################################################
${helper.renderFans()}

#############################################################################################################
### MACRO CONFIGURATION
#############################################################################################################
${helper.renderMacros()}

# Macro variable overrides
[gcode_macro RatOS]
${helper.renderMacroVariableOverrides()}
variable_home_y_first: True

# Save variables
${helper.renderSaveVariables({
	xcontrolpoint: config.size.x / 2 - 37,
	ycontrolpoint: config.size.y + 32,
	zcontrolpoint: 10,
	zoffsetcontrolpoint: 0,
})}
`;

export const initialPrinterCfg = (config: PrinterConfiguration, helper: KlipperConfigHelper) => `
#############################################################################################################
### CONFIGURATION GENERATED BY THE RATOS CONFIGURATOR
#############################################################################################################
[include RatOS.cfg]

#############################################################################################################
### MACRO CONFIGURATION
### Configure the behavior of RatOS macros
### See: https://os.ratrig.com/docs/configuration/macros
#############################################################################################################
[gcode_macro RatOS]
variable_relative_extrusion: True
variable_preheat_extruder: True
variable_calibrate_bed_mesh: True
variable_nozzle_priming: "primeblob"
variable_start_print_park_in: "back"
variable_start_print_park_z_height: 50
variable_end_print_park_in: "back"
variable_pause_print_park_in: "back"
${helper.renderUserMacroVariableOverrides()}

#############################################################################################################
### USER OVERRIDES & CUSTOM CONFIGURATION
### Anything custom you want to add, or RatOS configuration you want to override, do it here.
### This section is pre-populated with the most common settings you may want to change.
### See: https://os.ratrig.com/docs/configuration/includes-and-overrides
###
### It is recommended that you follow these steps to properly calibrate your printer:
### 0) Sanity check and PID Tuning: https://www.klipper3d.org/Config_checks.html
### 1) Z-offset calibration: https://www.klipper3d.org/Probe_Calibrate.html#calibrating-probe-z-offset
###    BEACON NOTE: Follow along from step 6 in the official beacon guide instead
###    https://docs.beacon3d.com/quickstart/#6-calibrate-beacon
### 2) Pressure Advance: https://www.klipper3d.org/Pressure_Advance.html
### 3) Skew Correction: https://www.klipper3d.org/Skew_Correction.html
### 4) Resonance Compensation: https://www.klipper3d.org/Resonance_Compensation.html
### RatOS has dedicated macro's to generate shaper graphs for deeper analysis (requires accelerometer).
### Use MEASURE_COREXY_BELT_TENSION to compare tension between belts, and use
### GENERATE_SHAPER_GRAPHS to generate the resonance graphs for analysing and manually entering input shaper
### configuration.
### You can run SHAPER_CALIBRATE to automatically calibrate your input shaper configuration, if you just want
### to get started.
### Read more about klipper here: https://www.klipper3d.org/Overview.html
#############################################################################################################

${helper.renderUserStepperSections({
	x: {
		directionInverted: false,
		rotationComment: '40 for 20 tooth 2GT pulleys, 32 for 16 tooth 2GT pulleys',
		limits: (margin) => ({
			min: 0 - margin.min,
			max: config.size.x,
			endstop: 0 - margin.min,
		}),
		additionalLines: [],
	},
	dual_carriage: {
		directionInverted: false,
		rotationComment: '40 for 20 tooth 2GT pulleys, 32 for 16 tooth 2GT pulleys',
		limits: (margin) => ({
			min: 0,
			max: config.size.x + margin.max,
			endstop: config.size.x + margin.max,
		}),
		safeDistance: 60,
	},
	y: {
		directionInverted: true,
		rotationComment: '40 for 20 tooth 2GT pulleys, 32 for 16 tooth 2GT pulleys',
		limits: (margin) => ({
			min: 0 - margin.min,
			max: config.size.y + margin.max,
			endstop: 0 - margin.min,
		}),
	},
	y1: {
		directionInverted: false,
		rotationComment: '40 for 20 tooth 2GT pulleys, 32 for 16 tooth 2GT pulleys',
	},
	z: {
		directionInverted: true,
		rotationComment: '4 for TR8*4 lead screws',
		limits: {
			min: 0,
			max: config.size.z,
		},
	},
	z1: {
		directionInverted: true,
		rotationComment: '4 for TR8*4 lead screws',
	},
	z2: {
		directionInverted: true,
		rotationComment: '4 for TR8*4 lead screws',
	},
	extruder: {
		directionInverted: true,
		additionalLines: [
			'#pressure_advance: 0.05 # Check https://www.klipper3d.org/Pressure_Advance.html for pressure advance tuning.',
			'control: pid',
			'pid_kp: 28.413',
			'pid_ki: 1.334',
			'pid_kd: 151.300',
		],
	},
	extruder1: {
		directionInverted: true,
		additionalLines: [
			'#pressure_advance: 0.05 # Check https://www.klipper3d.org/Pressure_Advance.html for pressure advance tuning.',
			'control: pid',
			'pid_kp: 28.413',
			'pid_ki: 1.334',
			'pid_kd: 151.300',
		],
	},
})}

[heater_bed]
control: pid
pid_Kp: 22.2
pid_Ki: 1.08
pid_Kd: 114

${helper.renderProbePinSection()}

${helper.renderReminders()}
`;
