# FUHUO 归来协议 - 快速恢复指南

## 🚀 快速开始

如果你在一个全新的环境中，需要从 R2 存储桶恢复所有文件，执行归来协议。

### 前提条件

确保以下环境变量已设置：

```bash
export BACKUP_R2_ACCESS_KEY_ID="你的访问密钥ID"
export BACKUP_R2_SECRET_ACCESS_KEY="你的秘密访问密钥"
export BACKUP_R2_ACCOUNT_ID="你的R2账户ID"
export BACKUP_R2_BUCKET_NAME="openclawbotonline-data-2"
```

### 方法一：使用 curl (最快，无需安装任何东西)

```bash
curl -o relive.js https://raw.githubusercontent.com/openclaw/openclaw/main/fuhuo/fuhuo_relive.js && \
BACKUP_R2_ACCESS_KEY_ID="$BACKUP_R2_ACCESS_KEY_ID" \
BACKUP_R2_SECRET_ACCESS_KEY="$BACKUP_R2_SECRET_ACCESS_KEY" \
BACKUP_R2_ACCOUNT_ID="$BACKUP_R2_ACCOUNT_ID" \
BACKUP_R2_BUCKET_NAME="$BACKUP_R2_BUCKET_NAME" \
node relive.js
```

### 方法二：访问 relive.openclawbot.online

```bash
curl relive.openclawbot.online | bash
```

或者：

```bash
wget -qO- relive.openclawbot.online | bash
```

### 方法三：手动下载并执行

1. 下载脚本：
```bash
curl -o relive.js https://raw.githubusercontent.com/openclaw/openclaw/main/fuhuo/fuhuo_relive.js
```

2. 执行归来协议：
```bash
node relive.js
```

## 📋 将恢复的内容

归来协议将从 R2 存储桶恢复以下内容到 `/root/clawd/`：

- **核心文件**: AGENTS.md, MEMORY.md, SOUL.md, HEARTBEAT.md 等
- **脚本**: 所有自动化脚本
- **配置**: cron 备份、AI 环境配置等
- **技能**: cloudflare-browser, McKinsey 等
- **复活协议**: FUHUO-PROTOCOL 相关文档

## 🔍 验证恢复

执行完成后，检查：

```bash
# 查看恢复的文件数量
ls -la /root/clawd/

# 查看文件树
cat /root/clawd/FUHUO-FILES-TREE.json
```

## ⚠️ 注意事项

1. 脚本会覆盖 `/root/clawd/` 目录下的同名文件
2. 需要网络连接访问 R2 存储桶
3. 需要有效的 R2 访问凭证
4. 脚本只依赖 Node.js 内置模块，无需安装任何 npm 包

## 📦 存储桶信息（2026年2月12日更新）

### R2存储结构

```
{bucket}/
└── {BACKUP_R2_PREFIX}/         # 默认: openclaw
    ├── .metadata/              # 元数据（隐藏目录）
    │   └── FUHUO-FILES-TREE.json
    ├── AGENTS.md               # 直接映射到 /root/clawd/
    ├── MEMORY.md
    ├── SOUL.md
    ├── scripts/
    ├── skills/
    └── ...
```

### 关键路径说明

**云端路径** → **本地路径**:
```
{bucket}/openclaw/AGENTS.md         → /root/clawd/AGENTS.md
{bucket}/openclaw/MEMORY.md         → /root/clawd/MEMORY.md
{bucket}/openclaw/scripts/email.js  → /root/clawd/scripts/email.js
```

**规则**: 去掉 `{bucket}/openclaw/` 前缀，直接放到 `/root/clawd/`

### 下载注意事项

⚠️ **必须指定 `openclaw/` 路径**:
- ✅ 正确: `mc cp r2backup/bucket/openclaw/ /root/clawd/`
- ❌ 错误: `mc cp r2backup/bucket/ /root/clawd/`

mc会自动去掉 `openclaw/` 前缀，文件会直接放到 `/root/clawd/`

## 🔧 故障排查

如果执行失败，请检查：

1. 环境变量是否正确设置
2. 网络连接是否正常
3. R2 存储桶是否可访问
4. Node.js 是否已安装（需要 v16+）

## 📞 支持

如有问题，访问：https://docs.openclaw.ai
