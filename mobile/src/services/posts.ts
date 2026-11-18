import type { Post, PostInput } from '@/types';
import { request } from './api';

interface ListResponse {
  data: Post[];
}

interface OneResponse {
  data: Post;
}

export const listPosts = async (): Promise<Post[]> => {
  const res = await request<ListResponse>('/posts');
  return res.data;
};

export const searchPosts = async (q: string): Promise<Post[]> => {
  const res = await request<ListResponse>('/posts/search', { query: { q } });
  return res.data;
};

export const getPost = async (id: string): Promise<Post> => {
  const res = await request<OneResponse>(`/posts/${id}`);
  return res.data;
};

export const createPost = async (input: PostInput): Promise<Post> => {
  const res = await request<OneResponse>('/posts', { method: 'POST', body: input });
  return res.data;
};

export const updatePost = async (id: string, input: Partial<PostInput>): Promise<Post> => {
  const res = await request<OneResponse>(`/posts/${id}`, { method: 'PUT', body: input });
  return res.data;
};

export const deletePost = async (id: string): Promise<void> => {
  await request(`/posts/${id}`, { method: 'DELETE' });
};
