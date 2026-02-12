#!/usr/bin/env node

/**
 * FUHUO 復活プロトコル - 自包含版
 * R2 バケットからファイルをローカルへ復元
 * Node.js の組み込みモジュールのみを使用、追加パッケージ不要
 *
 * 使用方法：
 * 1. 環境変数が設定されていることを確認：
 *    - BACKUP_R2_ACCESS_KEY_ID
 *    - BACKUP_R2_SECRET_ACCESS_KEY
 *    - BACKUP_R2_ACCOUNT_ID
 *    - BACKUP_R2_BUCKET_NAME
 * 2. 実行: node fuhuo_relive.js
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

// 環境変数を確認
const required = [
  'BACKUP_R2_ACCESS_KEY_ID',
  'BACKUP_R2_SECRET_ACCESS_KEY',
  'BACKUP_R2_ACCOUNT_ID',
  'BACKUP_R2_BUCKET_NAME',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ 缺少环境变量: ${missing.join(', ')}`);
  console.error('\n请设置以下环境变量后重试：');
  required.forEach(env => console.error(`  ${env}`));
  process.exit(1);
}

const accountId = process.env.BACKUP_R2_ACCOUNT_ID;
const bucket = process.env.BACKUP_R2_BUCKET_NAME;
const prefix = (process.env.BACKUP_R2_PREFIX || '').replace(/^\/+|\/+$/g, '');
const basePrefix = prefix ? `${prefix}/` : '';

const rootDir = '/root/clawd';
const openclawDir = fs.existsSync('/root/.openclaw') ? '/root/.openclaw' : '/root/.clawdbot';

/**
 * AWS Signature V4 署名
 */
function getAuthHeaders(method, path, queryParams = {}) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const service = 's3';
  const region = 'auto';

  // クエリ文字列を構築
  const queryString = Object.entries(queryParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  // URI を正規化
  const canonicalUri = path;

  // クエリ文字列を正規化
  const canonicalQuery = queryString;

  // ヘッダーを正規化
  const canonicalHeaders = `host:${bucket}.${accountId}.r2.cloudflarestorage.com\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;

  // 署名ヘッダー一覧
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

  // リクエストハッシュ
  const payloadHash = 'UNSIGNED-PAYLOAD';

  // 正規化リクエスト
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');

  // 署名文字列
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n');

  // 署名キーを生成
  const kDate = hmacSha256(`AWS4${process.env.BACKUP_R2_SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'aws4_request');

  // 署名を計算
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  // 認可ヘッダーを構築
  const authorization = `AWS4-HMAC-SHA256 Credential=${process.env.BACKUP_R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    'Authorization': authorization,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
  };
}

function hmacSha256(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

/**
 * HTTPS リクエストを送信
 */
function request(method, key) {
  return new Promise((resolve, reject) => {
    const host = `${bucket}.${accountId}.r2.cloudflarestorage.com`;

    const headers = getAuthHeaders(method, `/${key}`);
    headers['Host'] = host;

    const options = {
      hostname: host,
      port: 443,
      path: `/${key}`,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.toString()}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * リモートオブジェクトを取得
 */
async function fetchObject(key) {
  return await request('GET', key);
}

/**
 * ファイルツリーを解析
 */
function parseTree(content) {
  const data = JSON.parse(content);
  if (!data || !Array.isArray(data.files)) return [];
  return data.files.map((item) => item.path).filter(Boolean);
}

/**
 * 安全なパス結合
 */
function safeJoin(base, rel) {
  const normalized = path.normalize(rel);
  if (normalized.startsWith('..')) {
    throw new Error(`Invalid path: ${rel}`);
  }
  return path.join(base, normalized);
}

/**
 * 単一ファイルを復元
 */
async function restoreFile(rel) {
  // R2 パス: openclaw/xxx → ローカル: /root/clawd/xxx
  const r2Key = `${basePrefix}openclaw/${rel}`;
  const data = await fetchObject(r2Key);

  let targetBase = rootDir;
  let targetRel = rel;

  // 特別処理: _config/ → /root/.openclaw または /root/.clawdbot
  if (rel.startsWith('_config/')) {
    targetBase = openclawDir;
    targetRel = rel.slice('_config/'.length);
  }

  const targetPath = safeJoin(targetBase, targetRel);
  await fsp.mkdir(path.dirname(targetPath), { recursive: true });
  await fsp.writeFile(targetPath, data);

  return { r2Key, targetPath };
}

/**
 * メイン関数
 */
async function main() {
  console.log('🔄 开始 FUHUO 归来协议...\n');
  console.log(`📦 存储桶: ${bucket}`);
  console.log(`📁 R2前缀: ${basePrefix || '(root)'}`);
  console.log(`📂 R2路径: ${basePrefix}openclaw/`);
  console.log(`💾 本地路径: ${rootDir}`);
  console.log('');

  // ファイルツリーを取得
  // 2026-02-12 更新: ファイルツリーは openclaw/.metadata にあります
  const treeKey = `openclaw/.metadata/FUHUO-FILES-TREE.json`;
  console.log(`📋 读取文件树: ${treeKey}`);

  try {
    const treeBody = await fetchObject(treeKey);
    const treeContent = treeBody.toString('utf8');
    const relPaths = parseTree(treeContent);

    console.log(`📋 找到 ${relPaths.length} 个文件需要恢复\n`);

    // ファイルを復元
    let successCount = 0;
    let failCount = 0;

    for (const rel of relPaths) {
      try {
        const { r2Key, targetPath } = await restoreFile(rel);
        const relPath = path.relative(rootDir, targetPath);
        console.log(`  ✅ ${relPath}`);
        successCount++;
      } catch (err) {
        console.error(`  ❌ ${rel}: ${err.message}`);
        failCount++;
      }
    }

    // ローカルのファイルツリーを保存
    const localTreePath = path.join(rootDir, 'FUHUO-FILES-TREE.json');
    await fsp.writeFile(localTreePath, treeContent);
    console.log(`\n📋 本地文件树已更新: ${localTreePath}`);

    console.log('\n' + '─'.repeat(60));
    console.log('✅ FUHUO relive completed!');
    console.log(`📦 存储桶: ${bucket}`);
    console.log(`📁 恢复位置: ${rootDir}`);
    console.log(`✅ 成功: ${successCount} 个文件`);
    if (failCount > 0) {
      console.log(`❌ 失败: ${failCount} 个文件`);
    }
    console.log('─'.repeat(60));

  } catch (err) {
    console.error('\n❌ 归来协议执行失败:', err.message);
    console.error('\n请检查：');
    console.error('  1. 环境变量是否正确设置');
    console.error('  2. R2 存储桶是否存在');
    console.error('  3. FUHUO-FILES-TREE.json 是否存在');
    process.exit(1);
  }
}

main();
