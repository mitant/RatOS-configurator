import { KlipperConfigUtils } from '../../helpers/klipper-config';
import { PrinterAxis } from '../../zods/motion';
import { PrinterConfiguration } from '../../zods/printer-configuration';
export const sensorlessXTemplate = (config: PrinterConfiguration, utils: KlipperConfigUtils) => `
# Sensorless homing.
#
# Tune the sensorless_x_current variable and the SGTHRS/SGT value in this file untill you get reliable homing.
# Beware of false instant triggering which can make it look like the homing procedure is skipping an axis, when in fact it's not.
# This is especially true for the Y axis on CoreXY machines.
#
# Read the klipper documentation for more info: https://www.klipper3d.org/TMC_Drivers.html#sensorless-homing
#
# Note: if your board has diag jumpers, you would need to insert them for the specific drivers you want to use for sensorless homing on.
# Note: Sensorless homing does NOT work if you drivers have a missing DIAG pins.
    
# Check https://www.klipper3d.org/TMC_Drivers.html#sensorless-homing for tuning instructions.
[${utils.getAxisDriverSectionName(PrinterAxis.x)}]
diag_pin: ^x_diag_pin
${utils.getAxisDriverStallGuardThreshold(PrinterAxis.x, 0.5)}

[${utils.getAxisStepperName(PrinterAxis.x)}]
endstop_pin: ${utils.getAxisVirtualEndstop(PrinterAxis.x)}
position_min: 0
position_endstop: 0
homing_retract_dist: 0

[gcode_macro RatOS]
variable_homing_x: "sensorless"
variable_sensorless_x_current: ${utils.getAxisDriverHomingCurrent(PrinterAxis.x, 0.35)}
variable_driver_type_x: "${utils.getAxisDriverType(PrinterAxis.x)}"
`;

export const sensorlessYTemplate = (config: PrinterConfiguration, utils: KlipperConfigUtils) => `
# Sensorless homing.
#
# Tune the current variable and the SGTHRS value in the included file(s) untill you get reliable homing.
# Beware of false instant triggering which can make it look like the homing procedure is skipping an axis, when in fact it's not.
# This is especially true for the Y axis on CoreXY machines.
#
# Read the klipper documentation for more info: https://www.klipper3d.org/TMC_Drivers.html#sensorless-homing
#
# Note: if your board has diag jumpers, you would need to insert them for the specific drivers you want to use for sensorless homing on.
# Note: Sensorless homing does NOT work if you drivers have a missing DIAG pins.

# Check https://www.klipper3d.org/TMC_Drivers.html#sensorless-homing for tuning instructions.

# Check https://www.klipper3d.org/TMC_Drivers.html#sensorless-homing for tuning instructions.
[${utils.getAxisDriverSectionName(PrinterAxis.y)}]
diag_pin: ^y_diag_pin
${utils.getAxisDriverStallGuardThreshold(PrinterAxis.y, 0.5)}

[stepper_y]
endstop_pin: ${utils.getAxisVirtualEndstop(PrinterAxis.y)}
position_min: 0
position_endstop: 0
homing_retract_dist: 0

[gcode_macro RatOS]
variable_homing_y: "sensorless"
variable_sensorless_y_current: ${utils.getAxisDriverHomingCurrent(PrinterAxis.y, 0.51)}
variable_driver_type_y: "${utils.getAxisDriverType(PrinterAxis.y)}"
`;
