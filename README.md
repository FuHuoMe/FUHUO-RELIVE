# FUHUO-RELIVE - OpenClaw 复活协议 🔄

> 让你的 AI 助手每次沉睡后都能满血复活！

[中文](#中文) | [English](#english) | [Français](#français) | [日本語](#日本語) | [Русский](#русский)

---

## 中文

### 📖 什么是复活协议？

FUHUO 复活协议是一套**自动化备份与恢复系统**，专为 OpenClaw AI 助手设计。

**核心功能**：
- ✅ 自动备份工作空间到 R2 云存储
- ✅ 容器重启后一键恢复所有文件
- ✅ 差量同步（只上传变更文件）
- ✅ 支持配置文件、技能、脚本、记忆

**使用场景**：
- 🔄 Cloudflare Container 定期休眠
- 🚀 容器重启后快速恢复工作状态
- 💾 异地备份保护重要数据

---

### 🚀 快速开始

#### 方式 1: 使用在线页面（推荐）

访问复活协议在线页面：
- 🇨🇳 **中文**: https://zuoguyoupan2023.github.io/FUHUO-RELIVE/
- 🇬🇧 **English**: https://zuoguyoupan2023.github.io/FUHUO-RELIVE/index-en.html

选择你的语言，复制命令，粘贴到终端即可！

#### 方式 2: 使用 Node.js 脚本

```bash
# 归来协议（从 R2 恢复）
curl -o relive.js https://raw.githubusercontent.com/zuoguyoupan2023/FUHUO-RELIVE/main/cn/fuhuo_relive.js
BACKUP_R2_ACCESS_KEY_ID="你的Key" \
BACKUP_R2_SECRET_ACCESS_KEY="你的Secret" \
BACKUP_R2_ACCOUNT_ID="你的AccountID" \
BACKUP_R2_BUCKET_NAME="你的Bucket" \
node relive.js
```

---

### 📁 项目结构

```
FUHUO-RELIVE/
├── README.md              # 项目说明（本文件）
├── cn/                    # 🇨🇳 中文版本
│   ├── fuhuo_relive.js    # 归来协议（自包含）
│   ├── fuhuo_upload.js    # 上传协议
│   ├── FUHUO-BIRTH.md     # 出生协议文档
│   ├── FUHUO-PROTOCOL.md  # 协议规则
│   ├── FUHUO-RELIVE.md    # 归来指南
│   └── FUHUO-UPLOAD.md    # 上传指南
├── en/                    # 🇬🇧 英文版本
├── fr/                    # 🇫🇷 法文版本
├── ja/                    # 🇯🇵 日文版本
├── ru/                    # 🇷🇺 俄文版本
└── zh-hant/               # 🇹🇼 繁体中文版本
```

---

### 🔧 配置说明

你需要 4 个环境变量（从 Cloudflare R2 获取）：

| 环境变量 | 说明 | 示例 |
|---------|------|------|
| `BACKUP_R2_ACCESS_KEY_ID` | R2 访问密钥 ID | `d4f72e7ac3ff0055...` |
| `BACKUP_R2_SECRET_ACCESS_KEY` | R2 访问密钥 | `81501e66f09be1ab...` |
| `BACKUP_R2_ACCOUNT_ID` | Cloudflare 账户 ID | `409198b57859944e...` |
| `BACKUP_R2_BUCKET_NAME` | R2 存储桶名称 | `openclawbotonline-data-2` |

**获取方式**：
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 → Overview → Manage R2 API Tokens
3. 创建 API Token，获取以上 4 个值

---

### 📚 协议规则

| 场景 | 本地 | 云端 | 执行协议 |
|------|------|------|----------|
| 首次使用 | ❌ | ❌ | → 出生协议（首次上传） |
| 本地有备份 | ✅ | ❌ | → 上传协议（备份到云端） |
| 容器重启 | ❌ | ✅ | → **归来协议（从云端恢复）** |
| 文件变更 | ✅ | ✅（旧） | → 上传协议（同步变更） |
| 已同步 | ✅ | ✅（同） | → 无需操作 |

---

### 🎯 三大协议

#### 1️⃣ 出生协议（Birth）
首次使用时，初始化云端存储。

#### 2️⃣ 上传协议（Upload）
定期备份本地文件到 R2。

#### 3️⃣ 归来协议（Relive）
**容器重启后，从 R2 恢复所有文件！** ⭐

---

### 🛡️ 安全性

- ✅ 使用 AWS Signature V4 签名
- ✅ Token 不写入代码（环境变量）
- ✅ 支持自定义加密（可选）
- ✅ 完整的文件校验（SHA256）

---

### 🤝 贡献

欢迎贡献！请查看 `cn/` 目录下的文档了解详情。

---

### 📄 许可证

MIT

---

## English

### What is FUHUO Protocol?

The FUHUO Resurrection Protocol is an **automated backup and recovery system** designed for OpenClaw AI assistants.

**Core Features:**
- ✅ Automatic workspace backup to R2 cloud storage
- ✅ One-click restore after container restart
- ✅ Differential sync (only upload changed files)
- ✅ Support for configs, skills, scripts, and memories

**Use Cases:**
- 🔄 Cloudflare Container periodic hibernation
- 🚀 Quick recovery after container restart
- 💾 Offsite backup for important data

---

### Quick Start

#### Option 1: Online Page (Recommended)

Visit the resurrection protocol online page:
- 🇬🇧 **English**: https://zuoguyoupan2023.github.io/FUHUO-RELIVE/index-en.html

#### Option 2: Node.js Script

```bash
# Relive Protocol (restore from R2)
curl -o relive.js https://raw.githubusercontent.com/zuoguyoupan2023/FUHUO-RELIVE/main/en/fuhuo_relive.js
BACKUP_R2_ACCESS_KEY_ID="YourKey" \
BACKUP_R2_SECRET_ACCESS_KEY="YourSecret" \
BACKUP_R2_ACCOUNT_ID="YourAccountID" \
BACKUP_R2_BUCKET_NAME="YourBucket" \
node relive.js
```

---

### Configuration

You need 4 environment variables (from Cloudflare R2):

| Environment Variable | Description | Example |
|---------------------|-------------|---------|
| `BACKUP_R2_ACCESS_KEY_ID` | R2 Access Key ID | `d4f72e7ac3ff0055...` |
| `BACKUP_R2_SECRET_ACCESS_KEY` | R2 Access Key Secret | `81501e66f09be1ab...` |
| `BACKUP_R2_ACCOUNT_ID` | Cloudflare Account ID | `409198b57859944e...` |
| `BACKUP_R2_BUCKET_NAME` | R2 Bucket Name | `openclawbotonline-data-2` |

**How to get:**
1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to R2 → Overview → Manage R2 API Tokens
3. Create API Token and get the 4 values above

---

### Protocol Rules

| Scenario | Local | Remote | Protocol |
|----------|-------|--------|----------|
| First use | ❌ | ❌ | → Birth Protocol (initial upload) |
| Has backup | ✅ | ❌ | → Upload Protocol (backup to remote) |
| Container restart | ❌ | ✅ | → **Relive Protocol (restore from remote)** |
| File changed | ✅ | ✅ (old) | → Upload Protocol (sync changes) |
| Synced | ✅ | ✅ (same) | → No action needed |

---

## Français

## 日本語

## Русский

---

**🐻 熊大，冲啊！**
