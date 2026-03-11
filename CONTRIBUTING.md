# Contributing

## 目标

这个项目的目标是维护一个可发布、可长期演进的 Agent Plugin，而不是一次性脚本集合。

修改时请优先保持以下稳定面：

1. 蜂后仍然是唯一对用户可见的主入口。
2. 隐藏工蜂仍然通过 user-invocable: false 保持不可见。
3. 公开行为变更必须同步更新 README 和 CHANGELOG。
4. 如新增、删除或重组工蜂，必须同步更新蜂后正文中的调度规则。

## 推荐修改流程

1. 先明确是改公开行为，还是改内部实现。
2. 公开行为改动时，先改 README，再改 agent 文件。
3. 内部工蜂职责调整时，保持编号、描述和实际职责一致。
4. 每次发版前，更新 plugin.json 中的 version。
5. 重要变更写入 CHANGELOG。

## 文件职责

- plugin.json：插件最小元数据
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

如果要提交到聚合 marketplace，通常还需要额外生成或维护聚合仓库要求的 plugin 清单与市场条目。当前仓库内附带了示例模板，可按目标平台调整。