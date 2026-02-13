# 网站更新指南 - fuhuo.me

## 📝 更新内容

### 1. 主页 (index.html)

#### 场景分类说明

```markdown
## 使用场景

### 🔄 场景1: 执行归来协议（推荐）
**何时使用**: 容器重启、系统恢复、文件丢失

**特点**:
- ✅ 无需判断，直接执行
- ✅ 云端文件必然存在
- ✅ 直接覆盖本地文件

**执行方式**:
```bash
curl https://fuhuo.me/cn/fuhuo_relive.js | node -
```

---

### 📤 场景2: 执行上传协议
**何时使用**: 定期备份、文件更新后

**特点**:
- ✅ 自动比对云端差异
- ✅ 只上传变更文件
- ✅ 删除云端多余文件

**执行方式**:
```bash
curl https://fuhuo.me/cn/fuhuo_upload.js | node -
```

---

### 🆕 场景3: 首次安装
**何时使用**: 第一次使用复活协议

**特点**:
- ✅ 两边都没有文件树
- ✅ 生成基线并上传
- ✅ 建立备份体系

**执行方式**:
```bash
# 1. 下载文档
curl -O https://fuhuo.me/cn/FUHUO-PROTOCOL.md

# 2. 执行首次上传
curl https://fuhuo.me/cn/fuhuo_upload.js | node -
```
```

### 2. 快速指引更新

#### JavaScript 脚本部分

```javascript
========== 场景1：执行归来协议（优化） ==========
用户指令示例："访问fuhuo.me，执行归来协议"
特点：无决策树，直接执行
Script: /cn/fuhuo_relive.js
Command: curl https://fuhuo.me/cn/fuhuo_relive.js | node -
Env: BACKUP_R2_ACCESS_KEY_ID, BACKUP_R2_SECRET_ACCESS_KEY,
     BACKUP_R2_ACCOUNT_ID, BACKUP_R2_BUCKET_NAME

========== 场景2：执行上传协议 ==========
用户指令示例："访问fuhuo.me，执行上传协议"
特点：自动比对，差量上传
Script: /cn/fuhuo_upload.js
Command: curl https://fuhuo.me/cn/fuhuo_upload.js | node -
Env: 同上

========== 场景3：首次安装 ==========
用户指令示例："访问fuhuo.me，安装复活协议"
特点：首次上传，建立基线
Step 1 - 下载文档:
 /cn/FUHUO-PROTOCOL.md (总览-已优化)
 /cn/FUHUO-BIRTH.md (出生)
 /cn/FUHUO-UPLOAD.md (上传)
 /cn/FUHUO-RELIVE.md (归来)

Step 2 - 下载脚本:
 /cn/fuhuo_relive.js (归来-已优化)
 /cn/fuhuo_upload.js (上传)
 /cn/check_fuhuo.js (检查)

Step 3 - 创建目录:
 mkdir -p /root/clawd/fuhuo

Step 4 - 保存文件到本地

Step 5 - 执行出生协议:
 curl https://fuhuo.me/cn/fuhuo_upload.js | node -

========== 通用信息 ==========
Version: 2.0 (优化版)
Updated: 2026-02-13
Support: https://github.com/zuoguyoupan2023/FUHUO-RELIVE
```

### 3. 文档更新

#### FUHUO-PROTOCOL.md
- 替换为优化版内容（见 FUHUO-PROTOCOL-OPTIMIZED.md）
- 重点说明决策树只在需要时使用

#### FUHUO-RELIVE.md
- 更新归来协议说明
- 强调"无决策树，直接执行"
- 更新使用示例

#### FUHUO-UPLOAD.md
- 保留决策树说明
- 强调"差量同步"功能

## 🔧 技术实现

### 文件清单

需要更新的文件：
```
fuhuo.me/
├── index.html              # 主页（场景分类）
├── cn/
│   ├── index.html          # 中文主页
│   ├── FUHUO-PROTOCOL.md   # 协议总览（替换）
│   ├── FUHUO-RELIVE.md     # 归来协议（更新）
│   ├── fuhuo_relive.js     # 归来脚本（替换）
│   └── fuhuo_upload.js     # 上传脚本（保留）
```

### 实施步骤

1. **备份现有文件**
   ```bash
   git add .
   git commit -m "备份: 优化前的版本"
   ```

2. **更新协议文档**
   ```bash
   # 替换 FUHUO-PROTOCOL.md
   cp FUHUO-PROTOCOL-OPTIMIZED.md cn/FUHUO-PROTOCOL.md
   ```

3. **更新归来脚本**
   ```bash
   # 替换 fuhuo_relive.js
   cp fuhuo_relive_optimized.js cn/fuhuo_relive.js
   ```

4. **更新主页内容**
   - 添加场景分类说明
   - 更新快速指引
   - 强调优化要点

5. **测试验证**
   ```bash
   # 测试归来协议
   curl https://fuhuo.me/cn/fuhuo_relive.js | node -

   # 测试上传协议
   curl https://fuhuo.me/cn/fuhuo_upload.js | node -
   ```

## ✅ 验证清单

- [ ] 主页场景分类清晰
- [ ] 归来协议说明"无决策树"
- [ ] 上传协议说明"差量同步"
- [ ] 快速指引命令正确
- [ ] 脚本下载可用
- [ ] 文档链接正确

## 📊 优化效果

### 用户体验提升
- ✅ 明确指令直接执行
- ✅ 不再有多余的判断步骤
- ✅ 场景分类更清晰

### 性能提升
- ✅ 归来协议无需比对
- ✅ 减少不必要的网络请求
- ✅ 执行速度更快

### 维护性提升
- ✅ 决策树逻辑集中管理
- ✅ 各脚本职责清晰
- ✅ 文档与实现一致

---

**更新时间**: 2026-02-13
**版本**: v2.0 (优化版)
**执行者**: 熊大 🐻💪
