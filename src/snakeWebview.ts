import * as vscode from 'vscode';

const SNAKE_PANEL_VIEW_TYPE = 'queenBeeSwarm.snake';

let snakePanel: vscode.WebviewPanel | undefined;

function nonce(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function showSnakeWebview(context: vscode.ExtensionContext): void {
  if (snakePanel) {
    snakePanel.reveal(vscode.ViewColumn.One);
    return;
  }

  const panel = vscode.window.createWebviewPanel(SNAKE_PANEL_VIEW_TYPE, 'Queen Bee Swarm: Snake', vscode.ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media', 'snake')],
  });

  snakePanel = panel;
  panel.onDidDispose(() => {
    if (snakePanel === panel) {
      snakePanel = undefined;
    }
  });

  const webview = panel.webview;
  const n = nonce();
  const snakeMediaRoot = vscode.Uri.joinPath(context.extensionUri, 'media', 'snake');
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(snakeMediaRoot, 'style.css'));
  const logicUri = webview.asWebviewUri(vscode.Uri.joinPath(snakeMediaRoot, 'logic.js'));
  const gameUri = webview.asWebviewUri(vscode.Uri.joinPath(snakeMediaRoot, 'game.js'));

  panel.webview.html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource}; script-src 'nonce-${n}';" />
    <link rel="stylesheet" href="${styleUri}" />
    <title>Queen Bee Swarm: Snake</title>
  </head>
  <body>
    <div class="wrap">
      <div class="topbar">
        <div class="title">Queen Bee Swarm: Snake</div>
        <div class="meta">Score: <span id="score">0</span> <span class="meta">|</span> <span id="state">Playing</span></div>
      </div>

      <div id="board" class="board" role="application" aria-label="Snake game board"></div>

      <div class="controls">
        <div style="display:flex; gap:8px; align-items:center;">
          <button id="restart" class="primary" type="button">Restart</button>
          <button id="pause" type="button">Pause</button>
        </div>

        <div class="pad" aria-label="On-screen controls">
          <div class="col">
            <button type="button" data-dir="up">^</button>
            <button type="button" data-dir="down">v</button>
          </div>
          <div class="col">
            <button type="button" data-dir="left">&lt;</button>
            <button type="button" data-dir="right">&gt;</button>
          </div>
        </div>
      </div>

      <div class="status" id="help"></div>
    </div>

    <script nonce="${n}" src="${logicUri}"></script>
    <script nonce="${n}" src="${gameUri}"></script>
  </body>
</html>`;
}
