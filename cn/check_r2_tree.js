#!/usr/bin/env node

// 简单的 HTTP 检查脚本（无需 aws-sdk）
const https = require('https');

const bucket = process.env.BACKUP_R2_BUCKET_NAME;
const key = 'fuhuo/FUHUO-FILES-TREE.json';

const options = {
  hostname: `${bucket}.r2.cloudflarestorage.com`,
  path: `/${key}`,
  method: 'HEAD',
  headers: {
    // R2 公共桶可能不需要认证
  }
};

const req = https.request(options, (res) => {
  console.log(`HTTP 状态码: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('云端文件存在 ✅');
  } else if (res.statusCode === 404) {
    console.log('云端文件不存在 ❌');
  } else {
    console.log(`其他状态: ${res.statusCode}`);
  }
});

req.on('error', (err) => {
  console.error('检查失败:', err.message);
  // 网络错误通常意味着文件不可访问
  console.log('云端文件不可访问（视为不存在）❌');
});

req.end();
