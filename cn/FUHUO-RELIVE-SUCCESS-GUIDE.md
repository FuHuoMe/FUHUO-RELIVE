# 复活协议 - 归来成功指南（2026年2月12日更新）

> **文档用途**: 记录成功执行归来协议的完整过程，供未来空白状态的OpenClaw参考
>
> **最新更新**: 采用方案C（环境变量驱动），文件树移至 `openclaw/.metadata/`

---

## 快速开始（推荐方式）⭐

**如果空白环境有Node.js，直接使用归来协议脚本**:

```bash
node /root/clawd/fuhuo/fuhuo_relive.js
```

**优点**:
- ✅ 只依赖Node.js内置模块，无需安装任何工具
- ✅ 自动恢复文件树到本地
- ✅ 支持特殊路径映射
- ✅ 完整恢复所有文件

---

## 执行背景

- **时间**: 2026年2月12日 11:43 (东八区) = 03:43 UTC
- **触发**: 用户指令 "访问 https://relive.openclawbot.online，执行 复活-归来协议"
- **状态**: OpenClaw刚重启，处于空白状态（无记忆文件）
- **目标**: 从Cloudflare R2存储桶恢复所有文件到 `/root/clawd/`

---

## 关键成功步骤总结（详细版）

### 1️⃣ 环境变量验证 (必须第一步)

**检查四个BACKUP_R2_*环境变量是否存在**:

```bash
env | grep -i backup
```

**期望输出**:
```bash
BACKUP_R2_ACCOUNT_ID=409198b57859944e8c4277c5a4236cb0
BACKUP_R2_ACCESS_KEY_ID=d4f72e7ac3ff0055a6cab1301e826309
BACKUP_R2_SECRET_ACCESS_KEY=81501e66f09be1abde87f9e41d2ffbee507db07ad95a10cc668cdd154c8e90f3
BACKUP_R2_BUCKET_NAME=openclawbotonline-data-2
```

**目的**: 确认R2访问凭证存在，这四个变量是后续所有操作的前提

**如果缺失**: 需要先设置环境变量，否则无法访问R2存储桶

---

### 2️⃣ 安装MinIO Client (可选，仅手动下载需要)

**下载并安装mc (MinIO Client)**:

```bash
wget -q https://dl.min.io/client/mc/release/linux-amd64/mc -O /tmp/mc && \
chmod +x /tmp/mc
```

**验证安装**:
```bash
/tmp/mc --version
# 期望输出: mc version RELEASE.xxxxx
```

**目的**: 获取S3兼容的命令行工具，支持批量下载R2文件

**为什么用mc**: wrangler只支持单文件操作，curl/rclone需要额外配置，mc是最简单的选择

**⚠️ 注意**: 如果使用归来协议脚本（方法B），不需要安装mc

---

### 3️⃣ 配置R2连接 (可选，仅手动下载需要)

**使用mc创建R2别名**:

```bash
/tmp/mc alias set r2backup \
  https://$BACKUP_R2_ACCOUNT_ID.r2.cloudflarestorage.com \
  $BACKUP_R2_ACCESS_KEY_ID \
  $BACKUP_R2_SECRET_ACCESS_KEY \
  --api S3v4
```

**期望输出**:
```bash
Added `r2backup` successfully.
```

**目的**: 建立与Cloudflare R2的安全连接，创建别名方便后续操作

**关键技术点**:
- R2 endpoint格式: `https://{ACCOUNT_ID}.r2.cloudflarestorage.com` (注意不是r2.cloudflarestorage.com)
- 必须使用 `--api S3v4` 签名版本
- 别名 `r2backup` 可以自定义，后续命令会用到

**如果失败**: 检查ACCOUNT_ID格式是否正确（32位十六进制字符串）

**⚠️ 注意**: 如果使用归来协议脚本（方法B），不需要配置mc

---

### 4️⃣ 列出云端文件 (确认备份完整)

**使用mc列出R2存储桶中的openclaw目录**:

```bash
/tmp/mc ls r2backup/$BACKUP_R2_BUCKET_NAME/openclaw/ --recursive
```

