# FUHUO-BIRTH

## 目标
在本地与云端都不存在 `FUHUO-FILES-TREE.json` 时，生成基线文件树并初始化云端基线。

## 作用范围

默认扫描并生成文件树（记录 path/hash/size/mtimeMs）：
- `/root/clawd/core`
- `/root/clawd/skills`
- `/root/clawd/scripts`
- `/root/clawd/config`
- `/root/clawd/memory`
- `/root/.openclaw/openclaw.json` 或 `/root/.clawdbot/clawdbot.json`
- `/root/clawd/*.md` 核心文件（AGENTS/IDENTITY/MEMORY/SOUL/USER/TOOLS/HEARTBEAT/MAIL-NEWS-MEMORY）

排除目录：
- `.git`
- `node_modules`

## 执行步骤

1. 生成本地 `FUHUO-FILES-TREE.json`
2. 执行 **上传协议** FUHUO-UPLOAD.md 将本地基线与文件上传到云端

## 云端存储结构

```
FUHUO-FILES-TREE.json    # 文件树索引（根目录）
openclaw/                # 文件目录
├── AGENTS.md
├── IDENTITY.md
├── MEMORY.md
├── SOUL.md
├── USER.md
├── TOOLS.md
├── HEARTBEAT.md
├── MAIL-NEWS-MEMORY.md
├── config/
├── scripts/
├── skills/
├── fuhuo/
└── openclaw/
```
