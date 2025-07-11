import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const INSURANCE_KNOWLEDGE = {
  greetings: [
    "Hello! I'm your insurance assistant. How can I help you today?",
    "Hi there! I'm here to help with all your insurance questions.",
    "Welcome! I'm your AI insurance expert. What would you like to know?"
  ],
  
  topics: {
    "health insurance": {
      keywords: ["health", "medical", "healthcare", "doctor", "hospital", "prescription", "copay", "deductible"],
      responses: [
        "Health insurance helps cover medical expenses. Key terms include: Premium (monthly cost), Deductible (what you pay before coverage kicks in), Copay (fixed amount per visit), and Out-of-pocket maximum (yearly limit on your costs).",
        "There are different types of health plans: HMO (Health Maintenance Organization), PPO (Preferred Provider Organization), EPO (Exclusive Provider Organization), and POS (Point of Service). Each has different network restrictions and cost structures.",
        "Essential health benefits include ambulatory care, emergency services, hospitalization, maternity care, mental health services, prescription drugs, rehabilitative services, laboratory services, preventive care, and pediatric services."
      ]
    },
    
    "auto insurance": {
      keywords: ["car", "auto", "vehicle", "driving", "accident", "collision", "liability"],
      responses: [
        "Auto insurance typically includes: Liability coverage (required in most states), Collision coverage (for damage to your car), Comprehensive coverage (for theft, vandalism, weather damage), and Uninsured/Underinsured motorist coverage.",
        "Factors affecting auto insurance rates include: driving record, age, location, type of vehicle, credit score, coverage amounts, and deductibles. Safe driving and bundling policies can help reduce costs.",
        "After an accident: ensure safety, call police if needed, exchange information, document the scene with photos, contact your insurance company promptly, and avoid admitting fault."
      ]
    },
    
    "home insurance": {
      keywords: ["home", "house", "property", "homeowner", "renters", "dwelling", "fire", "theft"],
      responses: [
        "Homeowners insurance covers: Dwelling (structure), Personal property, Liability protection, Additional living expenses, and Other structures on your property. It protects against perils like fire, theft, vandalism, and weather damage.",
        "Renters insurance covers personal belongings, liability protection, and additional living expenses if your rental becomes uninhabitable. It's separate from your landlord's property insurance.",
        "To determine coverage needs: calculate replacement cost of your home, inventory personal belongings, consider liability risks, and understand your area's natural disaster risks. Review coverage annually."
      ]
    },
    
    "life insurance": {
      keywords: ["life", "death", "beneficiary", "term", "whole", "permanent"],
      responses: [
        "Life insurance provides financial protection for beneficiaries. Types include: Term life (temporary, lower cost), Whole life (permanent with cash value), Universal life (flexible premiums), and Variable life (investment component).",
        "Coverage amount should consider: income replacement needs, debts and final expenses, children's education costs, and spouse's financial needs. A common rule is 10-12 times annual income.",
        "Life insurance applications involve medical underwriting, which may include health questionnaires, medical exams, and sometimes medical records review. Factors affecting rates include age, health, lifestyle, and coverage amount."
      ]
    },
    
    "disability insurance": {
      keywords: ["disability", "income", "sick", "injury", "unable to work"],
      responses: [
        "Disability insurance replaces income if you can't work due to illness or injury. Short-term disability typically covers 3-12 months, while long-term disability can cover until retirement age.",
        "Coverage options include: Own-occupation (can't perform your specific job), Any-occupation (can't perform any job), and Modified own-occupation (combination of both). Benefits typically replace 60-70% of income.",
        "Group disability through employers is often available but may have limitations. Individual policies offer more comprehensive coverage and portability between jobs."
      ]
    },
    
    "travel insurance": {
      keywords: ["travel", "trip", "vacation", "international", "cancellation", "medical"],
      responses: [
        "Travel insurance covers trip cancellation/interruption, medical emergencies abroad, emergency evacuation, lost/delayed baggage, and travel delays. It's especially important for international travel or expensive trips.",
        "Pre-existing medical conditions may be covered if you purchase insurance within a certain timeframe (usually 14-21 days) of your initial trip deposit and meet other requirements.",
        "Consider travel insurance for: expensive trips, international travel (especially to countries with limited healthcare), adventure activities, travel during hurricane season, or if you have health concerns."
      ]
    }
  },
  
  general: [
    "Insurance is a contract that transfers financial risk from you to an insurance company in exchange for premium payments.",
    "Key insurance concepts: Premium (cost), Deductible (your portion), Coverage limit (maximum payout), Exclusions (what's not covered), and Claims (requests for payment).",
    "Tips for choosing insurance: Assess your risks, compare multiple quotes, understand policy terms, consider bundling discounts, review coverage annually, and work with reputable companies.",
    "Common insurance mistakes: Being underinsured, not reading policy details, not updating coverage after life changes, choosing insurance based only on price, and not documenting possessions."
  ]
};

export const InsuranceChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      const greeting = INSURANCE_KNOWLEDGE.greetings[Math.floor(Math.random() * INSURANCE_KNOWLEDGE.greetings.length)];
      setMessages([{
        id: '1',
        text: greeting,
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Check for specific topics
    for (const [topic, data] of Object.entries(INSURANCE_KNOWLEDGE.topics)) {
      if (data.keywords.some(keyword => message.includes(keyword))) {
        return data.responses[Math.floor(Math.random() * data.responses.length)];
      }
    }
    
    // Check for common greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return INSURANCE_KNOWLEDGE.greetings[Math.floor(Math.random() * INSURANCE_KNOWLEDGE.greetings.length)];
    }
    
    // Check for thanks
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! Is there anything else about insurance I can help you with?";
    }
    
    // General insurance information
    if (message.includes('insurance') || message.includes('coverage') || message.includes('policy')) {
      return INSURANCE_KNOWLEDGE.general[Math.floor(Math.random() * INSURANCE_KNOWLEDGE.general.length)];
    }
    
    // Default response
    return "I'd be happy to help with insurance questions! I can provide information about health, auto, home, life, disability, and travel insurance. What specific topic would you like to know about?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full professional-gradient text-white shadow-lg hover:scale-110 transition-all duration-300 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 glass-card transition-all duration-300 z-50 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full accent-gradient flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-sm">Insurance Assistant</CardTitle>
            <Badge variant="secondary" className="text-xs">Online</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[420px] p-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isBot
                        ? 'bg-secondary text-secondary-foreground'
                        : 'professional-gradient text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex space-x-2 mt-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about insurance..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="professional-gradient text-white"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};