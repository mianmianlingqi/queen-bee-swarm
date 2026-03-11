# Queen Bee Swarm

Queen Bee Swarm 现在是一个标准 VS Code 扩展项目，同时保留了 GitHub Copilot Agent Plugin 资产。

它包含两层结构：

- VS Code 扩展层：用于打包、发布到 VS Code Marketplace，并让组员可以在扩展面板中搜索与安装。
- Agent Plugin 资产层：保留 1 个对用户可见的蜂后代理，以及 16 个仅供内部调度的隐藏工蜂。

它的目标不是让用户管理一堆角色，而是让用户只面对一个入口，把研究、实现、验证、文档和发布这些复杂任务交给蜂后统一编排。

## 核心特性

- 1 个可见蜂后，统一接收任务、拆解子任务、调度隐藏工蜂、汇总结果。
- 16 个隐藏工蜂，各自只负责单一职责，避免角色重叠。
- 一个真正可用的 VS Code 聊天入口，可直接通过 `@queen-bee` 调用蜂后。
- 一个内置的 Snake Webview，作为正式附加功能保留。
- 面向后续维护设计：版本化、目录清晰、文件职责稳定。
- 可用于本地安装验证，也可作为独立插件仓库继续发布。

## 设计原则

- 对外公开的稳定入口只有蜂后。
- 隐藏工蜂属于内部实现机制，不构成对外兼容性承诺。
- 可见性由各 agent 文件中的 user-invocable 控制，不由 plugin.json 控制。
- 蜂后负责最终交付质量，必要时二次调度验证或审查工蜂。

## 目录结构

```text
queen-bee-swarm/
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

## VS Code 扩展能力

当前扩展层已经不只是打包骨架，而是包含以下公开能力：

- `@queen-bee` 聊天参与者，可在 VS Code Chat 中直接调用。
- Queen Bee Swarm: Show Overview
- Queen Bee Swarm: Open README
- Queen Bee Swarm: Reveal Agents Folder
- Queen Bee Swarm: Play Snake

这意味着项目已经同时具备扩展命令入口、聊天入口和 agent 资产分发能力。

## 角色结构

- 蜂后：唯一可见入口，负责任务判断、工蜂分派、结果收口。
- 1号到6号工蜂：偏实现与验证资产。
- 7号到9号工蜂：偏资料检索与依赖兼容。
- 10号到12号工蜂：偏结构、影响面与风险分析。
- 13号到16号工蜂：偏文档、发布、静态门禁和最终交付。

## 安装

### 作为 VS Code 扩展安装

1. 运行 `npm install`
2. 运行 `npm run compile`
3. 运行 `npx vsce package`
4. 将生成的 `.vsix` 安装到 VS Code，或发布到 VS Code Marketplace
5. 安装后可在 Chat 中使用 `@queen-bee`，也可从命令面板运行 Show Overview / Play Snake

### 本地安装

1. 在支持 Agent Plugins 的 GitHub Copilot 环境中启用插件能力。
2. 将本目录注册为本地插件目录。
3. 刷新会话。
4. 在代理列表中确认只看到“蜂后”。

### 市场安装

1. 将本项目提交到你使用的 Agent Plugin marketplace 仓库或发布源。
2. 完成插件条目录入。
3. 从插件市场安装 queen-bee-swarm。
4. 安装后确认蜂后可见、16 个工蜂保持隐藏。

## 使用

如果你的宿主支持 Agent Plugin 资产，可以继续直接选择“蜂后”并输入任务。

如果你是在 VS Code Chat 中使用扩展层能力，直接输入 `@queen-bee` 后再给出任务即可。建议在提示中提供：

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

- plugin.json 中的 version
- CHANGELOG.md
- README 中的安装或兼容性说明（如有变化）

## 后续修改建议

如果你后续要继续维护，建议遵守以下约束：

1. 不要随意改变蜂后名称和角色定位。
2. 隐藏工蜂可以增删或重组，但应保持编号与职责说明同步。
3. 修改可见性时，只改 user-invocable，不要误设 disable-model-invocation 为 true。
4. 每次增减工蜂后，都要同步更新蜂后的 agents 列表。

## 发布前检查

发版前至少检查以下内容：

1. package.json 中的 publisher、name、displayName、version 已正确填写。
2. 已运行编译并能产出 dist/extension.js。
3. 如需发布到 VS Code Marketplace，已准备好 Publisher 和 PAT。
4. plugin.json 存在且 version 正确。
5. agents 目录下 17 个 agent 文件齐全。
6. 16 个工蜂全部设置为 user-invocable: false。
7. 蜂后 tools 中包含 agent。
8. 蜂后 agents 列表完整列出 16 个工蜂。
9. README、CHANGELOG、LICENSE 已存在。
10. 至少做一次真实安装验证，确认蜂后可见而工蜂隐藏。

## 已知限制

Agent Plugins 仍属于预览能力，不同宿主环境对部分 frontmatter 字段的支持可能存在差异。发布前建议至少做一次目标宿主验证。

当前仓库保留了两套能力：

- VS Code 扩展层：提供真实的聊天入口、命令入口和 Snake Webview。
- Agent Plugin 资产层：保留 queen-bee 与 16 个 worker 的打包分发资产。

需要注意的是，当前运行时只公开一个 VS Code 聊天参与者 Queen Bee。16 个 worker 仍主要作为资产层定义存在，并没有被直接映射为 16 个独立聊天参与者。

## 许可证

当前项目默认使用 MIT 许可证，详见 LICENSE。