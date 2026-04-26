import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Report, Post, Comment } from '../types';
import { Shield, Trash2, CheckCircle, XCircle, ExternalLink, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(fetchedReports);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching reports:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = async (reportId: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: 'dismissed' });
    } catch (error) {
      console.error('Error dismissing report:', error);
    }
  };

  const handleAction = async (report: Report) => {
    if (!window.confirm(`Perform destructive action on ${report.targetType}?`)) return;

    try {
      if (report.targetType === 'post') {
        await deleteDoc(doc(db, 'posts', report.targetId));
      } else if (report.targetType === 'comment') {
        // This is tricky because we need the postId to find the subcollection
        // In a real app we'd store the parent ID in the report
        alert('Manual deletion required for comments currently.');
      }
      await updateDoc(doc(db, 'reports', report.id), { status: 'resolved' });
    } catch (error) {
      console.error('Error acting on report:', error);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-500 font-mono tracking-widest uppercase">Initializing_Moderation_Suite...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500 border border-red-500/30">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tighter uppercase">MOD_CORE <span className="text-red-500">v1.0</span></h1>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Exit Admin
        </button>
      </div>

      <div className="grid gap-6">
        {reports.length === 0 ? (
          <div className="py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
            <CheckCircle size={32} className="text-emerald-500 mx-auto mb-4 opacity-50" />
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">No active threats detected. Network secure.</p>
          </div>
        ) : (
          reports.map((report) => (
            <motion.div 
              key={report.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border backdrop-blur-sm transition-all ${
                report.status === 'pending' ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${
                      report.targetType === 'post' ? 'border-cyan-500 text-cyan-400 bg-cyan-400/10' : 'border-indigo-500 text-indigo-400 bg-indigo-400/10'
                    }`}>
                      {report.targetType}
                    </span>
                    <span className={`text-[9px] font-mono tracking-widest uppercase ${
                      report.status === 'pending' ? 'text-red-400 animate-pulse' : 'text-slate-500'
                    }`}>
                      [{report.status}]
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono ml-auto">
                      {report.createdAt?.toDate().toLocaleString()}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-2">Issue: {report.reason}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mb-4">TARGET_ID: {report.targetId}</p>
                </div>

                {report.status === 'pending' && (
                  <div className="flex md:flex-col gap-2">
                    <button 
                      onClick={() => handleAction(report)}
                      className="flex-1 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase rounded-lg hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                    <button 
                      onClick={() => handleDismiss(report.id)}
                      className="flex-1 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase rounded-lg hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
