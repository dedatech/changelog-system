// 测试 API 连接
async function testApi() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  console.log('测试后端 API 连接...\n');
  console.log(`API 地址: ${apiUrl}\n`);

  try {
    // 测试 GET 请求
    console.log('1. 测试 GET /api/versions?includeDrafts=true...');
    const response = await fetch(`${apiUrl}/api/versions?includeDrafts=true`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ GET 请求成功');
    console.log(`   返回 ${data.versions?.length || 0} 个版本\n`);

    // 测试 GET 单个版本
    if (data.versions && data.versions.length > 0) {
      const versionId = data.versions[0].id;
      console.log(`2. 测试 GET /api/versions?id=${versionId}...`);
      const getOneResponse = await fetch(`${apiUrl}/api/versions?id=${versionId}`);

      if (!getOneResponse.ok) {
        throw new Error(`HTTP ${getOneResponse.status}: ${getOneResponse.statusText}`);
      }

      const getOneData = await getOneResponse.json();
      console.log('✅ GET 单个版本成功');
      console.log(`   版本: ${getOneData.version.version}\n`);

      // 测试 PUT 请求（更新版本）
      console.log(`3. 测试 PUT /api/versions?id=${versionId}...`);
      const putResponse = await fetch(`${apiUrl}/api/versions?id=${versionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '测试更新-' + Date.now()
        })
      });

      if (!putResponse.ok) {
        const errorData = await putResponse.json();
        throw new Error(`HTTP ${putResponse.status}: ${errorData.error || putResponse.statusText}`);
      }

      console.log('✅ PUT 请求成功\n');
    }

    // 测试 POST 请求
    console.log('4. 测试 POST /api/versions (创建测试版本)...');
    const testVersion = {
      version: '0.0.1-test',
      product: 'JetBrains',
      title: '测试版本',
      status: 'draft',
      updates: [
        {
          id: 'test-1',
          category: 'feature',
          items: [
            { id: 'test-1-1', text: '测试内容' }
          ]
        }
      ]
    };

    const postResponse = await fetch(`${apiUrl}/api/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testVersion)
    });

    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      throw new Error(`HTTP ${postResponse.status}: ${errorData.error || postResponse.statusText}`);
    }

    const postData = await postResponse.json();
    console.log('✅ POST 请求成功');
    console.log(`   创建版本 ID: ${postData.version.id}\n`);

    // 测试 DELETE 请求
    console.log(`5. 测试 DELETE /api/versions?id=${postData.version.id}...`);
    const deleteResponse = await fetch(`${apiUrl}/api/versions?id=${postData.version.id}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(`HTTP ${deleteResponse.status}: ${errorData.error || deleteResponse.statusText}`);
    }

    console.log('✅ DELETE 请求成功\n');

    console.log('✅ 所有 API 测试通过！\n');
    console.log('请确保：');
    console.log('1. 使用 `npm run dev:backend` 启动后台服务');
    console.log('2. 后台运行在 3001 端口');
    console.log('3. 前台使用 `npm run dev:frontend` 启动');

  } catch (error) {
    console.error('❌ API 测试失败:\n');
    console.error(`   ${error.message}\n`);

    console.error('可能的原因：');
    console.error('1. 后台服务未启动');
    console.error('   解决: 运行 `npm run dev:backend`');
    console.error('2. 端口配置错误');
    console.error('   解决: 检查 .env.local 中的 NEXT_PUBLIC_API_URL');
    console.error('3. 使用了静态文件服务而不是动态服务');
    console.error('   解决: 确保使用 `npm run dev:backend` 而不是 `npm run dev:frontend`\n');

    process.exit(1);
  }
}

testApi();
