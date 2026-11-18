export type Role = 'teacher' | 'student';

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostInput {
  title: string;
  content: string;
  author: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  /** Disciplina (professores) */
  subject?: string;
  /** Turma (alunos) */
  grade?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  subject?: string;
  grade?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export type UserKind = 'teachers' | 'students';
