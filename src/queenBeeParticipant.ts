import * as vscode from 'vscode';

const QUEEN_BEE_PARTICIPANT_ID = 'queen-bee-swarm.queen-bee';
const QUEEN_BEE_NAME = 'queen-bee';

type QueenBeeIntent = 'overview' | 'agents' | 'snake' | 'release' | 'general';

interface QueenBeeResponseMetadata {
  intent: QueenBeeIntent;
  command?: string;
  usedModel?: boolean;
}

export function registerQueenBeeParticipant(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): vscode.ChatParticipant {
  const participant = vscode.chat.createChatParticipant(
    QUEEN_BEE_PARTICIPANT_ID,
    createRequestHandler(context, outputChannel)
  );

  participant.iconPath = new vscode.ThemeIcon('hubot');
  participant.followupProvider = {
    provideFollowups(result: vscode.ChatResult): vscode.ChatFollowup[] {
      const metadata = result.metadata as QueenBeeResponseMetadata | undefined;

      switch (metadata?.intent) {
        case 'agents':
          return [
            { prompt: '总结蜂后和工蜂的职责分工', label: '解释角色分工' },
            { prompt: '如何验证只有蜂后对用户可见', label: '验证可见性' },
          ];
        case 'snake':
          return [
            { prompt: '打开 Snake 并告诉我怎么玩', label: '继续玩 Snake' },
            { prompt: '这个 Webview 还有哪些可改进点', label: '审查 Snake 实现' },
          ];
        case 'release':
          return [
            { prompt: '列出发布前还缺什么', label: '发布缺口' },
            { prompt: '给我一份最小发布检查清单', label: '发布检查清单' },
          ];
        default:
          return [
            { prompt: '概览这个扩展的能力', label: '扩展概览' },
            { prompt: '列出蜂群里的所有 agent 文件', label: '查看 agent 文件' },
            { prompt: '打开 Snake', label: '玩 Snake' },
          ];
      }
    },
  };

  participant.onDidReceiveFeedback((feedback) => {
    outputChannel.appendLine(
      `[chat] Feedback received: ${feedback.kind === vscode.ChatResultFeedbackKind.Helpful ? 'helpful' : 'unhelpful'}`
    );
  });

  context.subscriptions.push(participant);
  return participant;
}

export function getQueenBeeParticipantId(): string {
  return QUEEN_BEE_PARTICIPANT_ID;
}

export function getQueenBeeMention(): string {
  return `@${QUEEN_BEE_NAME}`;
}

function createRequestHandler(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): vscode.ChatRequestHandler {
  return async (request, chatContext, stream, token) => {
    const intent = detectIntent(request);
    outputChannel.appendLine(`[chat] Handling request with intent: ${intent}`);

    switch (request.command) {
      case 'overview':
        return handleOverviewRequest(stream);
      case 'agents':
        return handleAgentsRequest(context, stream, token);
      case 'snake':
        return handleSnakeRequest(stream);
      case 'release':
        return handleReleaseRequest(stream);
      default:
        break;
    }

    switch (intent) {
      case 'overview':
        return handleOverviewRequest(stream);
      case 'agents':
        return handleAgentsRequest(context, stream, token);
      case 'snake':
        return handleSnakeRequest(stream);
      case 'release':
        return handleReleaseRequest(stream);
      default:
        return handleGeneralRequest(request, chatContext, stream, token, outputChannel);
    }
  };
}

function detectIntent(request: vscode.ChatRequest): QueenBeeIntent {
  const prompt = request.prompt.trim().toLowerCase();

  if (!prompt) {
    return 'overview';
  }

  if (/(agent|蜂后|工蜂|worker|queen|角色|分工|隐藏)/.test(prompt)) {
    return 'agents';
  }

  if (/(snake|贪吃蛇|游戏|webview|pause|restart)/.test(prompt)) {
    return 'snake';
  }

  if (/(发布|publish|vsix|marketplace|上架|元数据|publisher|版本)/.test(prompt)) {
    return 'release';
  }

  if (/(概览|overview|介绍|能做什么|what can|help)/.test(prompt)) {
    return 'overview';
  }

  return 'general';
}

function handleOverviewRequest(stream: vscode.ChatResponseStream): vscode.ChatResult {
  stream.progress('梳理 Queen Bee Swarm 的公开能力');
  stream.markdown([
    '## Queen Bee Swarm',
    '',
    '- 这是一个同时包含 VS Code 扩展层和 Copilot Agent Plugin 资产层的仓库。',
    '- 对用户公开的入口应该只有一个 Queen Bee；16 个 worker 保持隐藏。',
    '- 当前扩展已经提供命令入口、README 预览、agents 目录定位和内置 Snake。',
    '- 现在还新增了一个真正可用的聊天入口，你可以直接在聊天里用 @queen-bee。',
    '',
    '如果你要继续完善这个项目，优先级通常是：聊天入口稳定化、清单与发布元数据、再到 worker 资产的进一步桥接。',
  ].join('\n'));
  stream.button({ command: 'queenBeeSwarm.openReadme', title: 'Open README' });
  stream.button({ command: 'queenBeeSwarm.revealAgentsFolder', title: 'Reveal Agents Folder' });
  stream.button({ command: 'queenBeeSwarm.playSnake', title: 'Play Snake' });

  return { metadata: { intent: 'overview' } satisfies QueenBeeResponseMetadata };
}

