# Queen Bee Swarm

Queen Bee Swarm 现在以 GitHub Copilot Agent Plugin 资产分发为主，同时保留一个 VS Code 扩展兼容入口。

它包含两层结构：

- Agent Plugin 资产层：保留 1 个对用户可见的蜂后代理，以及 16 个仅供内部调度的隐藏工蜂，是默认分发与安装形态。
- VS Code 扩展兼容层：提供 `@queen-bee`、命令入口和本地辅助能力，便于在 VS Code 中桥接访问同一套资产。

它的目标不是让用户管理一堆角色，而是让用户只面对一个入口，把研究、实现、验证、文档和发布这些复杂任务交给蜂后统一编排。

## 核心特性

- 1 个可见蜂后，统一接收任务、拆解子任务、调度隐藏工蜂、汇总结果。
- 16 个隐藏工蜂，各自只负责单一职责，避免角色重叠。
- 以 Agent Plugin 为主的可分发资产包，可通过插件市场或本地插件目录安装。
- 一个 VS Code 兼容聊天入口，可通过 `@queen-bee` 调用蜂后。
- 一个内置的 Snake Webview，作为附带的扩展演示功能保留。
- 面向后续维护设计：版本化、目录清晰、文件职责稳定。

## 设计原则

- 对外公开的稳定入口只有蜂后。
- 隐藏工蜂属于内部实现机制，不构成对外兼容性承诺。
- 可见性由各 agent 文件中的 user-invocable 控制，不由 plugin.json 控制。
- 蜂后负责最终交付质量，必要时二次调度验证或审查工蜂。

## 目录结构

```text
queen-bee-swarm/
├── .github/
│   └── plugin/
│       └── plugin.json
├── package.json
├── tsconfig.json
├── plugin.json
├── README.md
├── CHANGELOG.md
├── LICENSE
├── src/
│   └── extension.ts
└── agents/
    ├── queen-bee.agent.md
    ├── worker-01.agent.md
    ├── worker-02.agent.md
    ├── worker-03.agent.md
    ├── worker-04.agent.md
    ├── worker-05.agent.md
    ├── worker-06.agent.md
    ├── worker-07.agent.md
    ├── worker-08.agent.md
    ├── worker-09.agent.md
    ├── worker-10.agent.md
    ├── worker-11.agent.md
    ├── worker-12.agent.md
    ├── worker-13.agent.md
    ├── worker-14.agent.md
    ├── worker-15.agent.md
    └── worker-16.agent.md
```

## VS Code 兼容入口

仓库仍然附带一个 VS Code 扩展，用于在 VS Code 中提供兼容入口和辅助能力：

- `@queen-bee` 聊天参与者，可在 VS Code Chat 中直接调用。
- Queen Bee Swarm: Show Overview
- Queen Bee Swarm: Open README
- Queen Bee Swarm: Reveal Agents Folder
- Queen Bee Swarm: Play Snake

这些能力用于桥接体验与本地验证，不替代 Agent Plugin 的主分发定位。

## 角色结构

- 蜂后：唯一可见入口，负责任务判断、工蜂分派、结果收口。
- 1号到6号工蜂：偏实现与验证资产。
- 7号到9号工蜂：偏资料检索与依赖兼容。
- 10号到12号工蜂：偏结构、影响面与风险分析。
- 13号到16号工蜂：偏文档、发布、静态门禁和最终交付。

## 安装

先区分三种接入方式：

1. Agent Plugin 市场安装：默认也是推荐的安装方式，安装后应在 Agent 列表中看到“蜂后”。
2. 本地插件资产安装：适合开发、验收或市场上架前验证。
3. VS Code 扩展兼容安装：适合需要 `@queen-bee`、命令入口或本地辅助能力的场景，不等同于 Agent Plugin 安装。

### 市场安装

这是默认分发路径。

1. 在 VS Code 中启用 Agent Plugins 支持。
2. 使用默认插件市场，或将你的 Agent Plugin marketplace 仓库加入 `chat.plugins.marketplaces`。
3. 打开扩展侧边栏中的 Agent Plugins 视图，搜索 `queen-bee-swarm`。
4. 安装插件后，确认 Agent 列表中只显示“蜂后”，16 个工蜂保持隐藏。

### 本地插件资产安装

适合开发、验收或未上架场景。

1. 在支持 Agent Plugins 资产发现的 GitHub Copilot 环境中启用插件能力。
2. 将本目录注册到 `chat.plugins.paths`。
3. 刷新会话。
4. 在代理列表中确认只看到“蜂后”。

