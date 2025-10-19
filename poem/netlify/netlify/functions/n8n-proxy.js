exports.handler = async (event, context) => {
  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 解析请求体
    const requestBody = JSON.parse(event.body);
    console.log('代理收到的消息:', requestBody);

    // n8n webhook URL
    const n8nWebhookUrl = 'https://yufengsun.app.n8n.cloud/webhook/943cda27-bfbc-46e9-a51a-f4e2260d88e1';

    // 转发请求到n8n
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    // 获取响应内容
    const responseText = await response.text();
    
    console.log('n8n响应状态:', response.status);
    console.log('n8n响应内容:', responseText);

    // 返回响应给客户端
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: responseText || JSON.stringify({ message: '请求已发送到n8n' })
    };

  } catch (error) {
    console.error('代理错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: '代理服务错误',
        message: error.message 
      })
    };
  }
};