<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const aiAvatar = new URL('../assets/mowanlingzhu.jpeg', import.meta.url).href
// 根据环境选择Webhook URL
const isDevelopment = import.meta.env.DEV
const n8nWebhookUrl = isDevelopment 
  ? '/api/n8n/webhook-test/943cda27-bfbc-46e9-a51a-f4e2260d88e1'
  : '/.netlify/functions/n8n-proxy'

const isOpen = ref(false)
const position = ref({ x: 50, y: 50 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)

// 拖拽功能
const startDrag = (e) => {
  isDragging.value = true
  const rect = e.currentTarget.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  e.preventDefault()
}

const onDrag = (e) => {
  if (!isDragging.value) return
  
  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y
  
  // 限制在窗口范围内
  const maxX = window.innerWidth - 60
  const maxY = window.innerHeight - 60
  
  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY))
  }
}

const stopDrag = () => {
  isDragging.value = false
}

// 点击打开/关闭聊天窗口
const toggleChat = () => {
  isOpen.value = !isOpen.value
}

// 关闭聊天窗口
const closeChat = () => {
  isOpen.value = false
}

// 处理全局事件
onMounted(() => {
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})

// 模拟AI回复（当n8n不可用时使用）
const getMockAIResponse = (message) => {
  const responses = {
    '你好': '您好！我是AI诗词助手，很高兴为您服务！',
    'hello': 'Hello! I am an AI poetry assistant, nice to meet you!',
    '诗词': '我可以帮您解析诗词意境、推荐相关作品、解答创作技巧。请告诉我您想了解哪方面的内容？',
    '李白': '李白（701年－762年），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。',
    '杜甫': '杜甫（712年－770年），字子美，自号少陵野老，唐代伟大的现实主义诗人，被尊为"诗圣"。',
    '唐诗': '唐代是中国古典诗歌的黄金时代，代表诗人有李白、杜甫、白居易、王维等。',
    '宋词': '宋词是宋代盛行的一种文学体裁，代表词人有苏轼、李清照、辛弃疾、柳永等。'
  }
  
  // 简单关键词匹配
  for (const [key, response] of Object.entries(responses)) {
    if (message.includes(key)) {
      return response
    }
  }
  
  // 默认回复
  return `感谢您的消息："${message}"。目前AI服务正在维护中，我将尽快为您提供更专业的诗词分析服务。`
}

