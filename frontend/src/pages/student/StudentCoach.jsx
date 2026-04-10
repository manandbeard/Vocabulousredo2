import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, BookOpen, Brain, Lightbulb, HelpCircle, Dices, Plus, ChevronLeft, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { coachApi, analyticsApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function MarkdownText({ text }) {
  // Minimal markdown: bold, italic, headers, lists, code
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-bold text-on-surface text-sm mt-3">{line.slice(4)}</h4>;
        if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-on-surface mt-3">{line.slice(3)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold text-on-surface mt-3">{line.slice(2)}</h2>;
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <div key={i} className="flex gap-2 ml-2"><span className="text-primary mt-1 shrink-0">&#8226;</span><span>{renderInline(line.slice(2))}</span></div>;
        }
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\.\s/)[1];
          return <div key={i} className="flex gap-2 ml-2"><span className="text-primary font-bold shrink-0">{num}.</span><span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span></div>;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text) {
  // Bold **text** and `code`
  const parts = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);

    let firstMatch = null;
    let firstIndex = remaining.length;

    if (boldMatch && boldMatch.index < firstIndex) { firstMatch = 'bold'; firstIndex = boldMatch.index; }
    if (codeMatch && codeMatch.index < firstIndex) { firstMatch = 'code'; firstIndex = codeMatch.index; }

    if (!firstMatch) { parts.push(remaining); break; }

    if (firstIndex > 0) parts.push(remaining.slice(0, firstIndex));

    if (firstMatch === 'bold') {
      parts.push(<strong key={key++} className="font-bold text-on-surface">{boldMatch[1]}</strong>);
      remaining = remaining.slice(firstIndex + boldMatch[0].length);
    } else {
      parts.push(<code key={key++} className="bg-surface-container-high px-1.5 py-0.5 rounded-lg text-xs font-mono text-primary">{codeMatch[1]}</code>);
      remaining = remaining.slice(firstIndex + codeMatch[0].length);
    }
  }
  return parts;
}

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'Explain a concept', prompt: 'Can you explain the concept on my most difficult card in a simpler way?' },
  { icon: Brain, label: 'Create a mnemonic', prompt: 'Create a memorable mnemonic to help me remember the cards I struggle with most.' },
  { icon: Dices, label: 'Quiz me', prompt: 'Give me a quick 3-question quiz based on the cards I\'ve been studying.' },
  { icon: HelpCircle, label: 'Study tips', prompt: 'What study strategies would you recommend based on my learning pattern?' },
];

export default function StudentCoach() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [cardContext, setCardContext] = useState(null);
  const [deckContext, setDeckContext] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load card context from search params
  useEffect(() => {
    const cardFront = searchParams.get('cardFront');
    const cardBack = searchParams.get('cardBack');
    const cardHint = searchParams.get('cardHint');
    const deckName = searchParams.get('deckName');
    if (cardFront) setCardContext({ front: cardFront, back: cardBack || '', hint: cardHint || '' });
    if (deckName) setDeckContext({ name: deckName });
  }, [searchParams]);

  // Load conversation history
  useEffect(() => {
    if (!user) return;
    coachApi.listConversations(user.id).then(setConversations).catch(() => []);
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async (convId) => {
    try {
      const convo = await coachApi.getConversation(user.id, convId);
      setConversationId(convId);
      setMessages(convo.messages || []);
      setShowHistory(false);
    } catch (e) { console.error(e); }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const sendMessage = async (text) => {
    if (!text.trim() || sending) return;
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const resp = await coachApi.sendMessage({
        student_id: user.id,
        conversation_id: conversationId,
        message: text,
        card_context: cardContext,
        deck_context: deckContext,
      });
      setConversationId(resp.conversation_id);
      setMessages(prev => [...prev, { role: 'assistant', content: resp.message, timestamp: resp.timestamp }]);
      // Clear card context after first use
      setCardContext(null);
      setDeckContext(null);
      // Refresh conversation list
      coachApi.listConversations(user.id).then(setConversations).catch(() => []);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date().toISOString() }]);
    }
    setSending(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <motion.div className="h-[calc(100vh-120px)] flex flex-col" initial="hidden" animate="show" data-testid="student-coach">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          {showHistory && (
            <button onClick={() => setShowHistory(false)} className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
              <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
            </button>
          )}
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b6cc1, #7cc5a8)' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-on-surface">AI Study Coach</h1>
            <p className="text-xs text-on-surface-variant">Ask me anything about your cards</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHistory(!showHistory)} className="btn-ghost text-xs flex items-center gap-1.5" data-testid="coach-history-btn">
            <Clock className="w-3.5 h-3.5" /> History
          </button>
          <button onClick={startNewConversation} className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3" data-testid="coach-new-btn">
            <Plus className="w-3.5 h-3.5" /> New Chat
          </button>
        </div>
      </motion.div>

      {/* Card context banner */}
      {cardContext && (
        <div className="mb-3 bg-primary/8 rounded-full px-5 py-2.5 flex items-center gap-2 shrink-0" data-testid="coach-card-context">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm text-on-surface truncate">Asking about: <span className="font-bold">{cardContext.front}</span></span>
        </div>
      )}

      {/* History sidebar overlay */}
      {showHistory && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest rounded-[2rem] shadow-float p-5 mb-4 max-h-60 overflow-y-auto" data-testid="coach-history-panel">
          <p className="label-sm text-on-surface-variant mb-3">Recent Conversations</p>
          {conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadConversation(c.id)}
                  data-testid={`coach-convo-${c.id}`}
                  className={`w-full text-left p-3 rounded-2xl transition-all ${conversationId === c.id ? 'bg-primary/10' : 'hover:bg-surface-container-high'}`}
                >
                  <p className="text-sm font-semibold text-on-surface truncate">{c.preview}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{new Date(c.updated_at).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">No previous conversations.</p>
          )}
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0" data-testid="coach-messages">
        {messages.length === 0 && !showHistory && (
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(139,108,193,0.15), rgba(124,197,168,0.15))' }}>
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="headline-md text-on-surface mb-2">How can I help you learn?</h2>
              <p className="body-md text-sm max-w-md">I can explain concepts, create mnemonics, quiz you, or suggest study strategies.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(prompt)}
                  data-testid={`coach-quick-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient p-4 card-ethereal text-left flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-on-surface leading-snug">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-[1.5rem] px-5 py-3.5 ${
                  msg.role === 'user'
                    ? 'text-white text-sm'
                    : 'bg-surface-container-lowest shadow-ambient text-sm text-on-surface-variant'
                }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #8b6cc1, #a88bc6)' } : {}}
                data-testid={`coach-msg-${msg.role}-${i}`}
              >
                {msg.role === 'assistant' ? (
                  <MarkdownText text={msg.content} />
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-surface-container-lowest shadow-ambient rounded-[1.5rem] px-5 py-3.5 flex items-center gap-2" data-testid="coach-typing">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-on-surface-variant">Thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="shrink-0 flex gap-3 pt-3" data-testid="coach-input-form">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your study coach anything..."
          className="input-ethereal flex-1"
          disabled={sending}
          data-testid="coach-input"
          autoFocus
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="btn-primary px-5 flex items-center gap-2 shrink-0"
          data-testid="coach-send-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}
