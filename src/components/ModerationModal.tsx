import { useState, FormEvent } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  targetTitle?: string;
}

export default function ModerationModal({ isOpen, onClose, targetId, targetType, targetTitle }: ModerationModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !reason) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        targetId,
        targetType,
        reason,
        reporterId: auth.currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-red-400">
                <Flag size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Flag Content</h3>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {success ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  <AlertTriangle size={32} />
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Report Submitted</p>
                <p className="text-xs text-slate-400 font-mono">ENFORCEMENT_PROTOCOL_INITIATED</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Reporting {targetType}: <span className="text-white">{targetTitle || targetId}</span>
                  </label>
                  <textarea 
                    placeholder="PROVIDE_REASON_FOR_MODERATION" 
                    rows={4}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs uppercase tracking-widest text-white focus:outline-none focus:border-red-500/50 transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'PROCESSING...' : 'SUBMIT_REPORT'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
