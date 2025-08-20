const express = require('express')
const router = express.Router()
const { HttpsProxyAgent } = require('https-proxy-agent')

// Resolve ChatAnywhere/OpenAI-compatible settings from env
const API_URL = process.env.CHATANYWHERE_API_URL
  || process.env.OPENAI_API_URL
  || 'https://api.chatanywhere.tech/v1/chat/completions'

const API_KEY = process.env.CHATANYWHERE_API_KEY
  || process.env.OPENAI_API_KEY
  || ''

const DEFAULT_MODEL = process.env.CHATANYWHERE_MODEL
  || process.env.OPENAI_MODEL
  || 'gpt-3.5-turbo'

function buildAgent() {
  const proxy = process.env.AI_HTTPS_PROXY || process.env.HTTPS_PROXY || null
  if (proxy) {
    try {
      return new HttpsProxyAgent(proxy)
    } catch (e) {
      console.warn('Invalid proxy config, ignoring:', proxy)
      return undefined
    }
  }
  return undefined
}

// POST /api/ai/chat
// Forwards body to ChatAnywhere/OpenAI-compatible endpoint with stream=true
router.post('/chat', async (req, res) => {
  try {
    const requestBody = Object.assign({}, req.body || {})
    if (!requestBody.model) {
      requestBody.model = DEFAULT_MODEL
    }
    // Ensure streaming
    requestBody.stream = true

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json'
    }
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`
    }

    const agent = buildAgent()

    // Use global fetch (Node 18+)
    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      agent
    })

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '')
      res.status(upstream.status || 500).json({
        code: -1,
        msg: `Upstream error: ${upstream.status} ${upstream.statusText}`,
        data: text
      })
      return
    }

    // Forward SSE stream
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const reader = upstream.body.getReader()
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        res.write(Buffer.from(value))
      }
    }
    res.end()
  } catch (err) {
    console.error('AI proxy error:', err)
    res.status(500).json({ code: -1, msg: 'AI proxy error', error: String(err && err.message || err) })
  }
})

module.exports = router


