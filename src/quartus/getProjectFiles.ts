import * as vscode from 'vscode';
import { TclScript } from '../tcl-utils/TclScript';
import { QuartusProject } from './QuartusProject';

export function getCommand() {
    return async () => {
        console.log("Getting project files");
        const project = await QuartusProject.import();

        if (!project) {
            vscode.window.showErrorMessage('No project found. Please create a project first.');
            return;
        }

        console.log(project);

        const script = new TclScript('get_project_files.tcl', vscode.Uri.joinPath(project.directory, '.vsquartus'));
        
        script.addCommand('project_open ' + project.projectName);
        script.addCommand('set file_list [get_all_files]');
        script.addCommand('foreach file $file_list { puts $file }');
        script.addCommand('project_close');

        console.log(script.scriptContents);

        const outputFiles = await script.execute();

        // script.delete();
        
        console.log(outputFiles);

        // TODO: Handle nofiles

        // TODO: Handle getting filenames

    };
} 