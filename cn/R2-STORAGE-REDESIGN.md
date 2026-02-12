# R2存储结构重构方案

## 当前结构分析

### 现有结构（存在问题）
```
{bucket}/
├── FUHUO-FILES-TREE.json    # 文件树（在根目录）
└── openclaw/                # 所有文件（在子目录）
    ├── AGENTS.md
    ├── MEMORY.md
    ├── SOUL.md
    ├── scripts/
    ├── skills/
    └── ...
```

### 问题诊断

#### 问题1: FUHUO-FILES-TREE.json 的位置尴尬
- ✅ 它是元数据，应该与数据分离
- ❌ 但它描述的是 `openclaw/` 里面的内容
- ❌ 不在 `openclaw/` 里，却在描述它
- 💡 类似：一本书的目录在外面，内容在里面

#### 问题2: openclaw/ 文件夹是多余的
- ❌ 下载时需要 `mc cp .../openclaw/ /root/clawd/`
- ❌ mc会自动去掉 `openclaw/` 前缀
- ❌ 多了一层路径映射，容易混淆
- 💡 如果R2只有这一种备份，`openclaw/` 没有意义

#### 问题3: 文件映射不直观
```
云端: r2backup/bucket/openclaw/AGENTS.md
本地: /root/clawd/AGENTS.md
```
需要理解"去掉openclaw前缀"这个规则，不够直观

---

## 设计原则

1. **简单直观**: 云端路径 ↔ 本地路径 一目了然
2. **元数据分离**: 文件树与数据分离，但不分离太远
3. **扩展性**: 如果未来有多环境备份，应该支持
4. **向后兼容**: 旧数据能平滑迁移

---

## 方案对比

### 方案A: 扁平化结构（推荐 ⭐）

**结构**:
```
{bucket}/
├── .metadata/               # 元数据目录（隐藏目录）
│   └── FUHUO-FILES-TREE.json
├── AGENTS.md
├── MEMORY.md
├── SOUL.md
├── IDENTITY.md
├── HEARTBEAT.md
├── scripts/
│   ├── check_email.js
│   └── ...
├── skills/
│   ├── web-search/
│   └── ...
├── config/
└── fuhuo/
```

**映射规则**:
```
云端: r2backup/bucket/AGENTS.md
本地: /root/clawd/AGENTS.md

云端: r2backup/bucket/scripts/check_email.js
本地: /root/clawd/scripts/check_email.js
```

**下载命令**:
```bash
# 下载所有文件（排除.metadata）
mc cp --recursive r2backup/bucket/ /root/clawd/ \
  --exclude ".metadata/*"
```

**优点**:
- ✅ 路径1:1映射，直观明了
- ✅ 文件树在隐藏目录，不会误操作
- ✅ 下载命令简单自然
- ✅ 符合"元数据隐藏"的Unix惯例

**缺点**:
- ⚠️ 元数据和数据在同一级（但已通过隐藏目录缓解）

---

### 方案B: 版本化结构（扩展性好）

**结构**:
```
{bucket}/
├── releases/               # 版本管理（可选）
│   ├── latest -> ../workspace
│   └── v2026-02-12 -> ../workspace
└── workspace/              # 主工作区
    ├── .metadata/
    │   └── FUHUO-FILES-TREE.json
    ├── AGENTS.md
    ├── MEMORY.md
    └── ...
```

**映射规则**:
```
云端: r2backup/bucket/workspace/AGENTS.md
本地: /root/clawd/AGENTS.md
```

**下载命令**:
```bash
mc cp --recursive r2backup/bucket/workspace/ /root/clawd/ \
  --exclude ".metadata/*"
```

**优点**:
- ✅ 支持多版本备份（workspace/, staging/, prod/）
- ✅ 可以保留历史快照
- ✅ 适合多环境部署

**缺点**:
- ⚠️ 多了一层 `workspace/` 路径
- ⚠️ 对单环境用户来说是过度设计

---

### 方案C: 环境变量驱动结构（最灵活）

**结构**:
```
{bucket}/
└── {BACKUP_R2_PREFIX}/     # 通过环境变量指定
    ├── .metadata/
    │   └── FUHUO-FILES-TREE.json
    ├── AGENTS.md
    └── ...
```

**默认值**: `BACKUP_R2_PREFIX=openclaw`

**映射规则**:
```bash
# 如果 BACKUP_R2_PREFIX=openclaw
云端: r2backup/bucket/openclaw/AGENTS.md
本地: /root/clawd/AGENTS.md

# 如果 BACKUP_R2_PREFIX=staging
云端: r2backup/bucket/staging/AGENTS.md
本地: /root/clawd/AGENTS.md
```

**下载命令**:
```bash
mc cp --recursive \
  r2backup/bucket/$BACKUP_R2_PREFIX/ \
  /root/clawd/ \
  --exclude ".metadata/*"
```

**优点**:
- ✅ 通过环境变量灵活切换
- ✅ 支持多环境（dev/staging/prod）
- ✅ 不改目录结构就能扩展

**缺点**:
- ⚠️ 需要额外说明环境变量用途
- ⚠️ 默认值 `openclaw` 仍然存在，但更合理（是前缀不是硬编码目录）

---

## 推荐方案：方案C（环境变量驱动）

### 为什么选择方案C

1. **向后兼容**: 默认 `BACKUP_R2_PREFIX=openclaw`，旧代码无需大改
2. **扩展性**: 通过改环境变量就能支持多环境
3. **简单性**: 逻辑清晰，`{bucket}/{prefix}/` → `/root/clawd/`
4. **元数据隔离**: 使用 `.metadata/` 隐藏目录

### 最终结构

