const { spawn } = require('child_process');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.blue}   Changelog 系统 - 前后台分离模式${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// 检查是否需要先构建
const fs = require('fs');
const outDir = path.join(__dirname, '../out');
if (!fs.existsSync(outDir)) {
  console.log(`${colors.yellow}⚠️  检测到未构建，正在执行构建...${colors.reset}\n`);
  spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  }).on('close', (code) => {
    if (code === 0) {
      console.log(`\n${colors.green}✅ 构建完成！${colors.reset}\n`);
      startServers();
    } else {
      console.error(`\n${colors.reset}❌ 构建失败，请检查错误信息${colors.reset}`);
      process.exit(1);
    }
  });
} else {
  startServers();
}

function startServers() {
  const processes = [];

  // 启动后台服务 (Next.js API)
  console.log(`${colors.green}► 启动后台服务 (端口 3001)...${colors.reset}`);
  const backend = spawn('npm', ['run', 'dev:backend'], {
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, PORT: 3001 }
  });

  backend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('ready') || output.includes('started') || output.includes('localhost')) {
      console.log(`${colors.green}  ✓ 后台服务已启动: http://localhost:3001${colors.reset}`);
      console.log(`    管理后台: ${colors.blue}http://localhost:3001/admin${colors.reset}\n`);
    }
  });

  backend.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Error') || output.includes('error')) {
      console.error(`${colors.red}  [后台错误] ${output}${colors.reset}`);
    }
  });

  processes.push({ name: '后台', process: backend });

  // 等待一下让后台先启动
  setTimeout(() => {
    // 启动前台服务 (静态文件)
    console.log(`${colors.green}► 启动前台服务 (端口 3000)...${colors.reset}`);
    const frontend = spawn('npm', ['run', 'dev:frontend'], {
      shell: true,
      stdio: 'pipe'
    });

    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Accepting connections') || output.includes('Available') || output.includes('http://localhost:3000')) {
        console.log(`${colors.green}  ✓ 前台服务已启动: http://localhost:3000${colors.reset}`);
        console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.green}✅ 所有服务已启动！${colors.reset}\n`);
        console.log(`  ${colors.yellow}前台 (访客):${colors.reset} http://localhost:3000`);
        console.log(`  ${colors.yellow}后台 (管理):${colors.reset} http://localhost:3001/admin\n`);
        console.log(`${colors.blue}按 Ctrl+C 停止所有服务${colors.reset}`);
        console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
      }
    });

    frontend.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Error') || output.includes('error')) {
        console.error(`${colors.red}  [前台错误] ${output}${colors.reset}`);
      }
    });

    processes.push({ name: '前台', process: frontend });
  }, 3000);

  // 优雅退出
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}正在停止所有服务...${colors.reset}`);
    processes.forEach(({ name, process }) => {
      process.kill();
      console.log(`${colors.green}  ✓ ${name}服务已停止${colors.reset}`);
    });
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    processes.forEach(({ process }) => process.kill());
    process.exit(0);
  });
}
