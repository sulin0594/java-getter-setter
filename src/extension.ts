'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.generateGetterAndSetters', () => {

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        let selection = editor.selection;
        let start = selection.start.line;
        let end = selection.end.line;

        var text = editor.document.getText(selection);
        if (text.length < 1) {
            vscode.window.showErrorMessage('No selected properties.');
            return;
        }

        let getterAndSetter = '';
        for (let i = start; i < end + 1; i++) {
            let lineText = editor.document.lineAt(i).text;
            if (lineText) {
                getterAndSetter += createGetterAndSetter(lineText);
            }
        }
        editor.edit(edit => edit.insert(new vscode.Position(end + 1, 0), getterAndSetter));
        // vscode.window.showInformationMessage('Hello World');
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function toPascalCase(str: String) {
    return str.replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

function createGetterAndSetter(p: String) {
    while (p.startsWith(" ")) {
        p = p.substr(1);
    }
    while (p.endsWith(";")) {
        p = p.substr(0, p.length - 1);
    }

    let words = p.split(" ").map(x => x.replace('\r\n', '')).filter((x) => {
        return !(x === 'static' || x === 'final' || x === 'volatile' || x === 'transient' || x === 'public' || x === 'private' || x === 'protected');
    });

    let type = words[0];
    let attribute = words[1];
    let Attribute = toPascalCase(words[1]);

    if (type && Attribute) {
        return `
\tpublic ${type} get${Attribute}() {
\t\treturn this.${attribute};
\t}

\tpublic void ${type === "Boolean" || type === "boolean" ? "is" : "set"}${Attribute}(${type} ${attribute}) {
\t\tthis.${attribute} = ${attribute};
\t}
`;
    }
    return "";
}