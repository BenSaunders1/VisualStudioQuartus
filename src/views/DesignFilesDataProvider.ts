import * as vscode from "vscode";
import { getProjectFiles } from "../quartus/getProjectFiles";
import path from "path";

export class DesignFilesDataProvider implements vscode.TreeDataProvider<DesignFile> {
    private _onDidChangeTreeData: vscode.EventEmitter<DesignFile | undefined | void> = new vscode.EventEmitter<
        DesignFile | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<DesignFile | undefined | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: DesignFile): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DesignFile): Thenable<DesignFile[]> {
        if (!element) {
            const verilogNode = new DesignFile("Verilog [.v]", vscode.TreeItemCollapsibleState.Collapsed);
            const vhdlNode = new DesignFile("VHDL [.vhdl]", vscode.TreeItemCollapsibleState.Collapsed);

            return Promise.resolve([
                verilogNode,
                vhdlNode,
            ]);
        }

        const projectFiles = getProjectFiles();

        if (element.label === "Verilog [.v]") {
            const designFileNodes = projectFiles.then((files) => {
                if (!files) {
                    return [];
                }
                return files
                    .filter((file) => file.endsWith(".v"))
                    .map((file) => {
                        const designFile = new DesignFile(file, vscode.TreeItemCollapsibleState.None);
                        designFile.iconPath = path.join(__filename, "..", "..", "resources", "verilog.svg");
                        return designFile;
                    });
            });
            return designFileNodes;
        } else if (element.label === "VHDL [.vhdl]") {
            const designFileNodes = projectFiles.then((files) => {
                if (!files) {
                    return [];
                }
                return files
                    .filter((file) => file.endsWith(".vhdl"))
                    .map((file) => {
                        const designFile = new DesignFile(file, vscode.TreeItemCollapsibleState.None);
                        designFile.iconPath = path.join(__filename, "..", "..", "resources", "verilog.svg");
                        return designFile;
                    });

            });
            return designFileNodes;
        }

        return Promise.resolve([]);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class DesignFile extends vscode.TreeItem {
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }
}
