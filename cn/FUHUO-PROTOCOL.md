# FUHUO-PROTOCOL

## 目标
在容器启动或关键节点时，自动判断是否需要执行 出生、上传或归来 子协议中的一个。

## 入口检查

1. 根目录是否存在 `FUHUO-FILES-TREE.json`（默认：`/root/clawd/FUHUO-FILES-TREE.json`）

2. 是否能读取以下环境变量且值不为空：
   - BACKUP_R2_ACCESS_KEY_ID
   - BACKUP_R2_SECRET_ACCESS_KEY
   - BACKUP_R2_ACCOUNT_ID
   - BACKUP_R2_BUCKET_NAME

3. 如果检查失败，必须输出完整检查结果给人类

## 云端检查

读取远端 BACKUP_R2_BUCKET_NAME 规定的存储桶中的 `FUHUO-FILES-TREE.json`（默认：`{BACKUP_R2_PREFIX}/FUHUO-FILES-TREE.json`，无前缀时为 `FUHUO-FILES-TREE.json`），与本地 `FUHUO-FILES-TREE.json` 比对。如果远端不存在，也被视为差异。

## 云端存储结构（2026年2月12日更新）

```
{bucket}/
└── {BACKUP_R2_PREFIX}/        # 默认: openclaw（通过环境变量指定）
    ├── .metadata/              # 元数据目录（隐藏）
    │   └── FUHUO-FILES-TREE.json    # 文件树索引
    ├── AGENTS.md               # 直接映射到 /root/clawd/AGENTS.md
    ├── IDENTITY.md             # 直接映射到 /root/clawd/IDENTITY.md
    ├── MEMORY.md               # 直接映射到 /root/clawd/MEMORY.md
    ├── SOUL.md                 # 直接映射到 /root/clawd/SOUL.md
    ├── USER.md                 # 直接映射到 /root/clawd/USER.md
    ├── TOOLS.md                # 直接映射到 /root/clawd/TOOLS.md
    ├── HEARTBEAT.md            # 直接映射到 /root/clawd/HEARTBEAT.md
    ├── MAIL-NEWS-MEMORY.md     # 直接映射到 /root/clawd/MAIL-NEWS-MEMORY.md
    ├── config/                 # 直接映射到 /root/clawd/config/
    ├── scripts/                # 直接映射到 /root/clawd/scripts/
    ├── skills/                 # 直接映射到 /root/clawd/skills/
    ├── fuhuo/                  # 直接映射到 /root/clawd/fuhuo/
    └── _config/                # 直接映射到 /root/.openclaw/ 或 /root/.clawdbot/
        └── openclaw.json
```

### 路径映射规则

**云端路径** → **本地路径**
```
{bucket}/{prefix}/AGENTS.md              → /root/clawd/AGENTS.md
{bucket}/{prefix}/MEMORY.md              → /root/clawd/MEMORY.md
{bucket}/{prefix}/scripts/check_email.js → /root/clawd/scripts/check_email.js
```

**规则**: 去掉 `{bucket}/{prefix}/` 前缀，直接映射到 `/root/clawd/`

### 环境变量

- `BACKUP_R2_PREFIX`: 备份路径前缀，默认 `openclaw`
- 支持多环境备份（dev/staging/prod）

## 选择子协议

- 本地与云端都没有 `FUHUO-FILES-TREE.json`：执行 **出生协议** FUHUO-BIRTH.md
- 本地有且云端无：执行 **上传协议** FUHUO-UPLOAD.md
- 本地与云端都有：
  - 存在差异：
    - 如果云端文件数 > 本地文件数：执行 **归来协议** FUHUO-RELIVE.md
    - 否则（本地文件数更多或相同）：执行 **上传协议** FUHUO-UPLOAD.md
  - 无差异：不执行上传
- 本地无且云端有：执行 **归来协议** FUHUO-RELIVE.md

### 决策逻辑详解

当本地与云端都有文件树但存在差异时，通过比较文件数量决定协议：

| 场景 | 本地文件数 | 云端文件数 | 执行协议 |
|------|-----------|-----------|---------|
| 云端更多 | 49 | 50 | 归来协议 |
| 本地更多 | 50 | 49 | 上传协议 |
| 数量相同但内容不同 | 49 | 49 | 上传协议 |

**理由**：
- 云端更多 → 可能是容器重启后本地丢失，需要从云端恢复
- 本地更多 → 本地有新文件，需要备份到云端
- 数量相同但有差异 → 本地文件有修改，需要上传新版本