```
{bucket}/
└── {BACKUP_R2_PREFIX}/     # 默认: openclaw
    ├── .metadata/
    │   └── FUHUO-FILES-TREE.json
    ├── AGENTS.md
    ├── MEMORY.md
    ├── SOUL.md
    ├── IDENTITY.md
    ├── HEARTBEAT.md
    ├── TOOLS.md
    ├── USER.md
    ├── scripts/
    │   ├── check_email.js
    │   ├── fuhuo_upload.js
    │   └── ...
    ├── skills/
    │   ├── web-search/SKILL.md
    │   ├── cloudflare-browser/
    │   └── ...
    ├── config/
    │   ├── cron_backup.json
    │   └── ...
    ├── fuhuo/
    │   ├── FUHUO-PROTOCOL.md
    │   ├── FUHUO-UPLOAD.md
    │   └── ...
    └── _config/
        └── openclaw.json
```

---

## 迁移脚本

### 从旧结构迁移到新结构

**步骤1**: 上传脚本（使用mc重命名）

```bash
# 1. 创建.metadata目录
mc cp r2backup/$BACKUP_R2_BUCKET_NAME/FUHUO-FILES-TREE.json \
  r2backup/$BACKUP_R2_BUCKET_NAME/$BACKUP_R2_PREFIX/.metadata/FUHUO-FILES-TREE.json

# 2. 删除旧文件树
mc rm r2backup/$BACKUP_R2_BUCKET_NAME/FUHUO-FILES-TREE.json

# 3. 验证新结构
mc ls r2backup/$BACKUP_R2_BUCKET_NAME/$BACKUP_R2_PREFIX/.metadata/
```

**步骤2**: 更新上传协议

修改 `fuhuo_upload.js`:
```javascript
// 旧代码
await s3.send(new PutObjectCommand({
  Bucket: bucketName,
  Key: 'FUHUO-FILES-TREE.json',  // ❌ 根目录
  Body: fileTreeJson
}));

// 新代码
await s3.send(new PutObjectCommand({
  Bucket: bucketName,
  Key: `${prefix}/.metadata/FUHUO-FILES-TREE.json`,  // ✅ 元数据目录
  Body: fileTreeJson
}));
```

**步骤3**: 更新归来协议

修改 `fuhuo_relive.js`:
```javascript
// 旧代码
const fileTreeKey = 'FUHUO-FILES-TREE.json';  // ❌ 根目录

// 新代码
const fileTreeKey = `${prefix}/.metadata/FUHUO-FILES-TREE.json`;  // ✅ 元数据目录
```

---

## 归来协议引导（更新版）

### 文档说明（FUHUO-RELIVE-GUIDE.md）

```markdown
## R2存储结构

### 当前结构（2026年2月12日后）

```
{bucket}/
└── openclaw/                    # 备份前缀（BACKUP_R2_PREFIX）
    ├── .metadata/               # 元数据（隐藏目录）
    │   └── FUHUO-FILES-TREE.json
    ├── AGENTS.md                # 直接映射到 /root/clawd/
    ├── MEMORY.md
    ├── SOUL.md
    ├── scripts/
    ├── skills/
    └── ...
```

### 路径映射规则

**云端路径** → **本地路径**
```
{bucket}/openclaw/AGENTS.md         → /root/clawd/AGENTS.md
{bucket}/openclaw/MEMORY.md         → /root/clawd/MEMORY.md
{bucket}/openclaw/scripts/email.js  → /root/clawd/scripts/email.js
```

**规则**: 去掉 `{bucket}/{prefix}/` 前缀，直接放到 `/root/clawd/`

### 下载命令

```bash
# 下载所有文件（自动排除.metadata）
mc cp --recursive \
  r2backup/$BACKUP_R2_BUCKET_NAME/$BACKUP_R2_PREFIX/ \
  /root/clawd/

# mc会自动将:
#   r2backup/bucket/openclaw/AGENTS.md → /root/clawd/AGENTS.md
#   r2backup/bucket/openclaw/scripts/x.js → /root/clawd/scripts/x.js
```

### 关键注意事项

1. **必须包含 `openclaw/` 路径**
   - ✅ 正确: `mc cp r2backup/bucket/openclaw/ /root/clawd/`
   - ❌ 错误: `mc cp r2backup/bucket/ /root/clawd/`

2. **不要下载 `.metadata/` 目录**
   - mc 的 `cp --recursive` 会自动处理
   - 如需排除，使用 `--exclude ".metadata/*"`

3. **文件树在元数据目录**
   - 路径: `openclaw/.metadata/FUHUO-FILES-TREE.json`
   - 只有在上传/归来协议时需要
   - 平时操作不需要关心
```

---

## 总结

### 新结构优势

| 维度 | 旧结构 | 新结构 |
|------|--------|--------|
| **路径映射** | 需要理解"去掉openclaw前缀" | 直接1:1映射 |
| **元数据位置** | 根目录（尴尬） | `.metadata/` 隐藏目录 |
| **扩展性** | 硬编码openclaw | 环境变量驱动 |
| **多环境** | 需要改代码 | 改PREFIX即可 |
| **直观性** | ❌ 需要说明 | ✅ 一目了然 |

### 迁移优先级

1. **高优先级**: 更新文档（FUHUO-RELIVE-GUIDE.md）
2. **中优先级**: 更新上传/归来协议脚本
3. **低优先级**: 清理旧数据（可以共存）

### 实施建议

1. ✅ 先更新文档和引导说明
2. ✅ 更新上传协议（fuhuo_upload.js）
3. ✅ 更新归来协议（fuhuo_relive.js）
4. ⏸️ 数据迁移可以延后（新旧结构兼容）
5. ⏸️ 添加 `.metadata/` 目录（向后兼容）

---

**下一步**: 更新 FUHUO-PROTOCOL.md 和 FUHUO-RELIVE-GUIDE.md
