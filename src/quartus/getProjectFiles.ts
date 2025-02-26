import * as vscode from 'vscode';
import { TclScript } from '../tcl-utils/TclScript';
import { QuartusProject } from './QuartusProject';

export async function getProjectFiles() {
        console.log("Getting project files");
        const project = await QuartusProject.import();

        if (!project) {
            vscode.window.showErrorMessage('No project found. Please create a project first.');
            return;
        }

        const script = new TclScript('get_project_files.tcl', vscode.Uri.joinPath(project.directory, '.vsquartus'));
        
        script.addCommand('project_open ' + project.projectName);
        script.addCommand('set file_list_v [get_all_global_assignments -name VERILOG_FILE]');
        script.addCommand('foreach_in_collection file $file_list_v { puts [lindex $file 2] }');
        script.addCommand('set file_list_vhdl [get_all_global_assignments -name VHDL_FILE]');
        script.addCommand('foreach_in_collection file $file_list_vhdl { puts [lindex $file 2] }');
        script.addCommand('project_close');

        const outputFiles = await script.execute();

        script.delete();
        
        // Strip all lines of their spaces at the beginnig, and that start with "Info" or "Error"
        const files = outputFiles.split('\n').map((line) => line.trim()).filter((line) => !line.startsWith('Info') && !line.startsWith('Error'));

        // console.log(files);

        // Return all but the last list element (empty)
        return files.slice(0, -1);
    };
