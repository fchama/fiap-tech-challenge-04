import type { User } from '@/types';
import { request } from './api';

export const login = async (email: string, password: string) => {
  const res = await request<{ token: string; data: User }>('/auth/login', {
    method: 'POST',
    body: { email: email.trim(), password },
  });
  return { token: res.token, user: res.data };
};

export const fetchMe = async (): Promise<User> => {
  const res = await request<{ data: User }>('/auth/me');
  return res.data;
};
