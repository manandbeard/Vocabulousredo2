import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw, Zap, Target, BarChart3, Users, Clock, BookOpen, GraduationCap, Star, CheckCircle2, Award, Menu, X } from 'lucide-react';
import EtherealBg from '@/components/EtherealBg';

function LandingNav() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const links = [
    { label: 'Science', id: 'science' },
    { label: 'Teachers', id: 'teachers' },
    { label: 'Students', id: 'students' },
    { label: 'Pricing', id: 'pricing' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel" data-testid="landing-nav">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }}>
            <BookOpen className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-xl font-bold text-on-surface tracking-tight">Vocabulous</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button key={l.id} onClick={() => scrollTo(l.id)} className="btn-ghost text-sm">{l.label}</button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-ghost text-sm" data-testid="nav-signin-btn">Sign In</button>
          <button onClick={() => navigate('/signup')} className="btn-primary text-sm py-2.5 px-5" data-testid="nav-signup-btn">Get Started</button>
        </div>

        <button className="md:hidden p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-2">
          {links.map((l) => (
            <button key={l.id} onClick={() => scrollTo(l.id)} className="w-full text-left py-2 px-4 rounded-full text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high">{l.label}</button>
          ))}
          <div className="flex gap-2 mt-2">
            <button onClick={() => navigate('/login')} className="btn-ghost flex-1 text-sm">Sign In</button>
            <button onClick={() => navigate('/signup')} className="btn-primary flex-1 text-sm py-2.5">Get Started</button>
          </div>
        </div>
      )}
    </nav>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface min-h-screen relative">
      <EtherealBg />
      <LandingNav />

      {/* Hero */}
      <section className="relative z-10 py-24 md:py-36 px-6">
        <motion.div className="max-w-5xl mx-auto text-center" variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 label-md text-primary mb-6 bg-primary/8 px-4 py-2 rounded-full">
            <RefreshCw className="w-3.5 h-3.5" /> Science-Backed Learning
          </motion.div>
          <motion.h1 variants={fadeUp} className="display-lg text-on-surface mb-6">
            Make learning stick,{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">not slip away</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="body-lg max-w-2xl mx-auto mb-10">
            Vocabulous uses science-backed spaced retrieval and adaptive review to help you actually remember what you learn. Built for students and teachers.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => navigate('/signup')} className="btn-primary flex items-center gap-2 text-base py-4 px-8" data-testid="hero-get-started-btn">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary flex items-center gap-2 text-base py-4 px-8" data-testid="hero-signin-btn">
              Sign In
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Band */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { value: '87%', label: 'Long-term retention', color: 'primary' },
            { value: '94%', label: 'Active weekly users', color: 'secondary' },
            { value: '<200ms', label: 'Lightning fast sync', color: 'tertiary' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-surface-container-lowest rounded-[2rem] p-8 text-center shadow-ambient card-ethereal"
              data-testid={`stat-card-${i}`}
            >
              <p className={`text-4xl font-extrabold tracking-tight mb-2 ${stat.color === 'primary' ? 'text-primary' : stat.color === 'secondary' ? 'text-secondary' : 'text-tertiary'}`}>
                {stat.value}
              </p>
              <p className="label-md">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Science Section */}
      <section id="science" className="relative z-10 py-24 px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="label-md text-primary mb-4 block">Cognitive Science</span>
              <h2 className="headline-lg text-on-surface mb-5">The forgetting curve is real. We fix it.</h2>
              <p className="body-lg mb-6">
                Without review, the average person forgets 70% of new material within 24 hours. Vocabulous schedules reviews at exactly the right moment — just before you forget.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: RefreshCw, label: 'Spaced Repetition', bg: 'bg-primary/10', text: 'text-primary' },
                  { icon: Zap, label: 'Active Recall', bg: 'bg-secondary/10', text: 'text-secondary' },
                  { icon: Target, label: 'Adaptive Review', bg: 'bg-tertiary/10', text: 'text-tertiary' },
                ].map(({ icon: Icon, label, bg, text }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
                      <Icon className={`w-5 h-5 ${text}`} />
                    </div>
                    <span className="label-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-ambient">
              <p className="label-sm text-on-surface-variant mb-4">Review Interval Growth</p>
              <div className="flex items-end gap-2 h-32 mb-4">
                {[
                  { label: 'Day 1', h: '20%', from: '#c4aee6', to: '#8b6cc1' },
                  { label: 'Day 3', h: '35%', from: '#8b6cc1', to: '#a88bc6' },
                  { label: 'Day 7', h: '52%', from: '#a88bc6', to: '#e8a87c' },
                  { label: 'Day 14', h: '68%', from: '#e8a87c', to: '#d49575' },
                  { label: 'Day 30', h: '82%', from: '#d49575', to: '#7cc5a8' },
                  { label: 'Mastered', h: '100%', from: '#7cc5a8', to: '#5ba88a' },
                ].map(({ label, h, from, to }) => (
                  <div key={label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <div className="w-full rounded-full" style={{ height: h, background: `linear-gradient(to top, ${from}, ${to})` }} />
                    <span className="label-sm text-[10px]">{label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-primary/5 rounded-full px-5 py-3">
                <p className="text-sm text-on-surface-variant">Each review compounds into <span className="font-bold text-primary">permanent knowledge</span></p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Teachers Section */}
      <section id="teachers" className="relative z-10 py-24 px-6 bg-surface-container-low scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="label-md text-primary mb-4 inline-block">For Teachers</span>
            <h2 className="headline-lg text-on-surface mb-4">Built for the classroom</h2>
            <p className="body-lg max-w-2xl mx-auto">Real data and simple tools so you spend less time guessing and more time teaching.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Class analytics', desc: 'Track retention, streaks, and quiz performance in real time.', bg: 'bg-secondary/10', text: 'text-secondary' },
              { icon: BookOpen, title: 'Deck builder', desc: 'Create flashcard decks by subject or chapter — no code required.', bg: 'bg-primary/10', text: 'text-primary' },
              { icon: Users, title: 'Multi-class', desc: 'Manage multiple classes. Assign decks and monitor progress.', bg: 'bg-tertiary/10', text: 'text-tertiary' },
              { icon: Target, title: 'Early alerts', desc: 'Get notified when a student falls behind before it becomes a problem.', bg: 'bg-secondary/10', text: 'text-secondary' },
              { icon: GraduationCap, title: 'Curriculum aligned', desc: 'Tag decks by standard to see which learning goals are on track.', bg: 'bg-primary/10', text: 'text-primary' },
              { icon: BarChart3, title: 'Trend analysis', desc: 'View longitudinal performance across weeks and months.', bg: 'bg-tertiary/10', text: 'text-tertiary' },
            ].map(({ icon: Icon, title, desc, bg, text }) => (
              <div key={title} className="bg-surface-container-lowest rounded-[2rem] p-7 shadow-ambient card-ethereal">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} mb-5`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">{title}</h3>
                <p className="body-md text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Students Section */}
      <section id="students" className="relative z-10 py-24 px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="label-md text-secondary mb-4 inline-block">For Students</span>
            <h2 className="headline-lg text-on-surface mb-4">Learn smarter, not harder</h2>
            <p className="body-lg max-w-2xl mx-auto">Stop cramming. Build lasting memory through short, consistent practice from day one.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Smart sessions', desc: 'Only surfaces cards you\'re about to forget.', bg: 'bg-secondary/10', text: 'text-secondary' },
              { icon: BarChart3, title: 'Progress tracking', desc: 'See mastery, streaks, and growth at a glance.', bg: 'bg-primary/10', text: 'text-primary' },
              { icon: Award, title: 'Achievements', desc: 'Stay motivated with badges and personal bests.', bg: 'bg-tertiary/10', text: 'text-tertiary' },
              { icon: Clock, title: 'Micro-sessions', desc: '5-minute bursts that fit between classes.', bg: 'bg-secondary/10', text: 'text-secondary' },
              { icon: Target, title: 'Adaptive difficulty', desc: 'Algorithm adjusts to your memory patterns.', bg: 'bg-primary/10', text: 'text-primary' },
              { icon: Star, title: 'Learning lab', desc: 'Multiple question types to deepen recall.', bg: 'bg-tertiary/10', text: 'text-tertiary' },
            ].map(({ icon: Icon, title, desc, bg, text }) => (
              <div key={title} className="bg-surface-container-lowest rounded-[2rem] p-7 shadow-ambient card-ethereal">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} mb-5`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">{title}</h3>
                <p className="body-md text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6 bg-surface-container-low scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="label-md text-primary mb-4 inline-block">Pricing</span>
            <h2 className="headline-lg text-on-surface mb-4">Simple, honest pricing</h2>
            <p className="body-lg max-w-xl mx-auto">Start free and upgrade as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', period: 'forever', desc: 'For individual learners.', features: ['Up to 3 decks', '100 cards per deck', 'Basic spaced repetition', 'Progress dashboard'], highlighted: false },
              { name: 'Pro', price: '$6', period: '/month', desc: 'For serious learners.', features: ['Unlimited decks & cards', 'Advanced algorithm', 'All question types', 'Detailed analytics', 'Achievements'], highlighted: true },
              { name: 'School', price: 'Custom', period: '/institution', desc: 'Built for classrooms.', features: ['Everything in Pro', 'Teacher dashboard', 'Multi-class management', 'Early-struggle alerts', 'Dedicated support'], highlighted: false },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-[2rem] p-8 flex flex-col gap-6 card-ethereal ${
                  tier.highlighted
                    ? 'bg-surface-container-lowest shadow-glow relative'
                    : 'bg-surface-container-lowest shadow-ambient'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="label-sm text-white px-4 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }}>Most Popular</span>
                  </div>
                )}
                <div>
                  <p className="label-md text-on-surface-variant mb-2">{tier.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-on-surface tracking-tight">{tier.price}</span>
                    <span className="text-sm text-on-surface-variant">{tier.period}</span>
                  </div>
                  <p className="body-md text-sm mt-1">{tier.desc}</p>
                </div>
                <ul className="flex flex-col gap-2.5 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-on-surface">
                      <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className={tier.highlighted ? 'btn-primary w-full' : 'btn-secondary w-full'}
                >
                  {tier.name === 'School' ? 'Contact Us' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 bg-surface-container-low">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }}>
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-on-surface">Vocabulous</span>
          </div>
          <p className="text-sm text-on-surface-variant">2026 Vocabulous. Built with the forgetting curve in mind.</p>
          <div className="flex gap-4">
            <Link to="/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Sign In</Link>
            <Link to="/signup" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
