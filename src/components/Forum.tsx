import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment,
  deleteDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { db, auth, signInWithGoogle } from '../lib/firebase';
import { Post, Comment, UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  MessageSquare, 
  Plus, 
  ArrowLeft, 
  Send, 
  Trash2, 
  User as UserIcon,
  LogOut,
  Sparkles,
  Search,
  Filter,
  MessageCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Forum() {
  const { user, profile, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [view, setView] = useState<'feed' | 'post' | 'profile'>('feed');

  // Load Feed
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(fetchedPosts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => unsubscribe();
  }, []);

  // Load Comments when a post is selected
  useEffect(() => {
    if (!selectedPost) return;

    const q = query(collection(db, `posts/${selectedPost.id}/comments`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(fetchedComments);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `posts/${selectedPost.id}/comments`);
    });

    return () => unsubscribe();
  }, [selectedPost]);

  const handleCreatePost = async () => {
    if (!user || !newPostTitle || !newPostContent) return;

    try {
      await addDoc(collection(db, 'posts'), {
        title: newPostTitle,
        content: newPostContent,
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || 'Anonymous',
        authorPhoto: profile?.photoURL || user.photoURL || '',
        createdAt: serverTimestamp(),
        commentCount: 0
      });
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreateForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  };

  const handleAddComment = async () => {
    if (!user || !selectedPost || !newComment) return;

    try {
      const commentRef = collection(db, `posts/${selectedPost.id}/comments`);
      await addDoc(commentRef, {
        postId: selectedPost.id,
        content: newComment,
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || 'Anonymous',
        authorPhoto: profile?.photoURL || user.photoURL || '',
        createdAt: serverTimestamp()
      });

      const postRef = doc(db, 'posts', selectedPost.id);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `posts/${selectedPost.id}/comments`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      if (selectedPost?.id === postId) {
        setView('feed');
        setSelectedPost(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    }
  };

  if (authLoading) return <div className="p-20 text-center text-slate-500 font-mono tracking-widest">LOADING__ENVIRONMENT...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center text-white">
            <MessageCircle size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tighter uppercase">Community <span className="text-cyan-400">Sync</span></h1>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('profile')}
              className="flex items-center gap-3 py-2 px-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <img src={profile?.photoURL || user.photoURL || ''} className="w-6 h-6 rounded-full border border-cyan-500/30" alt="" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">{profile?.displayName || 'USER'}</span>
            </button>
            <button onClick={() => auth.signOut()} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="px-6 py-2 bg-white text-slate-950 text-xs font-bold rounded-full hover:bg-cyan-50 transition-all uppercase tracking-widest"
          >
            Sign In to Sync
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === 'feed' && (
          <motion.div 
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {user && (
              <div className="mb-10">
                {!showCreateForm ? (
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="w-full p-6 rounded-2xl bg-white/5 border border-dashed border-white/20 hover:border-cyan-500/50 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                  >
                    <Plus size={24} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Initiate New Thread</span>
                  </button>
                ) : (
                  <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">// New Output</h3>
                      <button onClick={() => setShowCreateForm(false)} className="text-slate-500 hover:text-white">
                        <X size={20} />
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="THREAD_TITLE" 
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm uppercase tracking-widest text-white focus:outline-none focus:border-cyan-400 mb-4"
                    />
                    <textarea 
                      placeholder="CORE_CONTENT" 
                      rows={6}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-xs uppercase tracking-widest text-white focus:outline-none focus:border-cyan-400 mb-6 resize-none"
                    ></textarea>
                    <button 
                      onClick={handleCreatePost}
                      className="w-full py-4 bg-white text-slate-950 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-50 transition-all shadow-xl shadow-cyan-900/10"
                    >
                      Broadcast to Network
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {posts.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => { setSelectedPost(post); setView('post'); }}
                  className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-10 group-hover:bg-indigo-600/10 transition-all" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img src={post.authorPhoto} className="w-8 h-8 rounded bg-slate-800" alt="" />
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{post.authorName}</span>
                        <div className="text-[9px] text-slate-500 font-mono tracking-tighter">
                          {post.createdAt?.toDate().toLocaleDateString() || 'JUST NOW'}
                        </div>
                      </div>
                    </div>
                    {user?.uid === post.authorId && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                        className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{post.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-6 italic">{post.content}</p>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-indigo-400" />
                      {post.commentCount} RESPONSES
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <span>VIEW_THREAD</span>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-slate-600 font-mono text-sm tracking-widest uppercase">No active threads in current cluster.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'post' && selectedPost && (
          <motion.div 
            key="post-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button 
              onClick={() => { setView('feed'); setSelectedPost(null); }}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10 font-mono text-[10px] uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Return to Feed
            </button>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm mb-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <img src={selectedPost.authorPhoto} className="w-12 h-12 rounded-xl bg-slate-800" alt="" />
                <div>
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{selectedPost.authorName}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">{selectedPost.createdAt?.toDate().toLocaleString()}</p>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-6 uppercase tracking-tight leading-tight">{selectedPost.title}</h2>
              <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap font-light italic border-l-2 border-cyan-500/30 pl-6 py-2">
                {selectedPost.content}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 py-4 border-b border-white/5 mb-6">
                <div className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Network Responses ({comments.length})</div>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-6 group">
                  <img src={comment.authorPhoto} className="w-10 h-10 rounded-lg bg-slate-800 mt-1" alt="" />
                  <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{comment.authorName}</span>
                      <span className="text-[9px] text-slate-600 font-mono uppercase">{comment.createdAt?.toDate().toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-mono opacity-80">{comment.content}</p>
                  </div>
                </div>
              ))}

              {user ? (
                <div className="mt-12 flex gap-4">
                  <div className="flex-1 relative">
                    <textarea 
                      placeholder="CONSTRUCT_RESPONSE..." 
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-6 py-4 font-mono text-xs uppercase tracking-widest text-white focus:outline-none focus:border-cyan-400 resize-none shadow-xl"
                    ></textarea>
                    <button 
                      onClick={handleAddComment}
                      className="absolute bottom-4 right-4 p-3 bg-white text-slate-950 rounded-xl hover:bg-cyan-50 transition-all shadow-lg active:scale-95"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-12 p-10 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-slate-500 font-mono text-xs tracking-widest uppercase mb-6">Authentication required to construct response.</p>
                  <button 
                    onClick={signInWithGoogle}
                    className="px-8 py-3 bg-white text-slate-950 text-xs font-bold rounded-full uppercase tracking-widest hover:bg-cyan-50 transition-all"
                  >
                    Sign In to Protocol
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'profile' && user && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center"
          >
            <button 
              onClick={() => setView('feed')}
              className="self-start flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10 font-mono text-[10px] uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Terminate Profile View
            </button>

            <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-sm shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-cyan-400 animate-pulse" />
              <div className="w-32 h-32 rounded-full border-4 border-cyan-500/30 mx-auto mb-8 p-1">
                <img src={profile?.photoURL || user.photoURL || ''} className="w-full h-full rounded-full bg-slate-800 object-cover" alt="" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2 uppercase tracking-tighter">{profile?.displayName || user.displayName}</h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-8">UID: {user.uid.substring(0, 12)}...</p>
              
              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2">Total Contributions</div>
                  <div className="text-2xl font-bold text-white font-mono">{posts.filter(p => p.authorId === user.uid).length}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Network Rank</div>
                  <div className="text-2xl font-bold text-white font-mono">INITIATE</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => auth.signOut()}
                  className="w-full py-4 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/10 transition-all"
                >
                  Disconnect from Network
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