// 发送消息到n8n工作流
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message) return
  
  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    type: 'user',
    content: message,
    timestamp: new Date()
  })
  
  userInput.value = ''
  isLoading.value = true
  
  try {
    console.log('正在发送消息到n8n:', message)
    console.log('Webhook URL:', n8nWebhookUrl)
    
    // 发送到n8n工作流
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message,
        timestamp: new Date().toISOString(),
        sessionId: 'user-session-' + Date.now()
      })
    })
    
    console.log('响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      // 如果n8n不可用，使用模拟回复
      console.log('n8n服务不可用，使用模拟回复')
      const mockResponse = getMockAIResponse(message)
      
      messages.value.push({
        id: Date.now() + 1,
        type: 'ai',
        content: mockResponse,
        timestamp: new Date()
      })
      return
    }
    
    // 检查响应内容
    const responseText = await response.text()
    console.log('=== n8n响应详细信息 ===')
    console.log('响应状态:', response.status, response.statusText)
    console.log('响应头:', Object.fromEntries(response.headers.entries()))
    console.log('响应文本长度:', responseText.length)
    console.log('响应文本内容:', responseText)
    console.log('响应文本类型:', typeof responseText)
    
    let data = {}
    if (responseText) {
      try {
        data = JSON.parse(responseText)
        console.log('n8n解析后的数据:', data)
        console.log('数据字段:', Object.keys(data))
      } catch (parseError) {
        console.error('JSON解析错误:', parseError)
        console.error('解析错误的文本:', responseText)
        // 如果解析失败，使用响应文本作为回复
        data = { response: responseText }
      }
    }
    
    // 处理AI回复中的换行符
    const aiResponse = data.response || data.message || data.answer || responseText || '收到您的消息，正在处理中...'
    const formattedResponse = aiResponse.replace(/
/g, '<br>')
    
    // 添加AI回复
    messages.value.push({
      id: Date.now() + 1,
      type: 'ai',
      content: formattedResponse,
      timestamp: new Date(),
      isHtml: true  // 标记为HTML内容
    })
    
  } catch (error) {
    console.error('发送消息失败:', error)
    
    // 使用模拟回复而不是显示错误信息
    const mockResponse = getMockAIResponse(message)
    
    messages.value.push({
      id: Date.now() + 1,
      type: 'ai',
      content: mockResponse,
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
  }
}

// 处理回车键发送
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <!-- 悬浮按钮 -->
  <div 
    class="ai-widget-button"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
      transform: isDragging ? 'scale(1.1)' : 'scale(1)'
    }"
    @mousedown="startDrag"
    @click="toggleChat"
  >
    <div class="chat-bubble">
      <span class="bubble-text">与AI交流心得</span>
      <div class="bubble-tail"></div>
    </div>
    <div class="ai-avatar" :style="{ backgroundImage: 'url(' + aiAvatar + ')' }"></div>
  </div>

  <!-- 聊天窗口 -->
  <div v-if="isOpen" class="ai-chat-window">
    <div class="chat-header">
      <div class="header-content">
        <div class="ai-avatar small" :style="{ backgroundImage: 'url(' + aiAvatar + ')' }"></div>
        <div class="header-text">
          <h3>AI诗词助手</h3>
          <span class="status">在线</span>
        </div>
      </div>
      <button class="close-btn" @click="closeChat">×</button>
    </div>
    
    <div class="chat-body">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="message-bubble ai-message">
          <div class="message-avatar" :style="{ backgroundImage: 'url(' + aiAvatar + ')' }"></div>
          <div class="message-content">
            <p>您好！我是AI诗词助手，可以帮您：</p>
            <ul>
              <li>解析诗词意境和背景</li>
              <li>推荐相关诗词作品</li>
              <li>解答诗词创作技巧</li>
              <li>交流诗词鉴赏心得</li>
            </ul>
            <p>请随时向我提问！</p>
          </div>
        </div>
      </div>
      
      <!-- 消息列表 -->
      <div v-else class="messages-container">
        <div 
          v-for="msg in messages" 
          :key="msg.id"
          :class="['message-bubble', msg.type === 'user' ? 'user-message' : 'ai-message']"
        >
          <div v-if="msg.type === 'ai'" class="message-avatar" :style="{ backgroundImage: 'url(' + aiAvatar + ')' }"></div>
          <div class="message-content" v-html="msg.content"></div>
          <div v-if="msg.type === 'user'" class="message-avatar user-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" class="message-bubble ai-message">
          <div class="message-avatar" :style="{ backgroundImage: 'url(' + aiAvatar + ')' }"></div>
          <div class="message-content loading">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chat-input-container">
      <div class="input-wrapper">
        <input 
          type="text" 
          placeholder="输入您的问题..." 
          class="chat-input"
          v-model="userInput"
          @keypress="handleKeyPress"
          :disabled="isLoading"
        />
        <button class="send-btn" @click="sendMessage">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-widget-button {
  position: fixed;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  border: 3px solid white;
  transition: all 0.3s ease;
  z-index: 1000;
  user-select: none;
}

.ai-widget-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

.ai-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ai-avatar.small {
  width: 40px;
  height: 40px;
  border: 2px solid white;
}

.chat-bubble {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.chat-bubble::before {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
}

.ai-widget-button:hover .chat-bubble {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

.bubble-text {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

/* 聊天窗口样式 */
.ai-chat-window {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status {
  font-size: 12px;
  opacity: 0.8;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8f9fa;
}

.welcome-message {
  margin-bottom: 16px;
}

.message-bubble {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.message-bubble {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-bubble.ai-message {
  flex-direction: row;
}

.message-bubble.user-message {
  flex-direction: row-reverse;
}

.message-bubble.ai-message .message-content {
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex: 1;
  max-width: 80%;
  word-wrap: break-word;
}

.message-bubble.user-message .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px;
  border-radius: 12px;
  flex: 1;
  max-width: 80%;
  word-wrap: break-word;
}

.message-bubble.ai-message .message-content p {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.message-bubble.ai-message .message-content ul {
  margin: 8px 0;
  padding-left: 16px;
}

.message-bubble.ai-message .message-content li {
  font-size: 13px;
  line-height: 1.4;
  color: #666;
  margin-bottom: 4px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

/* 加载动画 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.messages-container {
  padding-bottom: 16px;
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.chat-input-container {
  padding: 16px;
  border-top: 1px solid #e9ecef;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-input {
  flex: 1;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.chat-input:focus {
  border-color: #667eea;
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.send-btn:hover {
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-chat-window {
    width: calc(100vw - 40px);
    height: 70vh;
    right: 20px;
    left: 20px;
    bottom: 20px;
  }
  
  .ai-widget-button {
    width: 50px;
    height: 50px;
  }
}
</style>