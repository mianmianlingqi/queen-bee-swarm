import * as vscode from 'vscode';
import { getQueenBeeMention, registerQueenBeeParticipant } from './queenBeeParticipant';

const EXTENSION_OUTPUT_CHANNEL = 'Queen Bee Swarm';

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel(EXTENSION_OUTPUT_CHANNEL);
  outputChannel.appendLine('Queen Bee Swarm activated.');
  registerQueenBeeParticipant(context, outputChannel);

  const askQueenBeeCommand = vscode.commands.registerCommand('queenBeeSwarm.askQueenBee', async () => {
    outputChannel.appendLine('Running command: queenBeeSwarm.askQueenBee');
    await openQueenBeeChat(outputChannel);
  });

  const openQueenBeeAgentFileCommand = vscode.commands.registerCommand('queenBeeSwarm.openQueenBeeAgentFile', async () => {
    outputChannel.appendLine('Running command: queenBeeSwarm.openQueenBeeAgentFile');
    await openQueenBeeAgentFile(context, outputChannel);
  });

  const showOverviewCommand = vscode.commands.registerCommand('queenBeeSwarm.showOverview', async () => {
    outputChannel.appendLine('Running command: queenBeeSwarm.showOverview');

    const action = await vscode.window.showInformationMessage(
      `Queen Bee Swarm is ready. You can configure the custom Queen Bee agent, use ${getQueenBeeMention()} in chat, open the README, or reveal the agents folder.`,
      'Open Queen Bee Agent File',
      'Ask Queen Bee',
      'Open README',
      'Reveal agents folder'
    );

    if (action === 'Open Queen Bee Agent File') {
      await openQueenBeeAgentFile(context, outputChannel);
      return;
    }

    if (action === 'Ask Queen Bee') {
      await openQueenBeeChat(outputChannel);
      return;
    }

    if (action === 'Open README') {
      await openReadme(context, outputChannel);
      return;
    }

    if (action === 'Reveal agents folder') {
      await revealAgentsFolder(context, outputChannel);
      return;
    }
  });

  const openReadmeCommand = vscode.commands.registerCommand('queenBeeSwarm.openReadme', async () => {
    outputChannel.appendLine('Running command: queenBeeSwarm.openReadme');
    await openReadme(context, outputChannel);
  });

  const revealAgentsFolderCommand = vscode.commands.registerCommand('queenBeeSwarm.revealAgentsFolder', async () => {
    outputChannel.appendLine('Running command: queenBeeSwarm.revealAgentsFolder');
    await revealAgentsFolder(context, outputChannel);
  });

  context.subscriptions.push(
    outputChannel,
    askQueenBeeCommand,
    openQueenBeeAgentFileCommand,
    showOverviewCommand,
    openReadmeCommand,
    revealAgentsFolderCommand
  );
}

export function deactivate(): void {
  // No-op. All disposables are registered through the extension context.
}

async function openReadme(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): Promise<void> {
  const readmeUri = vscode.Uri.joinPath(context.extensionUri, 'README.md');

  try {
    await vscode.commands.executeCommand('markdown.showPreview', readmeUri);
  } catch (error) {
    outputChannel.appendLine(`Failed to open README: ${formatError(error)}`);
    void vscode.window.showErrorMessage('Unable to open Queen Bee Swarm README.');
  }
}

async function revealAgentsFolder(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel): Promise<void> {
  const agentsUri = vscode.Uri.joinPath(context.extensionUri, 'agents');

  try {
    await vscode.commands.executeCommand('revealFileInOS', agentsUri);
  } catch (error) {
    outputChannel.appendLine(`Failed to reveal agents folder: ${formatError(error)}`);
    void vscode.window.showErrorMessage('Unable to reveal Queen Bee Swarm agents folder.');
  }
}

async function openQueenBeeAgentFile(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): Promise<void> {
  const queenBeeAgentUri = vscode.Uri.joinPath(context.extensionUri, 'agents', 'queen-bee.agent.md');

  try {
    const document = await vscode.workspace.openTextDocument(queenBeeAgentUri);
    await vscode.window.showTextDocument(document, { preview: false });
  } catch (error) {
    outputChannel.appendLine(`Failed to open Queen Bee agent file: ${formatError(error)}`);
    void vscode.window.showErrorMessage('Unable to open Queen Bee agent file.');
  }
}

async function openQueenBeeChat(outputChannel: vscode.OutputChannel): Promise<void> {
  try {
    await vscode.commands.executeCommand('workbench.action.chat.open', getQueenBeeMention());
  } catch (error) {
    outputChannel.appendLine(`Failed to open chat view: ${formatError(error)}`);
    void vscode.window.showInformationMessage(`Open Chat and mention ${getQueenBeeMention()} to talk to Queen Bee.`);
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