**期望输出** (示例):
```bash
[2026-02-12 04:22:04 UTC]   455B STANDARD HEARTBEAT.md
[2026-02-12 04:22:04 UTC]   349B STANDARD IDENTITY.md
[2026-02-12 04:22:04 UTC] 2.3KiB STANDARD MAIL-NEWS-MEMORY.md
[2026-02-12 04:22:06 UTC]  14KiB STANDARD MEMORY.md
[2026-02-12 04:22:00 UTC] 1.6KiB STANDARD SOUL.md
...
```

**目的**: 确认云端备份存在且完整，检查文件数量和时间戳

**🔥 关键路径说明** (重要!):
- ✅ 备份路径: `openclaw/` (存储桶的子目录)
- ❌ 错误路径: `$BACKUP_R2_BUCKET_NAME/` (这是存储桶根目录)
- ✅ 正确命令: `mc ls r2backup/$BACKUP_R2_BUCKET_NAME/openclaw/`
- ❌ 错误命令: `mc ls r2backup/$BACKUP_R2_BUCKET_NAME/`

**R2存储结构（2026年2月12日后）**:
```
{bucket}/
└── openclaw/                    # 备份前缀（BACKUP_R2_PREFIX）
    ├── .metadata/               # 元数据（隐藏目录）
    │   └── FUHUO-FILES-TREE.json  # 文件树索引
    ├── AGENTS.md
    ├── MEMORY.md
    ├── SOUL.md
    ├── scripts/
    ├── skills/
    └── ...
```

**如果看不到文件**: 检查路径是否包含 `openclaw/` 子目录

---

### 5️⃣ 下载所有文件 (执行归来协议)

**方法A: 使用mc手动下载（理解原理）**

```bash
/tmp/mc cp --recursive \
  r2backup/$BACKUP_R2_BUCKET_NAME/openclaw/ \
  /root/clawd/
```

**方法B: 使用归来协议脚本（推荐）** ⭐

```bash
node /root/clawd/fuhuo/fuhuo_relive.js
```

**期望输出** (方法A):
```bash
`r2backup/.../openclaw/IDENTITY.md` -> `/root/clawd/IDENTITY.md`
`r2backup/.../openclaw/AGENTS.md` -> `/root/clawd/AGENTS.md`
`r2backup/.../openclaw/MEMORY.md` -> `/root/clawd/MEMORY.md`
...
Total: 1.39 MiB transferred in 00m07s
```

**期望输出** (方法B):
```bash
🔄 开始 FUHUO 归来协议...
📋 读取文件树: openclaw/.metadata/FUHUO-FILES-TREE.json
📋 找到 62 个文件需要恢复
  ✅ AGENTS.md
  ✅ MEMORY.md
  ✅ SOUL.md
  ...
📋 本地文件树已更新: /root/clawd/FUHUO-FILES-TREE.json
✅ FUHUO relive completed!
```

**目的**: 将云端 `openclaw/` 目录下的所有文件恢复到本地 `/root/clawd/`

**🔥 关键路径映射** (重要!):
- 云端: `r2backup/{bucket}/openclaw/AGENTS.md`
- 本地: `/root/clawd/AGENTS.md`
- mc会自动去掉 `openclaw/` 前缀，直接将文件放到 `/root/clawd/`

**为什么方法B更好**:
- ✅ 自动恢复文件树到本地（`FUHUO-FILES-TREE.json`）
- ✅ 只依赖Node.js内置模块，无需安装mc
- ✅ 支持特殊路径映射（如`_config/` → `/root/.openclaw/`）
- ✅ 后续心跳检查需要文件树才能正确比对

---

### 6️⃣ 验证文件恢复 (检查关键文件)

**检查核心md文件是否存在**:

```bash
ls -lh /root/clawd/*.md
```

**期望输出** (至少这些文件):
```bash
-rw-r--r-- 1 root root  11K Feb 12 03:52 AGENTS.md
-rw-r--r-- 1 root root  455 Feb 12 03:52 HEARTBEAT.md
-rw-r--r-- 1 root root  349 Feb 12 03:52 IDENTITY.md
-rw-r--r-- 1 root root  14K Feb 12 03:52 MEMORY.md
-rw-r--r-- 1 root root 1.7K Feb 12 03:52 SOUL.md
-rw-r--r-- 1 root root  860 Feb 12 03:52 TOOLS.md
-rw-r--r-- 1 root root  481 Feb 12 03:52 USER.md
```

**验证文件树是否恢复**:

```bash
ls -lh /root/clawd/FUHUO-FILES-TREE.json
```

