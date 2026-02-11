# FUHUO-PROTOCOL

## 目标
在容器启动或关键节点时，自动判断是否需要执行 出生、上传或归来 这三个子协议中的一个。

## 入口检查

1. 根目录是否存在 `FUHUO-FILES-TREE.json`（默认：`/root/clawd/FUHUO-FILES-TREE.json`）

2. 是否能读取以下环境变量且值不为空：
   - BACKUP_R2_ACCOUNT_ID
   - BACKUP_R2_ACCESS_KEY_ID
   - BACKUP_R2_SECRET_ACCESS_KEY
   - BACKUP_R2_BUCKET_NAME
  
  这些环境变量需要从cloudflare 中获取，其中ACCOUNT_ID是cloudflare 账号ID，需要从cloudflare 控制台中获取；另外三个是R2存储桶的相关信息，需要从R2 控制台中获取。

3. 如果检查失败，必须输出完整检查结果给人类

## 云端检查

读取远端 BACKUP_R2_BUCKET_NAME 规定的存储桶中的 `FUHUO-FILES-TREE.json`（默认：`{BACKUP_R2_PREFIX}/FUHUO-FILES-TREE.json`，无前缀时为 `FUHUO-FILES-TREE.json`），与本地 `FUHUO-FILES-TREE.json` 比对。如果远端不存在，也被视为差异。

## 云端存储结构

```
FUHUO-FILES-TREE.json    # 文件树索引（根目录）
openclaw/                # 文件目录
├── AGENTS.md            # 映射到 /root/clawd/AGENTS.md
├── IDENTITY.md          # 映射到 /root/clawd/IDENTITY.md
├── MEMORY.md            # 映射到 /root/clawd/MEMORY.md
├── SOUL.md              # 映射到 /root/clawd/SOUL.md
├── USER.md              # 映射到 /root/clawd/USER.md
├── TOOLS.md             # 映射到 /root/clawd/TOOLS.md
├── HEARTBEAT.md         # 映射到 /root/clawd/HEARTBEAT.md
├── MAIL-NEWS-MEMORY.md  # 映射到 /root/clawd/MAIL-NEWS-MEMORY.md
├── config/              # 映射到 /root/clawd/config/
├── scripts/             # 映射到 /root/clawd/scripts/
├── skills/              # 映射到 /root/clawd/skills/
├── fuhuo/               # 映射到 /root/clawd/fuhuo/
└── _config/             # 映射到 /root/.openclaw/ 或 /root/.clawdbot/
    └── openclaw.json
```

## 选择子协议

- 本地与云端都没有 `FUHUO-FILES-TREE.json`：执行 **出生协议** FUHUO-BIRTH.md
- 本地有且云端无：执行 **上传协议** FUHUO-UPLOAD.md
- 本地与云端都有：
  - 存在差异：执行 **上传协议** FUHUO-UPLOAD.md
  - 无差异：不执行上传
- 本地无且云端有：执行 **归来协议** FUHUO-RELIVE.md
