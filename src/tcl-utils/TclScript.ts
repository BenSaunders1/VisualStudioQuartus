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

    async execute(): Promise<void> {
        await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(this.directory, 'tcl-scripts', this.fileName), Buffer.from(this.scriptContents.join('\n')));

        // Execute the tcl script
        // console.log('cd ' + this.directory.fsPath + '\\..\\ && ' + 'quartus_sh -t .\\.vsquartus\\tcl-scripts\\' + this.fileName);
        return new Promise((resolve, reject) => {
            exec('cd ' + this.directory.fsPath + '\\..\\ && ' + 'quartus_sh -t .\\.vsquartus\\tcl-scripts\\' + this.fileName, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                console.log(stdout);
                resolve();
            });
        });
    }

    delete() {
        fs.unlinkSync(vscode.Uri.joinPath(this.directory, 'tcl-scripts', this.fileName).fsPath);
    }



}