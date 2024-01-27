import * as vscode from 'vscode';


async function getFilesWithTodo(panel: vscode.WebviewPanel, htmlContent: string) {
	const files = await vscode.workspace.findFiles('src/**/**.ts', 'src/**/**.spec.ts' );
	const todosByFile: { [key: string]: number } = {};
	for (const file of files) {
		const documents = vscode.workspace.openTextDocument(file);
		const document = await documents;
		const text = document.getText();
		const todoMatches = text.match(/\/\/\s*TODO:/gi);
		if (todoMatches && todoMatches.length > 0) {
			todosByFile[file.fsPath] = todoMatches.length;
		}

	}
	// Construir el contenido HTML para la vista web
	for (const filePath in todosByFile) {
		const todoCount = todosByFile[filePath];
		const arrayFiles = filePath.split('\\');
		const name = arrayFiles[arrayFiles.length-1];
		htmlContent += `<p>${name}: ${todoCount} TODOs</p>`;
	}

	// Establecer el contenido HTML en la vista web
	panel.webview.html = htmlContent;
}


export async function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "todo-trello" is now active!');

	// Create Web Panel
	const panel = vscode.window.createWebviewPanel(
		'todo-pending',
		'TODO PENDING',
		vscode.ViewColumn.One,
		{
			
		}
	);
	let htmlContent = '<h1>TODO Finder Results</h1>';
	panel.webview.html = htmlContent;

	let disposable = vscode.commands.registerCommand('todo-trello.helloWorld', async () => {
		getFilesWithTodo(panel, htmlContent);
	});

	vscode.window.onDidChangeActiveTextEditor((event) => {
		console.log(event);
		vscode.commands.executeCommand('todo-trello.helloWorld');
	});
	vscode.workspace.onDidChangeTextDocument((event) => {
        // Verificar si el cambio ocurrió en un archivo de código
        if (event.document.languageId === 'typescript' || event.document.languageId === 'javascript') {
            // Ejecutar el comando cada vez que el código se actualiza
			vscode.commands.executeCommand('todo-trello.helloWorld');
        }
    });

	context.subscriptions.push(disposable);

	
}

// This method is called when your extension is deactivated
export function deactivate() {}
