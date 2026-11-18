import type { Paginated, User, UserInput, UserKind } from '@/types';
import { request } from './api';

interface ListResponse {
  data: User[];
  total: number;
  page: number;
  pages: number;
}

interface OneResponse {
  data: User;
}

export const listUsers = async (
  kind: UserKind,
  page: number,
  limit = 10,
  q?: string
): Promise<Paginated<User>> => {
  const res = await request<ListResponse>(`/${kind}`, { query: { page, limit, q } });
  return { data: res.data, total: res.total, page: res.page, pages: res.pages };
};

export const getUser = async (kind: UserKind, id: string): Promise<User> => {
  const res = await request<OneResponse>(`/${kind}/${id}`);
  return res.data;
};

export const createUser = async (kind: UserKind, input: UserInput): Promise<User> => {
  const res = await request<OneResponse>(`/${kind}`, { method: 'POST', body: input });
  return res.data;
};

export const updateUser = async (kind: UserKind, id: string, input: UserInput): Promise<User> => {
  const res = await request<OneResponse>(`/${kind}/${id}`, { method: 'PUT', body: input });
  return res.data;
};

export const deleteUser = async (kind: UserKind, id: string): Promise<void> => {
  await request(`/${kind}/${id}`, { method: 'DELETE' });
};
