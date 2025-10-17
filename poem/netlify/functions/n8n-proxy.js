// Netlify Function to proxy requests to n8n (解决CORS问题)
exports.handler = async (event, context) => {
  // 只处理POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    const n8nWebhookUrl = 'https://yufengsun.app.n8n.cloud/webhook-test/943cda27-bfbc-46e9-a51a-f4e2260d88e1'
    
    // 转发请求到n8n
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.body
    })

    // 获取n8n的响应
    const responseText = await response.text()
    
    // 返回给前端（添加CORS头）
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: responseText || JSON.stringify({ response: 'n8n返回空响应' })
    }
    
  } catch (error) {
    console.error('Proxy error:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: '代理服务器错误',
        message: error.message 
      })
    }
  }
}