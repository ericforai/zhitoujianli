#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = './src/config.yaml';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupGoogleAnalytics() {
  console.log('\n🎯 Google Analytics 4 集成设置\n');

  console.log('📋 请按照以下步骤获取您的 GA4 测量ID：');
  console.log('1. 访问 https://analytics.google.com/');
  console.log('2. 创建新账户或选择现有账户');
  console.log('3. 创建媒体资源（选择"网站"）');
  console.log('4. 输入网站URL: https://blog.zhitoujianli.com');
  console.log('5. 获取测量ID（格式：G-XXXXXXXXXX）\n');

  const gaId = await askQuestion('请输入您的 Google Analytics 测量ID (G-XXXXXXXXXX): ');

  if (!gaId.startsWith('G-') || gaId.length < 10) {
    console.log('❌ 无效的测量ID格式，请确保以G-开头且长度正确');
    rl.close();
    return;
  }

  try {
    // 读取配置文件
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    let configContent = fs.readFileSync(configPath, 'utf8');

    // 替换Google Analytics ID
    const regex = /id:\s*"[^"]*"/;
    configContent = configContent.replace(regex, `id: "${gaId}"`);

    // 写回配置文件
    fs.writeFileSync(configPath, configContent);

    console.log(`✅ Google Analytics 配置已更新！`);
    console.log(`📊 测量ID: ${gaId}`);
    console.log('\n🚀 下一步操作：');
    console.log('1. 重新构建博客: npm run build');
    console.log('2. 部署更新: npm run deploy:blog');
    console.log('3. 访问博客网站验证集成');
    console.log('4. 在Google Analytics中查看实时数据');
  } catch (error) {
    console.log('❌ 配置更新失败:', error.message);
  }

  rl.close();
}

async function checkCurrentConfig() {
  console.log('\n📊 当前 Google Analytics 配置\n');

  try {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    const configContent = fs.readFileSync(configPath, 'utf8');

    const idMatch = configContent.match(/id:\s*"([^"]*)"/);
    const partytownMatch = configContent.match(/partytown:\s*(true|false)/);

    if (idMatch) {
      console.log(`📈 测量ID: ${idMatch[1]}`);
      console.log(`⚡ Partytown优化: ${partytownMatch ? partytownMatch[1] : '未设置'}`);

      if (idMatch[1] === 'G-DEMO123456') {
        console.log('\n⚠️  当前使用的是演示ID，请设置您的实际GA4 ID');
      } else if (idMatch[1] === 'null') {
        console.log('\n⚠️  Google Analytics 未配置');
      } else {
        console.log('\n✅ Google Analytics 已正确配置');
      }
    } else {
      console.log('❌ 未找到Google Analytics配置');
    }
  } catch (error) {
    console.log('❌ 读取配置文件失败:', error.message);
  }
}

async function main() {
  console.log('🎯 智投简历博客 - Google Analytics 管理工具\n');
  console.log('1. 设置 Google Analytics');
  console.log('2. 查看当前配置');
  console.log('3. 退出\n');

  const choice = await askQuestion('请选择操作 (1-3): ');

  switch (choice) {
    case '1':
      await setupGoogleAnalytics();
      break;
    case '2':
      await checkCurrentConfig();
      break;
    case '3':
      console.log('👋 再见!');
      rl.close();
      return;
    default:
      console.log('❌ 无效选择');
  }

  console.log('\n');
  const continueChoice = await askQuestion('继续使用? (Y/n): ');

  if (continueChoice.toLowerCase() !== 'n') {
    await main();
  } else {
    console.log('👋 再见!');
    rl.close();
  }
}

main().catch(console.error);
