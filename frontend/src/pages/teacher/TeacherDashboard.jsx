import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, BarChart3, AlertTriangle, ChevronRight, Flame, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsApi } from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    analyticsApi.teacher(user.id).then(setAnalytics).catch(() => null).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
        <h2 className="headline-md text-on-surface">Failed to load analytics</h2>
        <p className="body-md mt-2">Please ensure the backend is running and data is seeded.</p>
      </div>
    );
  }

  const totalReviews = analytics.class_breakdown.reduce((s, c) => s + c.total_reviews, 0);
  const retention = analytics.average_class_retention ? `${(analytics.average_class_retention * 100).toFixed(1)}%` : 'N/A';
  const totalAtRisk = analytics.class_breakdown.reduce((s, c) => s + c.at_risk_count, 0);

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const engBars = [75, 58, 91, 38, 83, 46, 67].map((p) => Math.round(analytics.total_students * p / 100));
  const engMax = Math.max(...engBars, 1);

  return (
    <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="show" data-testid="teacher-dashboard">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <p className="label-md text-secondary mb-2">Teacher Dashboard</p>
          <h1 className="display-md text-on-surface">
            Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Teacher'}</span>
          </h1>
          <p className="body-lg mt-2">
            {totalAtRisk > 0 ? <><span className="font-bold text-red-500">{totalAtRisk} students</span> may need attention.</> : <>All classes are on track.</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="label-sm text-on-surface-variant">{analytics.total_classes} classes active</span>
          <div className="flex gap-1">
            {[...Array(analytics.total_classes)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-tertiary" style={{ boxShadow: '0 0 8px rgba(124,197,168,0.5)' }} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hero Row */}
      <div className="grid grid-cols-12 gap-5">
        {/* Dark hero */}
        <motion.div variants={fadeUp} className="col-span-3 rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b6cc1, #6a4f9e)' }}>
          <div className="relative z-10">
            <p className="label-sm text-white/60 mb-3 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-secondary" /> Classes</p>
            <p className="text-6xl font-extrabold text-white tracking-tight">{analytics.total_classes}</p>
            <p className="text-sm text-white/50 mt-1">active today</p>
          </div>
          <div className="mt-4 pt-4 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs text-white/40"><span className="text-white font-semibold">{analytics.total_students}</span> total students</p>
          </div>
        </motion.div>

        {/* Engagement chart */}
        <motion.div variants={fadeUp} className="col-span-5 bg-surface-container-lowest rounded-[2rem] shadow-ambient p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="label-sm flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Engagement</p>
            <span className="label-sm text-primary bg-primary/8 px-3 py-1 rounded-full">{engBars[6]} / {analytics.total_students}</span>
          </div>
          <div className="flex items-end gap-1 h-16 mb-3">
            {engBars.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-full transition-all ${i === 6 ? '' : 'bg-surface-container-high'}`}
                  style={{ height: `${Math.round((v / engMax) * 100)}%`, minHeight: '4px', ...(i === 6 ? { background: 'linear-gradient(to top, #8b6cc1, #e8a87c)' } : {}) }} />
                <span className="label-sm text-[9px]">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Retention + Reviews */}
        <div className="col-span-4 grid grid-rows-2 gap-5">
          <motion.div variants={fadeUp} className="bg-primary/8 rounded-[2rem] p-5 flex items-center gap-4 shadow-ambient">
            <div className="w-11 h-11 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-ambient shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="label-sm text-primary">Avg Retention</p>
              <p className="text-3xl font-extrabold text-on-surface tracking-tight">{retention}</p>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="label-sm text-on-surface-variant">Total Reviews</p>
              <p className="text-3xl font-extrabold text-on-surface tracking-tight">{totalReviews.toLocaleString()}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Class Overview */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <p className="label-md text-on-surface-variant">Class Overview</p>
          <Link to="/teacher/classes" className="label-sm text-primary hover:text-primary/80 transition-colors">Manage Classes</Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {analytics.class_breakdown.map((cls) => (
            <div key={cls.class_id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient overflow-hidden card-ethereal group" data-testid={`class-card-${cls.class_id}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-on-surface">{cls.class_name}</h3>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3" style={{ borderTop: '1px solid rgba(46,46,50,0.06)' }}>
                  <div>
                    <p className="label-sm text-[10px]">Students</p>
                    <p className="text-2xl font-bold text-on-surface">{cls.student_count}</p>
                  </div>
                  <div>
                    <p className="label-sm text-[10px]">Retention</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {cls.average_retention ? `${(cls.average_retention * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="label-sm text-[10px]">Reviews</p>
                    <p className="text-2xl font-bold text-on-surface">{cls.total_reviews}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {analytics.class_breakdown.length === 0 && (
            <div className="col-span-full bg-surface-container-lowest rounded-[2rem] p-12 text-center shadow-ambient">
              <BookOpen className="mx-auto w-10 h-10 text-on-surface-variant/30 mb-4" />
              <h3 className="font-bold text-on-surface">No classes yet</h3>
              <p className="body-md text-sm mt-1 mb-6">Create your first class to start tracking.</p>
              <Link to="/teacher/classes"><span className="btn-primary text-sm">Create Class</span></Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
