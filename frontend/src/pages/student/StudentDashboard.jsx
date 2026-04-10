import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Flame, Target, CheckCircle2, BarChart3, Clock, Award, Brain, Zap, Shield, BookOpen, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi } from '@/lib/api';

function DonutRing({ percent, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const arc = (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceaee" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#donutGrad)" strokeWidth={5}
        strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <defs>
        <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b6cc1" />
          <stop offset="100%" stopColor="#e8a87c" />
        </linearGradient>
      </defs>
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize={size * 0.22} fontWeight="700" fill="#2e2e32">{percent}%</text>
    </svg>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [persona, setPersona] = useState(null);
  const [studyTime, setStudyTime] = useState(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState([]);
  const [classes, setClasses] = useState([]);
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const id = user.id;
    Promise.all([
      analyticsApi.student(id).catch(() => null),
      analyticsApi.persona(id).catch(() => null),
      analyticsApi.studyTime(id).catch(() => null),
      analyticsApi.knowledgeGraph(id).catch(() => []),
      analyticsApi.studentClasses(id).catch(() => []),
      analyticsApi.achievements(id).catch(() => null),
    ]).then(([a, p, s, k, c, ach]) => {
      setAnalytics(a);
      setPersona(p);
      setStudyTime(s);
      setKnowledgeGraph(k);
      setClasses(c);
      setAchievements(ach);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const dueTotal = analytics?.deck_progress?.reduce((s, d) => s + d.due_today, 0) || 0;
  const streak = analytics?.current_streak || 0;
  const retention = analytics?.average_retention ? Math.round(analytics.average_retention * 100) : null;
  const mastered = analytics?.cards_mastered || 0;
  const upNext = analytics?.deck_progress?.find((d) => d.due_today > 0) || analytics?.deck_progress?.[0];
  const latestAch = achievements?.earned?.[0];

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between" data-testid="student-dashboard">
        <div>
          <p className="label-md text-primary mb-2">Student Dashboard</p>
          <h1 className="display-md text-on-surface">
            Ready to learn, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{firstName}?</span>
          </h1>
          <p className="body-lg mt-2">You have <span className="font-bold text-on-surface">{dueTotal} cards</span> due for review today.</p>
        </div>
        <Link to="/student/study" data-testid="start-session-btn">
          <span className="btn-primary flex items-center gap-2 text-sm"><PlayCircle className="w-4 h-4" /> Start Session</span>
        </Link>
      </motion.div>

      {/* Row 1 — Hero stats */}
      <div className="grid grid-cols-12 gap-5">
        {/* Streak */}
        <motion.div variants={fadeUp} className="col-span-3 rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b6cc1, #6a4f9e)' }} data-testid="streak-card">
          <div className="relative z-10">
            <p className="label-sm text-white/60 mb-3 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-secondary" /> Streak</p>
            <p className="text-6xl font-extrabold text-white tracking-tight">{streak}</p>
            <p className="text-sm text-white/50 mt-1">days in a row</p>
          </div>
          <div className="mt-4 pt-4 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs text-white/40">{streak >= 7 ? 'Amazing consistency!' : 'Keep the streak alive!'}</p>
          </div>
        </motion.div>

        {/* Today's Goal */}
        <motion.div variants={fadeUp} className="col-span-5 bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 flex flex-col justify-between" data-testid="today-goal-card">
          <div className="flex items-center justify-between mb-4">
            <p className="label-sm flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Today's Goal</p>
            <span className="label-sm text-primary bg-primary/8 px-3 py-1 rounded-full">{dueTotal} due</span>
          </div>
          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: dueTotal > 0 ? '100%' : '0%', background: 'linear-gradient(135deg, #8b6cc1, #e8a87c)' }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="label-sm text-[10px]">0 done</span>
            <span className="label-sm text-[10px] font-bold text-on-surface">{dueTotal} to review</span>
          </div>
        </motion.div>

        {/* Retention + Mastered */}
        <div className="col-span-4 grid grid-rows-2 gap-5">
          <motion.div variants={fadeUp} className="bg-primary/8 rounded-[2rem] p-5 flex items-center gap-4 shadow-ambient" data-testid="retention-card">
            <div className="w-11 h-11 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-ambient shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="label-sm text-primary">Avg Retention</p>
              <p className="text-3xl font-extrabold text-on-surface tracking-tight">{retention !== null ? `${retention}%` : '--'}</p>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-5 flex items-center gap-4" data-testid="mastered-card">
            <div className="w-11 h-11 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-tertiary" />
            </div>
            <div>
              <p className="label-sm text-on-surface-variant">Mastered</p>
              <p className="text-3xl font-extrabold text-on-surface tracking-tight">{mastered}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Row 2 — Study Time + Up Next */}
      <div className="grid grid-cols-12 gap-5">
        <motion.div variants={fadeUp} className="col-span-3 bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6">
          <p className="label-sm flex items-center gap-1.5 mb-4"><Clock className="w-3.5 h-3.5" /> Study Time</p>
          <p className="text-4xl font-extrabold text-on-surface tracking-tight">{studyTime?.hours_this_week ?? 0}h</p>
          <p className="text-xs text-on-surface-variant mt-1">this week</p>
        </motion.div>

        <motion.div variants={fadeUp} className="col-span-9 bg-secondary/8 rounded-[2rem] shadow-ambient-peach p-6" data-testid="up-next-card">
          <p className="label-sm text-secondary mb-4 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Up Next</p>
          {upNext ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-on-surface">{upNext.deck_name}</p>
                <p className="text-sm text-on-surface-variant mt-0.5"><span className="font-bold text-on-surface">{upNext.due_today}</span> cards due</p>
              </div>
              <Link to="/student/study">
                <span className="btn-secondary text-sm py-2 px-5 flex items-center gap-1.5">Study <ChevronRight className="w-4 h-4" /></span>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">All caught up! No cards due.</p>
          )}
        </motion.div>
      </div>

      {/* Row 3 — Persona + Grit */}
      <div className="grid grid-cols-12 gap-5">
        <motion.div variants={fadeUp} className="col-span-6 bg-primary/5 rounded-[2rem] shadow-ambient p-6">
          <p className="label-sm text-primary mb-3 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Learning Persona</p>
          {persona ? (
            <>
              <p className="text-xl font-extrabold text-on-surface">{persona.persona_label}</p>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{persona.persona_description}</p>
              <span className="mt-3 inline-block label-sm text-primary bg-primary/10 px-3 py-1.5 rounded-full">{persona.persona_type}</span>
            </>
          ) : (
            <div className="space-y-2">
              <div className="h-6 w-36 bg-primary/10 animate-pulse rounded-full" />
              <div className="h-4 w-full bg-primary/10 animate-pulse rounded-full" />
            </div>
          )}
        </motion.div>

        <div className="col-span-6 grid grid-rows-2 gap-5">
          <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-tertiary" />
            </div>
            <div>
              <p className="label-sm text-on-surface-variant">Grit Score</p>
              {persona?.grit_score != null ? (
                <>
                  <p className="text-2xl font-extrabold text-on-surface">{persona.grit_score}<span className="text-sm font-medium text-on-surface-variant">/100</span></p>
                  <p className="text-xs font-semibold text-tertiary">{persona.grit_label}</p>
                </>
              ) : <p className="text-2xl font-extrabold text-on-surface-variant">--</p>}
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="label-sm text-on-surface-variant mb-1">Flow State</p>
              {persona?.flow_state ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${persona.flow_state === 'in_flow' ? 'bg-tertiary' : persona.flow_state === 'approaching' ? 'bg-primary' : persona.flow_state === 'warming_up' ? 'bg-secondary' : 'bg-surface-container-high'}`} />
                    <span className="text-sm font-semibold text-on-surface">{persona.flow_label}</span>
                  </span>
                </>
              ) : <p className="text-sm text-on-surface-variant">--</p>}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Achievement */}
      {latestAch && (
        <motion.div variants={fadeUp}>
          <Link to="/student/achievements">
            <div className="bg-primary/5 rounded-[2rem] shadow-ambient p-6 card-ethereal cursor-pointer" data-testid="achievement-card">
              <p className="label-sm text-primary mb-3 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Latest Achievement</p>
              <p className="text-lg font-extrabold text-on-surface">{latestAch.achievement.name}</p>
              <p className="text-xs text-on-surface-variant mt-1">{latestAch.achievement.description}</p>
              <p className="label-sm text-primary mt-2">View all badges</p>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Knowledge Graph */}
      {knowledgeGraph.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="label-md text-on-surface-variant mb-4">Knowledge Graph</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {knowledgeGraph.map((item) => (
              <div key={item.tag} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 card-ethereal">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-on-surface capitalize">{item.tag}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.total_cards} cards · {item.due_cards} due</p>
                  </div>
                  <DonutRing percent={item.mastery_percent} size={56} />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-on-surface-variant">{item.mastered_cards} mastered</span>
                  <Link to="/student/study"><span className="label-sm text-primary bg-primary/8 px-3 py-1.5 rounded-full cursor-pointer hover:bg-primary/15 transition-colors">Study Now</span></Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enrolled Classes */}
      {classes.length > 0 && (
        <motion.div variants={fadeUp}>
          <p className="label-md text-on-surface-variant mb-4">My Enrolled Classes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient overflow-hidden card-ethereal">
                <div className="p-6">
                  <span className="label-sm text-on-surface-variant">{cls.subject}</span>
                  <h3 className="text-lg font-bold text-on-surface mt-2">{cls.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">Instructor: {cls.teacher_name}</p>
                </div>
                <div className="px-6 py-3 bg-surface-container-low flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant"><span className="font-bold text-on-surface">{cls.deck_count}</span> Decks</span>
                  <Link to="/student/study"><span className="label-sm text-primary cursor-pointer">Study Now</span></Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
