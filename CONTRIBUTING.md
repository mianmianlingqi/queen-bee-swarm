# Contributing

## 目标

这个项目的目标是维护一个可发布、可长期演进的 Agent Plugin，并保留一个 VS Code 扩展兼容入口。

修改时请优先保持以下稳定面：

1. 蜂后仍然是唯一对用户可见的主入口。
2. 隐藏工蜂仍然通过 user-invocable: false 保持不可见。
3. 公开行为变更必须同步更新 README 和 CHANGELOG。
4. 如新增、删除或重组工蜂，必须同步更新蜂后正文中的调度规则。
5. Agent Plugin 分发始终优先于 VS Code 扩展分发。

## 推荐修改流程

1. 先明确本次改动影响的是插件资产、扩展兼容层，还是两者同时受影响。
2. 公开行为改动时，先改 README，再改 agent 文件与清单文件。
3. 内部工蜂职责调整时，保持编号、描述和实际职责一致。
4. 每次发版前，先更新根目录 plugin.json 中的 version，再同步 .github/plugin/plugin.json。
5. 同步更新 marketplace-entry.json 中的版本与展示信息。
6. 如扩展兼容层有变化，再同步 package.json 与相关说明。
7. 重要变更写入 CHANGELOG。

## 文件职责

- plugin.json：Agent Plugin 主清单，也是版本与 agents 列表的真源
- .github/plugin/plugin.json：面向插件聚合仓库与发布源的镜像清单
- marketplace-entry.json：正式插件市场条目元数据
- package.json：VS Code 扩展兼容入口清单
- README.md：安装、使用、发布、维护说明
- CHANGELOG.md：版本变更记录
- agents/queen-bee.agent.md：唯一可见入口与编排规则
- agents/worker-*.agent.md：隐藏工蜂定义

## 隐藏工蜂约束

每个隐藏工蜂都必须：

1. 设置 user-invocable: false
2. 保持 disable-model-invocation: false
3. 只承担单一职责
4. 不调度其他工蜂

## 发布建议

1. 默认发布产物是 Agent Plugin zip，而不是 VSIX。
2. 使用 npm run package 生成插件 zip，使用 npm run package:vsix 生成 VS Code 扩展包。
3. 如果要提交到聚合 marketplace，通常还需要额外维护市场条目。当前仓库内附带了正式 marketplace-entry.json 与示例模板，可按目标平台调整。