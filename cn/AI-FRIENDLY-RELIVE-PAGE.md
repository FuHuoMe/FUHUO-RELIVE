# FUHUO 归来协议页面优化方案

## 需求理解

### 用户场景
1. **AI 首次安装** - AI 还不知道什么是复活协议，需要快速理解
2. **AI 读取** - 不需要详细解释，只需快速获取并执行

### 核心目标
- ✅ AI 能快速理解这是什么
- ✅ AI 能知道要做什么（读取文档、执行协议）
- ✅ 无需复杂解释，简洁明了

---

## 优化方案

### 方案 A：AI 友好的纯文本头部（推荐）

在 `fuhuo_relive.js` 最前面添加 AI 易读的注释块：

```javascript
#!/usr/bin/env node
/**
 * FUHUO RELIVE PROTOCOL
 *
 * WHAT: 从 R2 存储桶恢复 OpenClaw 配置和文件
 * WHEN: 容器重启后 / 文件丢失时 / 首次安装时
 *
 * ENV REQUIRED:
 *   - BACKUP_R2_ACCESS_KEY_ID
 *   - BACKUP_R2_SECRET_ACCESS_KEY
 *   - BACKUP_R2_ACCOUNT_ID
 *   - BACKUP_R2_BUCKET_NAME
 *
 * USAGE:
 *   curl -fsSL relive.openclawbot.online | node
 *
 * RESTORE TO:
 *   - /root/clawd/     (配置、脚本、文档)
 *   - /root/.openclaw/ (OpenClaw 配置)
 *
 * ALTERNATIVE: 上传协议
 *   curl -fsSL relive.openclawbot.online/upload | node
 */

const https = require('https');
// ... 其余代码
```

**优点**：
- ✅ AI 一眼就能看懂
- ✅ 关键信息在最前面
- ✅ 简洁，无冗余

---

### 方案 B：两段式页面（最佳）

#### 第一步：AI 读取头部（简洁）

```javascript
/**
 * FUHUO PROTOCOL - RELIVE OR UPLOAD
 *
 * AI: 读取此页面后，根据情况选择协议：
 *
 * IF 本地无文件 OR 首次安装:
 *   → 执行 RELIVE 协议（从 R2 恢复）
 *   → 命令: curl -fsSL relive.openclawbot.online/relive | node
 *
 * IF 本地有文件且需要备份:
 *   → 执行 UPLOAD 协议（备份到 R2）
 *   → 命令: curl -fsSL relive.openclawbot.online/upload | node
 *
 * ENV REQUIRED:
 *   BACKUP_R2_ACCESS_KEY_ID
 *   BACKUP_R2_SECRET_ACCESS_KEY
 *   BACKUP_R2_ACCOUNT_ID
 *   BACKUP_R2_BUCKET_NAME
 *
 * 文档位置: /root/clawd/fuhuo/FUHUO-PROTOCOL.md
 */

// ========== RELIVE PROTOCOL ==========
// 如果只需要归来协议，从这里开始复制

const https = require('https');
// ... relive 代码

// ========== UPLOAD PROTOCOL ==========
// 如果需要上传协议，使用上面的 /upload 路径
```

#### 第二步：多个端点

```
relive.openclawbot.online/
├── /           → AI 决策页（上面这个）
├── /relive     → 纯归来协议脚本
└── /upload     → 纯上传协议脚本
```

---

### 方案 C：JSON 决策块（最简洁）

```javascript
{
  "protocol": "FUHUO",
  "version": "1.0",
  "actions": [
    {
      "name": "relive",
      "when": "本地无文件 OR 首次安装",
      "url": "relive.openclawbot.online/relive",
      "command": "curl -fsSL relive.openclawbot.online/relive | node"
    },
    {
      "name": "upload",
      "when": "本地有文件且需要备份",
      "url": "relive.openclawbot.online/upload",
      "command": "curl -fsSL relive.openclawbot.online/upload | node"
    }
  ],
  "env_required": [
    "BACKUP_R2_ACCESS_KEY_ID",
    "BACKUP_R2_SECRET_ACCESS_KEY",
    "BACKUP_R2_ACCOUNT_ID",
    "BACKUP_R2_BUCKET_NAME"
  ],
  "docs": "/root/clawd/fuhuo/FUHUO-PROTOCOL.md"
}

// ========== 以下是归来协议脚本 ==========
#!/usr/bin/env node
const https = require('https');
// ...
```

---

### 方案 D：函数式选择（代码化）

```javascript
#!/usr/bin/env node
/**
 * FUHUO 协议选择器
 *
 * 用法：
 *   node this.js relive   # 执行归来协议
 *   node this.js upload   # 执行上传协议
 *   node this.js check    # 检查状态
 */

const protocol = process.argv[2];

if (protocol === 'relive') {
  // 执行归来协议
  require('./fuhuo_relive');
} else if (protocol === 'upload') {
  // 执行上传协议
  require('./fuhuo_upload');
} else if (protocol === 'check') {
  // 检查状态
  require('./check_resurrection');
} else {
  console.log(`
FUHUO 协议选择器

用法：
  node ${process.argv[1].split('/').pop()} relive   # 归来协议
  node ${process.argv[1].split('/').pop()} upload   # 上传协议
  node ${process.argv[1].split('/').pop()} check    # 检查状态

AI 决策：
  IF 首次安装 OR 本地无文件:
    → node this.js relive
  ELSE IF 需要备份:
    → node this.js upload
  `);
}
```

