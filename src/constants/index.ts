export const ERRORS = {
  NO_WORKSPACE: "No workspace folder is open",
  INVALID_DEVICE_FAMILY: "Device family is not supported",
  INVALID_PART_NUMBER: "Invalid part number for the chosen device family",
  EMPTY_PROJECT_NAME: "Project name must not be empty",
  SPACES_PROJECT_NAME: "Project name must not contain spaces",
  INVALID_PROJECT_NAME:
    "Project name must only contain alphanumeric characters",
  EMPTY_FILE_NAME: "File name must not be empty",
  SPACES_FILE_NAME: "File name must not contain spaces",
  INVALID_FILE_NAME: "File name must only contain alphanumeric characters",
  INVALID_FILE_EXTENSION:
    "File name must have a valid file extension: .v, .vhdl, .vhd",
};

export const PATHS = {
  VSQUARTUS_DIR: ".vsquartus",
  CONFIG_FILE: "config.json",
  TCL_SCRIPTS_DIR: "tcl-scripts",
};

export const FILE_TYPES = {
  VERILOG: "VERILOG_FILE",
  VHDL: "VHDL_FILE",
};

export const INFO_MESSAGES = {
  NEW_PROJECT:
    "Quartus: Making new project. Please fill in the required prompts to get started.",
};

export const SUPPORTED_FILE_EXTENSIONS = [".v", ".vhdl", ".vhd"];

export const DEBUG = true;

export const SUPPORTED_DEVICES = [
  { name: "MAX10", part_numbers: ["10M50DAF484C7G"] },
];
