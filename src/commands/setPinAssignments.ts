import * as vscode from "vscode";
import { TclScript } from "../tcl-utils/TclScript";
import { QuartusProject } from "../quartus/QuartusProject";
import { PATHS, FILE_TYPES } from "../constants";
import { PinAssignment, Pin } from "../quartus/PinAssignment";

export function getCommand() {
  return async () => {
    const project = await QuartusProject.import();

    if (!project) {
      vscode.window.showErrorMessage(
        "No project found. Please create a project first."
      );
      return;
    }

    const CSVfilename = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: {
            "CSV Files": ["csv"],
        },
        });

    if (!CSVfilename) {
        return;
    }
    
    const pinAssignment = await PinAssignment.fromCSV(CSVfilename[0].fsPath);

    if (!pinAssignment) {
        vscode.window.showErrorMessage("Invalid pin assignment file.");
        return;
    }

    const script = new TclScript(
      "set_top_level_module.tcl",
      vscode.Uri.joinPath(project.directory, PATHS.VSQUARTUS_DIR)
    );

    script.addCommand("project_open " + project.projectName);
    
    pinAssignment.pins.forEach((pin: Pin) => {
        script.addCommand(`set_location_assignment ${pin.location} -to ${pin.name}`);
        script.addCommand(`set_instance_assignment -name IO_STANDARD "${pin.IOStandard}" -to ${pin.name}`);
        // script.addCommand(`set_instance_assignment -name IO_BANK ${pin.IOBank} -to ${pin.name}`);
        // script.addCommand(`set_instance_assignment -name VREF_GROUP "${pin.VrefGroup}" -to ${pin.name}`);
    });




    script.addCommand("project_close");

    await script.execute();

    // script.delete();

    vscode.commands.executeCommand("quartus-design-files.refresh");
  };
}
