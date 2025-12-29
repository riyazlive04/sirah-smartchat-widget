# Sirah SmartChat - Embeddable Widget

A production-ready, embeddable AI chatbot widget for small and medium businesses.

## Quick Start

Add this single script tag to your website:

```html
<script 
  src="https://your-domain.com/embed/sirah-smartchat.js"
  data-config="/client-config.json"
  data-business="/business_info.json">
</script>
```

That's it! The chat widget will appear in the bottom-right corner of your page.

## Configuration

### Script Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-config` | URL to client configuration JSON | `/client-config.json` |
| `data-business` | URL to business info JSON | `/business_info.json` |

### Example with Custom URLs

```html
<script 
  src="https://your-domain.com/embed/sirah-smartchat.js"
  data-config="https://your-cdn.com/configs/my-business-config.json"
  data-business="https://your-cdn.com/configs/my-business-info.json">
</script>
```

## Configuration Files

### client-config.json

```json
{
  "botName": "Sirah SmartChat",
  "language": "en",
  "enableTamil": true,
  "mode": "hybrid",
  "requireConsent": true,
  "googleFormEndpoint": "YOUR_GOOGLE_FORM_URL",
  "welcomeMessage": {
    "en": "Hi 👋 Welcome! How can I help you today?",
    "ta": "வணக்கம் 👋 நான் எப்படி உதவலாம்?"
  },
  "labels": {
    "en": {
      "placeholder": "Type your message...",
      "send": "Send",
      "poweredBy": "Powered by Sirah SmartChat",
      "consentTitle": "Before we continue",
      "consentMessage": "We'd like to save your contact details.",
      "consentAgree": "I agree",
      "consentDecline": "No thanks",
      "nameLabel": "Your Name",
      "phoneLabel": "Phone Number",
      "emailLabel": "Email (optional)",
      "thankYou": "Thank you! We'll be in touch soon."
    }
  }
}
```

### business_info.json

```json
{
  "businessName": "Your Business Name",
  "businessType": "Your Business Type",
  "location": "Your Address",
  "phone": "+91 1234567890",
  "email": "hello@yourbusiness.com",
  "workingHours": {
    "en": "Monday to Saturday, 9 AM to 6 PM"
  },
  "services": [
    {
      "name": { "en": "Service 1" },
      "description": { "en": "Description of service 1" }
    }
  ],
  "faq": [
    {
      "q": { "en": "Common question?" },
      "a": { "en": "Answer to the question." }
    }
  ],
  "intents": {
    "appointment": {
      "keywords": ["appointment", "book", "schedule"],
      "response": { "en": "I'd be happy to help you schedule an appointment!" }
    }
  }
}
```

## Features

- ✅ **No dependencies** - Works on any website
- ✅ **Lightweight** - Single JavaScript file (~15KB gzipped)
- ✅ **Mobile responsive** - Works on all devices
- ✅ **Multi-language** - English and Tamil support
- ✅ **Lead capture** - Collect name, phone, email with consent
- ✅ **Google Sheets integration** - Save leads via Google Forms
- ✅ **Customizable** - Configure via JSON, no code changes needed
- ✅ **Privacy-first** - No tracking, consent-based data collection

## JavaScript API

The widget exposes a global `SirahSmartChat` object:

```javascript
// Open the chat window
SirahSmartChat.open();

// Close the chat window
SirahSmartChat.close();

// Re-initialize with new config
SirahSmartChat.init();
```

## Google Forms Integration

1. Create a Google Form with fields: Name, Phone, Email, Source, Timestamp, BusinessName
2. Get the form's action URL (from the form HTML)
3. Add it to `client-config.json` as `googleFormEndpoint`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome for Android)

## License

MIT License
