import * as vscode from "vscode";

export class DesignFilesDataProvider implements vscode.TreeDataProvider<DesignFile> {
    private _onDidChangeTreeData: vscode.EventEmitter<DesignFile | undefined | void> = new vscode.EventEmitter<DesignFile | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<DesignFile | undefined | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: DesignFile): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DesignFile): Thenable<DesignFile[]> {
        if (!element){
            return Promise.resolve([
                new DesignFile("Verilog [.v]", vscode.TreeItemCollapsibleState.Collapsed),
                new DesignFile("VHDL [.vhdl]", vscode.TreeItemCollapsibleState.Collapsed),
            ]);
        }

        if (element.label === "Verilog [.v]") {
            return Promise.resolve([
                new DesignFile("top.v", vscode.TreeItemCollapsibleState.None),
                new DesignFile("module.v", vscode.TreeItemCollapsibleState.None),
                new DesignFile("shit.v", vscode.TreeItemCollapsibleState.None),
                new DesignFile("fuck.v", vscode.TreeItemCollapsibleState.None),
                new DesignFile("cum.v", vscode.TreeItemCollapsibleState.None),
                new DesignFile("doodle.v", vscode.TreeItemCollapsibleState.None),
            ]);
        } else {
            return Promise.resolve([
                new DesignFile("who.vhdl", vscode.TreeItemCollapsibleState.None),
                new DesignFile("the.vhdl", vscode.TreeItemCollapsibleState.None),
                new DesignFile("fuck.vhdl", vscode.TreeItemCollapsibleState.None),
                new DesignFile("uses.vhdl", vscode.TreeItemCollapsibleState.None),
                new DesignFile("VHDL.vhdl", vscode.TreeItemCollapsibleState.None),
            ]);
        }
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
