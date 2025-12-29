import { Sparkles, MessageCircle, Shield, Globe, Zap, Settings } from 'lucide-react';

export function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">Sirah SmartChat</span>
          </div>
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            View Docs
          </a>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Production-Ready AI Chatbot
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Intelligent Enquiry Assistant
            <br />
            <span className="text-primary">for Your Business</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            An AI-powered chatbot that answers FAQs, captures leads, and works 24/7. 
            Fully configurable, no backend required, and ready to deploy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20">
              Try the Demo →
            </button>
            <button className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built for small and medium businesses who want a smart, 
            professional chat experience without the complexity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'Instant Responses',
              description: 'AI-powered FAQ matching that answers customer questions in milliseconds.'
            },
            {
              icon: Shield,
              title: 'Privacy First',
              description: 'Consent-based lead capture with no tracking or analytics by default.'
            },
            {
              icon: Globe,
              title: 'Multi-Language',
              description: 'Built-in support for English and Tamil with easy language switching.'
            },
            {
              icon: Settings,
              title: 'Fully Configurable',
              description: 'Change business info, FAQs, and behavior via simple JSON files.'
            },
            {
              icon: MessageCircle,
              title: 'Lead Capture',
              description: 'Smart lead collection that only asks for details when appropriate.'
            },
            {
              icon: Sparkles,
              title: 'No Backend Needed',
              description: 'Runs entirely in the browser. Optional Google Sheets integration.'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Business Card */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-card rounded-3xl border border-border p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
              🦷
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Bright Smile Dental Clinic</h3>
              <p className="text-muted-foreground">Demo Business</p>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Try the chatbot by clicking the chat bubble in the bottom-right corner. 
            Ask about services, timings, appointments, or anything about the dental clinic!
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="text-foreground">Chennai, Tamil Nadu</p>
            </div>
            <div className="p-4 bg-secondary rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">Hours</p>
              <p className="text-foreground">Mon-Sat, 9 AM - 8 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Embed Instructions */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Easy Integration
          </h2>
          <p className="text-muted-foreground">
            Add Sirah SmartChat to any website with a single script tag.
          </p>
        </div>

        <div className="bg-foreground/5 rounded-2xl p-6 font-mono text-sm overflow-x-auto">
          <pre className="text-muted-foreground">
{`<!-- Add to your HTML -->
<script src="https://your-domain.com/sirah-smartchat.js"></script>

<!-- Or use iframe -->
<iframe 
  src="https://your-domain.com/chat" 
  style="position:fixed; bottom:20px; right:20px; 
         width:380px; height:520px; border:none;"
></iframe>`}
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Sirah SmartChat. Built with ❤️ for small businesses.
          </p>
        </div>
      </footer>
    </div>
  );
}
