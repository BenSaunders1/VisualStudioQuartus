import * as vscode from 'vscode';
import { QuartusProject } from './QuartusProject';



export function getCommand() {
    return async () => {
        const options: vscode.OpenDialogOptions = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Open Folder'
        };

        const folderUri = await vscode.window.showOpenDialog(options);
        if (folderUri && folderUri.length > 0) {
            console.log(folderUri[0]);
            vscode.commands.executeCommand('vscode.openFolder', folderUri[0]);
        }

        vscode.window.showInformationMessage('Quartus: Making new project. Please fill in the required prompts to get started.');

        const selectedProjectName = await vscode.window.showInputBox({
            placeHolder: 'Enter the name of the project',
            prompt: 'This is the name of the project that will be created (You must not use spaces in the project title)',
            validateInput: QuartusProject.checkProjectName
        }) ?? '';

        const selectedDeviceFamily = await vscode.window.showQuickPick(QuartusProject.getDeviceFamilyList(), {
            placeHolder: 'Select the device family'
        }) ?? '';
            
        const selectedPartNumber = await vscode.window.showQuickPick(QuartusProject.getPartNumberList(selectedDeviceFamily), {
            placeHolder: 'Select the part number'
        }) ?? '';

        const project = new QuartusProject(selectedDeviceFamily, selectedPartNumber, selectedProjectName);
        await project.init();

    };
}