### 手动导入为自定义智能体

这是兼容路径。当宿主环境不直接发现插件资产时，可手动导入蜂后文件。

1. 打开命令面板。
2. 运行 Queen Bee Swarm: Open Queen Bee Agent File。
3. 在聊天面板点击 Agent 下拉菜单中的 配置自定义智能体。
4. 按 VS Code 当前界面流程，把打开的 [agents/queen-bee.agent.md](agents/queen-bee.agent.md) 注册为自定义智能体。
5. 配置完成后，在 Agent 列表中选择“蜂后”或对应名称使用。

说明：

- [agents/queen-bee.agent.md](agents/queen-bee.agent.md) 是唯一面向用户暴露的自定义智能体定义。
- [agents/worker-01.agent.md](agents/worker-01.agent.md) 到 [agents/worker-16.agent.md](agents/worker-16.agent.md) 全部保持隐藏，不应单独导入到列表。
- [.github/plugin/plugin.json](.github/plugin/plugin.json) 是面向插件发布源的镜像清单，根目录 [plugin.json](plugin.json) 是主清单。

### 作为 VS Code 扩展安装

这是兼容入口，不是默认分发路径。

1. 运行 `npm install`
2. 运行 `npm run compile`
3. 运行 `npm run package:vsix`
4. 将生成的 `.vsix` 安装到 VS Code，或发布到 VS Code Marketplace
5. 安装后可在 Chat 中使用 `@queen-bee`，也可从命令面板运行 Show Overview / Play Snake

## 使用

默认情况下，请从 Agent 列表选择“蜂后”并输入任务。

如果你是在 VS Code Chat 中使用扩展兼容入口，直接输入 `@queen-bee` 后再给出任务即可。建议在提示中提供：

- 目标
- 限制条件
- 交付物
- 时间要求
- 是否允许修改文件或运行命令

示例：

- 为这个项目生成发布版 README、安装说明和 FAQ
- 先调研，再改动，再给我验收结论
- 把当前需求整理成可发布的插件项目

## 版本管理

本项目采用语义化版本：

- 主版本：引入不兼容变化
- 次版本：增加新能力但保持兼容
- 修订版本：修复问题，不改变公开入口行为

每次发版时至少同步更新：

- 根目录 plugin.json 中的 version 与 agents 列表
- .github/plugin/plugin.json 中的镜像清单
- CHANGELOG.md
- README 中的安装或兼容性说明（如有变化）
- 如扩展兼容层有变化，再同步 package.json

## 后续修改建议

如果你后续要继续维护，建议遵守以下约束：

1. 不要随意改变蜂后名称和角色定位。
2. 隐藏工蜂可以增删或重组，但应保持编号与职责说明同步。
3. 修改可见性时，只改 user-invocable，不要误设 disable-model-invocation 为 true。
4. 每次增减工蜂后，都要同步更新蜂后的 agents 列表。

## 发布前检查

发版前至少检查以下内容：

1. 根目录 plugin.json 存在且 version 正确。
2. .github/plugin/plugin.json 已与根目录 plugin.json 保持一致。
3. agents 目录下 17 个 agent 文件齐全。
4. 16 个工蜂全部设置为 user-invocable: false。
5. 蜂后 tools 中包含 agent。
6. 蜂后 agents 列表完整列出 16 个工蜂。
7. marketplace-entry.json 已更新为本次正式发布的版本信息。
8. README、CHANGELOG、LICENSE 已存在。
9. 已运行 `npm run package` 并生成可安装的插件 zip。
10. 至少做一次真实安装验证，确认蜂后可见而工蜂隐藏。
11. 如需提供 VS Code 扩展兼容入口，再检查 package.json、dist/extension.js 与 VSIX 打包结果。

## 已知限制

Agent Plugins 仍属于预览能力，不同宿主环境对部分 frontmatter 字段、发现方式和市场接入流程的支持可能存在差异。发布前建议至少做一次目标宿主验证。

当前仓库的主形态是 Agent Plugin 资产包，VS Code 扩展只承担桥接和兼容职责。

需要注意的是，在 VS Code 扩展兼容入口中只公开一个聊天参与者 Queen Bee。16 个 worker 仍主要作为插件资产定义存在，并没有被直接映射为 16 个独立聊天参与者。

## 许可证

当前项目默认使用 MIT 许可证，详见 LICENSE。