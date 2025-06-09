export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  country: string;
  createdAt: Date;
  updatedAt: Date;
  likes: string[]; // Array of user IDs who liked the post
  comments: Comment[];
  views: number;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
} 