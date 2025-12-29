/**
 * Sirah SmartChat - Embeddable AI Chatbot Widget
 * Version: 1.0.0
 * 
 * Usage:
 * <script src="https://your-domain.com/embed/sirah-smartchat.js" 
 *         data-config="/client-config.json"
 *         data-business="/business_info.json">
 * </script>
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.SirahSmartChat) {
    console.warn('Sirah SmartChat already initialized');
    return;
  }

  // Configuration
  const scriptTag = document.currentScript;
  const configUrl = scriptTag?.getAttribute('data-config') || '/client-config.json';
  const businessUrl = scriptTag?.getAttribute('data-business') || '/business_info.json';
  const baseUrl = scriptTag?.src ? new URL(scriptTag.src).origin : '';

  // State
  let config = null;
  let businessInfo = null;
  let isOpen = false;
  let messages = [];
  let chatState = 'idle';
  let leadField = null;
  let pendingLead = {};
  let isTyping = false;
  let currentLang = 'en';

  // DOM Elements
  let container = null;
  let bubble = null;
  let chatWindow = null;

  // Styles
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    .sirah-widget * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .sirah-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 30px -4px rgba(13, 148, 136, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sirah-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 40px -4px rgba(13, 148, 136, 0.5);
    }

    .sirah-bubble:active {
      transform: scale(0.95);
    }

    .sirah-bubble svg {
      width: 24px;
      height: 24px;
      transition: transform 0.3s ease;
    }

    .sirah-bubble.open svg {
      transform: rotate(90deg);
    }

    .sirah-bubble-pulse {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #0d9488;
      animation: sirah-pulse 2s ease-out infinite;
    }

    @keyframes sirah-pulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    @keyframes sirah-slide-up {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes sirah-message-appear {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes sirah-typing-dot {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    .sirah-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      z-index: 999998;
      width: 360px;
      max-width: calc(100vw - 48px);
      height: 500px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      animation: sirah-slide-up 0.3s ease forwards;
    }

    .sirah-window.hidden {
      display: none;
    }

    .sirah-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: white;
    }

    .sirah-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sirah-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .sirah-header-info h3 {
      font-size: 14px;
      font-weight: 600;
    }

    .sirah-header-info p {
      font-size: 11px;
      opacity: 0.85;
    }

    .sirah-header-actions {
      display: flex;
      gap: 8px;
    }

    .sirah-header-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .sirah-header-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .sirah-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sirah-messages::-webkit-scrollbar {
      width: 6px;
    }

    .sirah-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .sirah-messages::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    .sirah-message {
      max-width: 80%;
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.5;
      animation: sirah-message-appear 0.2s ease forwards;
      white-space: pre-wrap;
    }

    .sirah-message.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: white;
      border-radius: 16px 16px 4px 16px;
    }

    .sirah-message.bot {
      align-self: flex-start;
      background: #f3f4f6;
      color: #1f2937;
      border-radius: 16px 16px 16px 4px;
    }

    .sirah-typing {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 12px 16px;
      background: #f3f4f6;
      border-radius: 16px;
      width: fit-content;
      animation: sirah-message-appear 0.2s ease forwards;
    }

    .sirah-typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
      animation: sirah-typing-dot 1.4s ease-in-out infinite;
    }

    .sirah-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .sirah-typing-dot:nth-child(3) { animation-delay: 0.4s; }

    .sirah-input-area {
      padding: 12px 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
    }

    .sirah-input-form {
      display: flex;
      gap: 8px;
    }

    .sirah-input {
      flex: 1;
      padding: 10px 16px;
      border-radius: 24px;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .sirah-input:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }

    .sirah-input::placeholder {
      color: #9ca3af;
    }

    .sirah-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .sirah-send-btn:hover {
      transform: scale(1.05);
    }

    .sirah-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .sirah-consent {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      animation: sirah-message-appear 0.2s ease forwards;
    }

    .sirah-consent-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }

    .sirah-consent-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(13, 148, 136, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sirah-consent-icon svg {
      width: 16px;
      height: 16px;
      color: #0d9488;
    }

    .sirah-consent-text h4 {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .sirah-consent-text p {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
    }

    .sirah-consent-buttons {
      display: flex;
      gap: 8px;
    }

    .sirah-consent-btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
      border: none;
    }

    .sirah-consent-btn.agree {
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: white;
    }

    .sirah-consent-btn.agree:hover {
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
    }

    .sirah-consent-btn.decline {
      background: #f3f4f6;
      color: #4b5563;
    }

    .sirah-consent-btn.decline:hover {
      background: #e5e7eb;
    }

    .sirah-footer {
      padding: 8px 16px;
      text-align: center;
      border-top: 1px solid #f3f4f6;
      background: #fafafa;
    }

    .sirah-footer p {
      font-size: 10px;
      color: #9ca3af;
    }

    @media (max-width: 480px) {
      .sirah-window {
        right: 12px;
        bottom: 80px;
        width: calc(100vw - 24px);
        height: calc(100vh - 100px);
        max-height: none;
      }
      
      .sirah-bubble {
        right: 16px;
        bottom: 16px;
      }
    }
  `;

  // Icons
  const icons = {
    chat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    globe: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
    shield: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
  };

  // Utility functions
  function generateId() {
    return Math.random().toString(36).substring(2, 9);
  }

  function getLocalizedText(text, lang) {
    if (typeof text === 'string') return text;
    return text[lang] || text.en || '';
  }

  function normalizeText(text) {
    return text.toLowerCase().trim();
  }

  function getLabels() {
    return config?.labels?.[currentLang] || config?.labels?.en || {};
  }

  // Chat logic
  function detectLeadIntent(message) {
    if (!businessInfo?.intents) return null;
    const normalized = normalizeText(message);
    
    for (const [intentName, intent] of Object.entries(businessInfo.intents)) {
      for (const keyword of intent.keywords) {
        if (normalized.includes(normalizeText(keyword))) {
          return intentName;
        }
      }
    }
    return null;
  }

  function findFAQMatch(message) {
    if (!businessInfo?.faq) return null;
    const normalized = normalizeText(message);
    
    for (const faq of businessInfo.faq) {
      const question = getLocalizedText(faq.q, currentLang).toLowerCase();
      const words = question.split(/\s+/).filter(w => w.length > 3);
      
      let matchCount = 0;
      for (const word of words) {
        if (normalized.includes(word)) matchCount++;
      }
      
      if (matchCount >= 2 || (words.length <= 3 && matchCount >= 1)) {
        return getLocalizedText(faq.a, currentLang);
      }
    }
    return null;
  }

  function findServiceInfo(message) {
    if (!businessInfo?.services) return null;
    const normalized = normalizeText(message);
    
    for (const service of businessInfo.services) {
      const serviceName = getLocalizedText(service.name, currentLang).toLowerCase();
      if (serviceName.split(' ').some(word => normalized.includes(word) && word.length > 3)) {
        const name = getLocalizedText(service.name, currentLang);
        const desc = getLocalizedText(service.description, currentLang);
        
        if (currentLang === 'ta') {
          return `ஆம், நாங்கள் ${name} வழங்குகிறோம். ${desc}. இந்த சேவையைப் பற்றி மேலும் அறிய விரும்புகிறீர்களா?`;
        }
        return `Yes, we offer ${name}. ${desc}. Would you like to know more about this service?`;
      }
    }
    return null;
  }

  function findDoctorInfo(message) {
    if (!businessInfo?.doctors) return null;
    const normalized = normalizeText(message);
    const doctorKeywords = ['doctor', 'dr', 'dentist', 'specialist', 'மருத்துவர்', 'டாக்டர்'];
    
    if (doctorKeywords.some(keyword => normalized.includes(keyword))) {
      const doctorList = businessInfo.doctors.map(d => {
        const spec = getLocalizedText(d.specialization, currentLang);
        return `${d.name} - ${spec} (${d.experience})`;
      }).join('\n');
      
      if (currentLang === 'ta') return `எங்கள் மருத்துவர்கள்:\n${doctorList}`;
      return `Our doctors:\n${doctorList}`;
    }
    return null;
  }

  function generateFallbackResponse() {
    const name = businessInfo?.businessName || 'our business';
    
    if (currentLang === 'ta') {
      return `${name}-க்கு வருகை தந்தமைக்கு நன்றி! உங்கள் கேள்வியைப் புரிந்துகொள்ள முடியவில்லை. எங்கள் சேவைகள், நேரம் அல்லது சந்திப்பு பற்றி கேட்கலாமா?`;
    }
    return `Thanks for reaching out to ${name}! I'm not sure I understood your question. Could you ask about our services, timings, or booking an appointment?`;
  }

  function addMessage(role, content) {
    const message = { id: generateId(), role, content, timestamp: new Date() };
    messages.push(message);
    renderMessages();
    return message;
  }

  async function simulateTyping(delay = 800) {
    isTyping = true;
    renderMessages();
    await new Promise(resolve => setTimeout(resolve, delay));
    isTyping = false;
  }

  async function processMessage(userMessage) {
    addMessage('user', userMessage);
    await simulateTyping();

    const labels = getLabels();

    // Handle lead collection flow
    if (chatState === 'collecting-lead') {
      if (leadField === 'name') {
        pendingLead.name = userMessage;
        leadField = 'phone';
        addMessage('bot', labels.phoneLabel || 'Your phone number?');
        return;
      }
      
      if (leadField === 'phone') {
        const phoneRegex = /[\d\s\-+()]{8,}/;
        if (!phoneRegex.test(userMessage)) {
          addMessage('bot', currentLang === 'ta' 
            ? 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்.' 
            : 'Please enter a valid phone number.');
          return;
        }
        pendingLead.phone = userMessage;
        leadField = 'email';
        addMessage('bot', labels.emailLabel || 'Email (optional, press enter to skip)?');
        return;
      }
      
      if (leadField === 'email') {
        const email = userMessage.toLowerCase().trim();
        if (email && email !== 'skip' && !email.includes('@')) {
          addMessage('bot', currentLang === 'ta'
            ? 'சரியான மின்னஞ்சலை உள்ளிடவும் அல்லது தவிர்க்க "skip" என்று தட்டச்சு செய்யவும்.'
            : 'Please enter a valid email or type "skip" to continue.');
          return;
        }
        
        if (email && email !== 'skip' && email.includes('@')) {
          pendingLead.email = email;
        }
        
        leadField = null;
        
        if (config?.requireConsent) {
          chatState = 'consent-pending';
          addMessage('bot', `${labels.consentTitle || 'Before we continue'}\n\n${labels.consentMessage || 'We\'d like to save your contact details to assist you better.'}`);
          renderConsentPrompt();
        } else {
          await submitLead();
        }
        return;
      }
    }

    // Check for FAQ match
    const faqMatch = findFAQMatch(userMessage);
    if (faqMatch) {
      addMessage('bot', faqMatch);
      return;
    }

    // Check for service info
    const serviceMatch = findServiceInfo(userMessage);
    if (serviceMatch) {
      addMessage('bot', serviceMatch);
      return;
    }

    // Check for doctor info
    const doctorMatch = findDoctorInfo(userMessage);
    if (doctorMatch) {
      addMessage('bot', doctorMatch);
      return;
    }

    // Check for lead intent
    const intent = detectLeadIntent(userMessage);
    if (intent && businessInfo?.intents?.[intent]) {
      const intentResponse = getLocalizedText(businessInfo.intents[intent].response, currentLang);
      addMessage('bot', intentResponse);
      
      chatState = 'collecting-lead';
      leadField = 'name';
      await simulateTyping(500);
      addMessage('bot', labels.nameLabel || 'May I have your name?');
      return;
    }

    // Handle working hours
    const hoursKeywords = ['timing', 'time', 'hour', 'open', 'close', 'when', 'நேரம்', 'திறப்பு'];
    if (hoursKeywords.some(k => normalizeText(userMessage).includes(k))) {
      addMessage('bot', getLocalizedText(businessInfo?.workingHours || '', currentLang));
      return;
    }

    // Handle location
    const locationKeywords = ['where', 'location', 'address', 'direction', 'எங்கே', 'முகவரி'];
    if (locationKeywords.some(k => normalizeText(userMessage).includes(k))) {
      addMessage('bot', businessInfo?.location || 'Location not available.');
      return;
    }

    // Handle contact
    const contactKeywords = ['contact', 'phone', 'call', 'email', 'தொடர்பு', 'அழைப்பு'];
    if (contactKeywords.some(k => normalizeText(userMessage).includes(k))) {
      const response = currentLang === 'ta'
        ? `எங்களை தொடர்பு கொள்ளவும்:\n📞 ${businessInfo?.phone || ''}\n📧 ${businessInfo?.email || ''}`
        : `Contact us at:\n📞 ${businessInfo?.phone || ''}\n📧 ${businessInfo?.email || ''}`;
      addMessage('bot', response);
      return;
    }

    // Fallback response
    addMessage('bot', generateFallbackResponse());
  }

  async function submitLead() {
    const labels = getLabels();
    const leadData = {
      name: pendingLead.name || '',
      phone: pendingLead.phone || '',
      email: pendingLead.email || '',
      source: 'Sirah SmartChat',
      timestamp: new Date().toISOString(),
      businessName: businessInfo?.businessName || ''
    };

    // Submit to Google Form if configured
    if (config?.mode === 'hybrid' && config?.googleFormEndpoint && config.googleFormEndpoint !== 'REPLACE_WITH_CLIENT_FORM_URL') {
      try {
        const formData = new FormData();
        Object.entries(leadData).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });

        await fetch(config.googleFormEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        });
      } catch (error) {
        console.error('Lead submission failed:', error);
      }
    }

    chatState = 'lead-submitted';
    pendingLead = {};
    addMessage('bot', labels.thankYou || 'Thank you! We\'ll be in touch soon.');
    renderInputArea();
  }

  function handleConsent(agreed) {
    const consentArea = chatWindow?.querySelector('.sirah-consent');
    if (consentArea) consentArea.remove();
    
    if (agreed) {
      submitLead();
    } else {
      chatState = 'idle';
      pendingLead = {};
      const response = currentLang === 'ta'
        ? 'பரவாயில்லை! உங்கள் கேள்விகளுக்கு உதவ நான் இங்கே இருக்கிறேன்.'
        : 'No problem! I\'m here to help with any questions you have.';
      addMessage('bot', response);
    }
    renderInputArea();
  }

  // Render functions
  function renderMessages() {
    const messagesContainer = chatWindow?.querySelector('.sirah-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = messages.map(msg => `
      <div class="sirah-message ${msg.role}">${escapeHtml(msg.content)}</div>
    `).join('');

    if (isTyping) {
      messagesContainer.innerHTML += `
        <div class="sirah-typing">
          <span class="sirah-typing-dot"></span>
          <span class="sirah-typing-dot"></span>
          <span class="sirah-typing-dot"></span>
        </div>
      `;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function renderConsentPrompt() {
    const inputArea = chatWindow?.querySelector('.sirah-input-area');
    if (!inputArea) return;

    const labels = getLabels();
    
    inputArea.innerHTML = `
      <div class="sirah-consent">
        <div class="sirah-consent-header">
          <div class="sirah-consent-icon">${icons.shield}</div>
          <div class="sirah-consent-text">
            <h4>${labels.consentTitle || 'Before we continue'}</h4>
            <p>${labels.consentMessage || 'We\'d like to save your contact details to assist you better.'}</p>
          </div>
        </div>
        <div class="sirah-consent-buttons">
          <button class="sirah-consent-btn agree" onclick="window.SirahSmartChat._handleConsent(true)">
            ${icons.check} ${labels.consentAgree || 'I agree'}
          </button>
          <button class="sirah-consent-btn decline" onclick="window.SirahSmartChat._handleConsent(false)">
            ${icons.x} ${labels.consentDecline || 'No thanks'}
          </button>
        </div>
      </div>
    `;
  }

  function renderInputArea() {
    const inputArea = chatWindow?.querySelector('.sirah-input-area');
    if (!inputArea) return;

    const labels = getLabels();
    const disabled = chatState === 'consent-pending';

    inputArea.innerHTML = `
      <form class="sirah-input-form" onsubmit="window.SirahSmartChat._handleSubmit(event)">
        <input 
          type="text" 
          class="sirah-input" 
          placeholder="${labels.placeholder || 'Type your message...'}"
          ${disabled ? 'disabled' : ''}
        />
        <button type="submit" class="sirah-send-btn" ${disabled ? 'disabled' : ''}>
          ${icons.send}
        </button>
      </form>
    `;

    if (!disabled) {
      const input = inputArea.querySelector('.sirah-input');
      input?.focus();
    }
  }

  function renderChatWindow() {
    const labels = getLabels();
    
    chatWindow = document.createElement('div');
    chatWindow.className = 'sirah-window' + (isOpen ? '' : ' hidden');
    chatWindow.innerHTML = `
      <div class="sirah-header">
        <div class="sirah-header-left">
          <div class="sirah-header-avatar">💬</div>
          <div class="sirah-header-info">
            <h3>${config?.botName || 'Sirah SmartChat'}</h3>
            <p>${businessInfo?.businessName || ''}</p>
          </div>
        </div>
        <div class="sirah-header-actions">
          ${config?.enableTamil ? `
            <button class="sirah-header-btn" onclick="window.SirahSmartChat._toggleLanguage()" title="${currentLang === 'en' ? 'Switch to Tamil' : 'Switch to English'}">
              ${icons.globe}
            </button>
          ` : ''}
          <button class="sirah-header-btn" onclick="window.SirahSmartChat._toggle()">
            ${icons.close}
          </button>
        </div>
      </div>
      <div class="sirah-messages"></div>
      <div class="sirah-input-area"></div>
      <div class="sirah-footer">
        <p>${labels.poweredBy || 'Powered by Sirah SmartChat'}</p>
      </div>
    `;

    container.appendChild(chatWindow);
    renderInputArea();
    
    // Add welcome message if first open
    if (messages.length === 0 && config?.welcomeMessage) {
      const welcomeMsg = getLocalizedText(config.welcomeMessage, currentLang);
      addMessage('bot', welcomeMsg);
    } else {
      renderMessages();
    }
  }

  function renderBubble() {
    bubble = document.createElement('button');
    bubble.className = 'sirah-bubble';
    bubble.innerHTML = `
      <span class="sirah-bubble-pulse"></span>
      ${icons.chat}
    `;
    bubble.onclick = toggle;
    container.appendChild(bubble);
  }

  function toggle() {
    isOpen = !isOpen;
    
    bubble.classList.toggle('open', isOpen);
    bubble.innerHTML = isOpen ? icons.close : `<span class="sirah-bubble-pulse"></span>${icons.chat}`;
    
    if (chatWindow) {
      chatWindow.classList.toggle('hidden', !isOpen);
      if (isOpen) {
        const input = chatWindow.querySelector('.sirah-input');
        input?.focus();
      }
    }
  }

  function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    
    // Re-render chat window with new language
    if (chatWindow) {
      chatWindow.remove();
      renderChatWindow();
      chatWindow.classList.toggle('hidden', !isOpen);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const input = chatWindow?.querySelector('.sirah-input');
    const message = input?.value?.trim();
    
    if (message) {
      input.value = '';
      processMessage(message);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize
  async function init() {
    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create container
    container = document.createElement('div');
    container.className = 'sirah-widget';
    document.body.appendChild(container);

    // Load configuration
    try {
      const configPath = configUrl.startsWith('http') ? configUrl : baseUrl + configUrl;
      const businessPath = businessUrl.startsWith('http') ? businessUrl : baseUrl + businessUrl;

      const [configRes, businessRes] = await Promise.all([
        fetch(configPath),
        fetch(businessPath)
      ]);

      if (!configRes.ok || !businessRes.ok) {
        throw new Error('Failed to load configuration files');
      }

      config = await configRes.json();
      businessInfo = await businessRes.json();
      currentLang = config.language || 'en';

      // Render widgets
      renderBubble();
      renderChatWindow();

      console.log('Sirah SmartChat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sirah SmartChat:', error);
    }
  }

  // Public API
  window.SirahSmartChat = {
    init,
    open: () => { if (!isOpen) toggle(); },
    close: () => { if (isOpen) toggle(); },
    _toggle: toggle,
    _toggleLanguage: toggleLanguage,
    _handleSubmit: handleSubmit,
    _handleConsent: handleConsent
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
