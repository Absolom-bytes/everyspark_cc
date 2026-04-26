import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Timestamp;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  category?: string;
  createdAt: Timestamp;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: Timestamp;
}

export interface Report {
  id: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  reason: string;
  reporterId: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Timestamp;
}