---

## 推荐实现

### 🥇 最佳方案：方案 A + 路由分离

#### 1. relive.openclawbot.online/ （AI 决策页）

```javascript
#!/usr/bin/env node
/**
 * FUHUO PROTOCOL ROUTER
 *
 * AI: 根据当前状态选择协议
 *
 * 决策逻辑：
 *   1. IF 首次安装 OR /root/clawd/ 为空:
 *        → EXECUTE: curl -fsSL relive.openclawbot.online/relive | node
 *
 *   2. ELSE IF 需要备份到 R2:
 *        → EXECUTE: curl -fsSL relive.openclawbot.online/upload | node
 *
 *   3. ELSE:
 *        → CHECK: node /root/clawd/scripts/check_resurrection.js
 *
 * 环境变量（必需）：
 *   BACKUP_R2_ACCESS_KEY_ID
 *   BACKUP_R2_SECRET_ACCESS_KEY
 *   BACKUP_R2_ACCOUNT_ID
 *   BACKUP_R2_BUCKET_NAME
 *
 * 文档：/root/clawd/fuhuo/FUHUO-PROTOCOL.md
 */

// AI: 你需要执行的命令在上面，根据当前状态选择
// 本页面只是路由说明，实际协议在 /relive 和 /upload

console.log(`
FUHUO PROTOCOL ROUTER
====================

AI: 根据你的状态选择：

1. 首次安装 → curl -fsSL relive.openclawbot.online/relive | node
2. 备份文件   → curl -fsSL relive.openclawbot.online/upload | node
3. 检查状态   → curl -fsSL relive.openclawbot.online/check | node

详细文档: /root/clawd/fuhuo/FUHUO-PROTOCOL.md
`);
```

#### 2. relive.openclawbot.online/relive （归来协议）

```javascript
#!/usr/bin/env node
/**
 * FUHUO RELIVE PROTOCOL
 *
 * 从 R2 存储桶恢复文件到 /root/clawd/
 *
 * ENV REQUIRED:
 *   BACKUP_R2_ACCESS_KEY_ID
 *   BACKUP_R2_SECRET_ACCESS_KEY
 *   BACKUP_R2_ACCOUNT_ID
 *   BACKUP_R2_BUCKET_NAME
 */

// 归来协议代码...
```

#### 3. relive.openclawbot.online/upload （上传协议）

```javascript
#!/usr/bin/env node
/**
 * FUHUO UPLOAD PROTOCOL
 *
 * 备份 /root/clawd/ 文件到 R2 存储桶
 *
 * ENV REQUIRED:
 *   BACKUP_R2_ACCESS_KEY_ID
 *   BACKUP_R2_SECRET_ACCESS_KEY
 *   BACKUP_R2_ACCOUNT_ID
 *   BACKUP_R2_BUCKET_NAME
 *
 * DEPENDENCY: npm install @aws-sdk/client-s3
 */

// 上传协议代码...
```

---

## AI 使用流程

### 首次安装场景

```
用户: "访问 relive.openclawbot.online，执行归来协议"

AI:
1. GET relive.openclawbot.online/
   → 读取决策页

2. 判断：首次安装，需要归来协议

3. EXECUTE:
   curl -fsSL relive.openclawbot.online/relive | node
```

### 容器重启场景

```
用户: "检查心跳"

AI:
1. 检查本地是否有 FUHUO-FILES-TREE.json

2. IF 无:
   curl -fsSL relive.openclawbot.online/relive | node

3. ELSE:
   node /root/clawd/scripts/check_resurrection.js
```

---

## 实现建议

### 方案 1：多路径（推荐）

```
relive.openclawbot.online/
├── /           → 决策说明（AI 读取）
├── /relive     → 归来协议脚本
├── /upload     → 上传协议脚本
└── /check      → 检查脚本
```

### 方案 2：参数化

```
relive.openclawbot.online/relive     → 归来协议
relive.openclawbot.online/upload     → 上传协议
relive.openclawbot.online?protocol=relive     → 归来协议
relive.openclawbot.online?protocol=upload     → 上传协议
```

### 方案 3：Header 检测

```javascript
// 服务器端检测
if (req.headers['user-agent'].includes('OpenClaw-AI')) {
  // 返回 AI 友好的 JSON 或简洁格式
} else {
  // 返回 HTML 页面
}
```

---

## 最终推荐

### 最简洁方案：AI 头部 + 单一脚本

```javascript
#!/usr/bin/env node
/**
 * FUHUO RELIVE PROTOCOL
 *
 * PURPOSE: 从 R2 恢复 OpenClaw 文件
 * WHEN: 首次安装 / 容器重启 / 文件丢失
 *
 * AI: 直接执行此脚本即可
 * 命令: curl -fsSL relive.openclawbot.online | node
 *
 * ENV REQUIRED:
 *   BACKUP_R2_ACCESS_KEY_ID
 *   BACKUP_R2_SECRET_ACCESS_KEY
 *   BACKUP_R2_ACCOUNT_ID
 *   BACKUP_R2_BUCKET_NAME
 *
 * RESTORE TO: /root/clawd/
 * DOCS: /root/clawd/fuhuo/FUHUO-PROTOCOL.md
 */

const https = require('https');
// ... 代码
```

**AI 读取流程**：
1. 读取页面
2. 看到头部注释
3. 理解：这是归来协议，从 R2 恢复文件
4. 执行：curl ... | node

---

需要我帮你实现哪个方案？🐻💪
