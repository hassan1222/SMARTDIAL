import React, { useEffect } from 'react'
 
const BotpressChatbot = () => {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js'
    script.async = true
    document.body.appendChild(script)
 
    script.onload = () => {
      window.botpressWebChat.init({
        "composerPlaceholder": "Chat with Smart Dial",
        "botConversationDescription": "Built for Smart Dial",
        "botId": "e319c4f8-7dbc-4c69-a20d-e5c7552e83ec",
        "hostUrl": "https://cdn.botpress.cloud/webchat/v1",
        "messagingUrl": "https://messaging.botpress.cloud",
        "clientId": "e319c4f8-7dbc-4c69-a20d-e5c7552e83ec",
        "webhookId": "340d8fe5-47dd-44d8-959b-9792212328c5",
        "lazySocket": true,
        "themeName": "prism",
        "botName": "Smart Dial",
        "frontendVersion": "v1",
        "useSessionStorage": false,
        "enableConversationDeletion": true,
        "theme": "prism",
        "themeColor": "#2563eb",
        "closeOnEscape": true,
        "enablePersistHistory": false
      })
    }
  }, [])
 
  return <div id="webchat" />
}
 
export default BotpressChatbot;