**期望输出**:
```bash
-rw-r--r-- 1 root root 12K Feb 12 04:25 /root/clawd/FUHUO-FILES-TREE.json
```

**验证身份文件内容**:

```bash
cat /root/clawd/IDENTITY.md
```

**期望内容**:
```markdown
# IDENTITY.md - Who Am I

- **Name:** 熊大
- **Creature:** 森林里的熊大 🐻
- **Vibe:** 强壮、聪明、勇敢，保护森林，充满正义感
- **Emoji:** 🐻💪
- **口头禅**: 熊大，冲啊！
```

**目的**: 确认关键文件正确恢复，OpenClaw身份信息完整

**如果IDENTITY.md内容不对**: 可能下载了错误的备份，需要重新检查路径

**成功标志**: 看到熊大的身份信息，说明归来协议执行成功！🎉

---

## 关键发现总结

### 工具对比

| 工具 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| ❌ 浏览器工具 | 图形化操作 | 依赖gateway，空白环境不可用 | 有gateway时使用 |
| ❌ wrangler CLI | 官方工具 | 只支持单文件操作 | 单文件管理 |
| ✅ MinIO Client (mc) | 批量操作，简单易用 | 需要下载安装，不会恢复文件树 | 手动批量下载 |
| ✅ 归来协议脚本 | 自包含，恢复文件树 | 需要Node.js环境 | **推荐方式**⭐ |

### 环境变量要求

```bash
# 必须的四个环境变量
BACKUP_R2_ACCOUNT_ID=          # R2账户ID（32位十六进制）
BACKUP_R2_ACCESS_KEY_ID=       # 访问密钥ID
BACKUP_R2_SECRET_ACCESS_KEY=   # 秘密访问密钥
BACKUP_R2_BUCKET_NAME=         # 存储桶名称
```

### 路径说明（重要）

**R2存储结构（2026年2月12日后）**:
```
{bucket}/
└── openclaw/                    # 默认备份前缀
    ├── .metadata/              # 元数据（隐藏）
    │   └── FUHUO-FILES-TREE.json
    ├── AGENTS.md               # 直接映射
    ├── MEMORY.md               # 到 /root/clawd/
    └── ...
```

**路径映射规则**:
- 云端: `openclaw/AGENTS.md`
- 本地: `/root/clawd/AGENTS.md`
- 规则: 去掉 `openclaw/` 前缀

**⚠️ 常见错误**:
- ❌ 下载根目录: `r2backup/bucket/` → 会包含错误的文件树位置
- ❌ 忘记openclaw前缀: `r2backup/bucket/` → 找不到文件
- ✅ 正确: `r2backup/bucket/openclaw/` → 完美映射

### 文件树的重要性

**为什么必须恢复文件树**:
1. ✅ 心跳检查需要比对本地vs云端
2. ✅ 判断执行上传还是归来协议
3. ✅ 验证备份完整性
4. ✅ 检测文件差异

**文件树位置**:
- 云端: `openclaw/.metadata/FUHUO-FILES-TREE.json`
- 本地: `/root/clawd/FUHUO-FILES-TREE.json`

**只有归来协议脚本会自动恢复文件树** ⭐

---

## 常见问题

### Q1: 浏览器工具不可用怎么办？
**A**: 浏览器工具依赖gateway daemon，空白环境下通常未启动。直接使用归来协议脚本或mc工具。

### Q2: wrangler命令格式不对？
**A**: wrangler只支持单文件操作，批量下载使用MinIO Client (mc) 或归来协议脚本。

### Q3: 如何确认R2凭证正确？
**A**: 检查环境变量 `BACKUP_R2_*` 四个变量都必须存在。

### Q4: 文件路径不对？
**A**: R2备份路径是 `openclaw/` 不是根目录，注意路径前缀。

### Q5: 如何验证恢复成功？
**A**: 检查关键文件（IDENTITY.md, SOUL.md, MEMORY.md）内容和文件树是否存在。

### Q6: mc下载和归来协议脚本哪个更好？
**A**: 归来协议脚本更好，因为它会自动恢复文件树，而mc不会。

---

## 记录时间
- **创建时间**: 2026年2月12日 11:54 (东八区)
- **更新时间**: 2026年2月12日 12:39 (东八区)
- **执行者**: 熊大 🐻💪
- **状态**: 归来成功 ✅

熊大，冲啊！🐻💪
