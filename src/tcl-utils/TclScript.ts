import * as vscode from 'vscode';
import * as fs from 'fs';
import { exec } from 'child_process';

export class TclScript {
    fileName: string;
    directory: vscode.Uri;
    scriptContents: string[] = [];


    constructor(fileName: string, directory: vscode.Uri) {
        this.fileName = fileName;
        this.directory = directory;

        
        // Make new tcl file in tcl-scripts
        vscode.workspace.fs.writeFile(vscode.Uri.joinPath(directory,  'tcl-scripts', fileName), new Uint8Array(0));
        console.log('TclScript created');
    }

    addCommand(command: string) {
        this.scriptContents.push(command);
    }

    async execute(): Promise<string> {
        await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(this.directory, 'tcl-scripts', this.fileName), Buffer.from(this.scriptContents.join('\n')));

        // Execute the tcl script
        // console.log('cd ' + this.directory.fsPath + '\\..\\ && ' + 'quartus_sh -t .\\.vsquartus\\tcl-scripts\\' + this.fileName);
        const stdout = exec('cd ' + this.directory.fsPath + '\\..\\ && ' + 'quartus_sh -t .\\.vsquartus\\tcl-scripts\\' + this.fileName).stdout;
        
        if (!stdout) {
            console.log('stdout is null');
            return '';
        }
        
        // Copilot Jargon soz
        const output = await new Promise<string>((resolve, reject) => {
            let output = '';
            stdout.on('data', (data) => {
                output += data;
            });

            stdout.on('end', () => {
                resolve(output);
            });
        });

        return output;
    }

    delete() {
        vscode.workspace.fs.delete(vscode.Uri.joinPath(this.directory, 'tcl-scripts', this.fileName));
    }



}