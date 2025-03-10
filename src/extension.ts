import * as vscode from 'vscode';
import * as newProject from './commands/newProject';
import * as fs from 'fs';
import * as path from 'path';
import * as getProjectFiles from './commands/getProjectFiles';
import * as addProjectFiles from './commands/addProjectFiles';
import * as setPinAssignments from './commands/setPinAssignments';
import * as setTopLevel from './commands/setTopLevel';

import { DesignFilesDataProvider } from './views/DesignFilesDataProvider';

const commands: { alias: string, callback: (item: any) => void }[] = [
	{ alias: 'quartusextension.newProject', callback: newProject.getCommand() }, 
	{ alias: 'quartusextension.addProjectFiles', callback: addProjectFiles.getCommand() },
	{ alias: 'quartusextension.setTopLevel', callback: setTopLevel.getCommand() },
	{ alias: 'quartusextension.setPinAssignments', callback: setPinAssignments.getCommand() }
];


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const detectQuartusProject = (): boolean => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			return false;
		}

		const folderPath = workspaceFolders[0].uri.fsPath;
		const vsqPath = path.join(folderPath, '.vsquartus');
		console.log(vsqPath);
		return fs.existsSync(vsqPath);
	};

	
	vscode.commands.executeCommand('setContext', 'detectQuartusProject', detectQuartusProject());

	// Main-quartus view, adding a design files tree
	const myTreeDataProvider = new DesignFilesDataProvider();
	vscode.window.registerTreeDataProvider('quartus-design-files', myTreeDataProvider);
	vscode.commands.registerCommand('quartus-design-files.refresh', () => myTreeDataProvider.refresh());

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "quartusextension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('quartusextension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from QuartusExtension!');
	});

	context.subscriptions.push(disposable);

	for (const command of commands) {
		const disposable = vscode.commands.registerCommand(command.alias, command.callback);
		context.subscriptions.push(disposable);
	}


}

// This method is called when your extension is deactivated
export function deactivate() {}