async function handleAgentsRequest(
  context: vscode.ExtensionContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  stream.progress('收集 agent 资产目录');

  const agentsUri = vscode.Uri.joinPath(context.extensionUri, 'agents');
  const entries = await vscode.workspace.fs.readDirectory(agentsUri);

  if (token.isCancellationRequested) {
    return { metadata: { intent: 'agents' } satisfies QueenBeeResponseMetadata };
  }

  const agentFiles = entries
    .filter(([name, fileType]) => fileType === vscode.FileType.File && name.endsWith('.agent.md'))
    .map(([name]) => ({ name }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const queenFile = vscode.Uri.joinPath(agentsUri, 'queen-bee.agent.md');

  stream.markdown([
    '## Agent 资产',
    '',
    `- 总计 ${agentFiles.length} 个 agent 文件。`,
    '- 其中 queen-bee.agent.md 是唯一面向用户的入口。',
    '- worker-01 到 worker-16 作为隐藏工蜂保留在资产层。',
    '',
    '如果你的目标是把这个项目做成真正的 VS Code Chat 扩展，建议继续维持“一个可见蜂后”的模型，不要把 16 个 worker 都暴露成聊天参与者。',
  ].join('\n'));
  stream.filetree([{ name: 'agents', children: agentFiles }], context.extensionUri);
  stream.reference(queenFile);
  stream.button({ command: 'queenBeeSwarm.revealAgentsFolder', title: 'Open Agents Folder' });

  return { metadata: { intent: 'agents' } satisfies QueenBeeResponseMetadata };
}

function handleSnakeRequest(stream: vscode.ChatResponseStream): vscode.ChatResult {
  stream.progress('准备 Snake 功能说明');
  stream.markdown([
    '## Snake',
    '',
    '- 扩展内置了一个 Webview 版 Snake。',
    '- 键盘支持方向键和 WASD。',
    '- 空格或 P 暂停，R 重开。',
    '- 这个功能现在作为正式附加能力保留，不再只是隐藏彩蛋。',
  ].join('\n'));
  stream.button({ command: 'queenBeeSwarm.playSnake', title: 'Open Snake' });

  return { metadata: { intent: 'snake' } satisfies QueenBeeResponseMetadata };
}

function handleReleaseRequest(stream: vscode.ChatResponseStream): vscode.ChatResult {
  stream.progress('整理发布与元数据检查项');
  stream.markdown([
    '## 发布检查',
    '',
    '- 确认 package.json 的 publisher、repository、homepage 和 bugs 不再是占位值。',
    '- 让 VS Code 扩展清单和 plugin 资产清单的版本、描述保持一致。',
    '- 编译产物 dist/extension.js、agents/ 和 media/ 都要被包含进 VSIX。',
    '- 上架前至少在开发宿主里验证 @queen-bee、README、agents 目录和 Snake。',
  ].join('\n'));
  stream.button({ command: 'queenBeeSwarm.openReadme', title: 'Review README' });

  return { metadata: { intent: 'release' } satisfies QueenBeeResponseMetadata };
}

async function handleGeneralRequest(
  request: vscode.ChatRequest,
  chatContext: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  outputChannel: vscode.OutputChannel
): Promise<vscode.ChatResult> {
  stream.progress('以 Queen Bee 模式分析请求');

  const history = chatContext.history
    .filter((item): item is vscode.ChatRequestTurn => item instanceof vscode.ChatRequestTurn)
    .slice(-3)
    .map((item) => `- ${item.prompt}`)
    .join('\n');

  const orchestrationPrompt = [
    '你是 Queen Bee Swarm 扩展中的蜂后聊天入口。',
    '请始终使用简洁中文回答。',
    '你负责接收任务、判断任务类型、规划实现路径、提示风险与缺口。',
    '你不能声称已经在 VS Code 运行时中真正调度了 16 个隐藏工蜂；这些 worker 当前主要作为打包资产存在。',
    '已知扩展能力：打开 README、打开 agents 目录、打开 Snake Webview、作为聊天入口回答扩展与发布问题。',
    '项目原则：对外公开入口只有蜂后；隐藏工蜂不直接暴露给用户。',
    history ? `最近的用户历史：\n${history}` : '最近没有相关历史。',
    `用户当前请求：${request.prompt}`,
    '回答格式尽量包含：任务判断、执行路径、关键结果、风险与缺口、下一步。',
  ].join('\n\n');

  try {
    const response = await request.model.sendRequest(
      [vscode.LanguageModelChatMessage.User(orchestrationPrompt)],
      {},
      token
    );

    for await (const fragment of response.text) {
      stream.markdown(fragment);
    }

    stream.button({ command: 'queenBeeSwarm.openReadme', title: 'Open README' });

    return {
      metadata: {
        intent: 'general',
        usedModel: true,
      } satisfies QueenBeeResponseMetadata,
    };
  } catch (error) {
    outputChannel.appendLine(`[chat] Falling back to static response: ${formatError(error)}`);

    stream.markdown([
      '我现在无法调用聊天模型，不过仍然可以给出一个静态结论：',
      '',
      '- 这个仓库的正确演进方向是保留一个可见蜂后入口。',
      '- 先稳住扩展代码、清单和文档，再逐步增强 worker 资产桥接。',
      '- 如果你现在要继续推进，最直接的路径是审查命令入口、README 和发布元数据。',
    ].join('\n'));
    stream.button({ command: 'queenBeeSwarm.showOverview', title: 'Show Overview' });
    stream.button({ command: 'queenBeeSwarm.revealAgentsFolder', title: 'Open Agents Folder' });

    return {
      metadata: {
        intent: 'general',
        usedModel: false,
      } satisfies QueenBeeResponseMetadata,
    };
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}