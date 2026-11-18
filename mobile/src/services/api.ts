import { API_URL } from '@/config';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

/** Registra um callback chamado quando a API responde 401 com token ativo. */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

const TIMEOUT_MS = 15000;

/** Traduz mensagens conhecidas da API (em inglês) para português. */
const translate = (message: string): string => {
  const map: Record<string, string> = {
    'Invalid email or password': 'E-mail ou senha inválidos.',
    'Authentication required': 'É necessário estar autenticado.',
    'Invalid or expired token': 'Sessão expirada. Faça login novamente.',
    'You do not have permission to perform this action':
      'Você não tem permissão para realizar esta ação.',
    'Email already registered': 'Este e-mail já está cadastrado.',
    'Post not found': 'Post não encontrado.',
    'Teacher not found': 'Professor não encontrado.',
    'Student not found': 'Aluno não encontrado.',
    'You cannot delete your own account': 'Você não pode excluir a própria conta.',
    'Title, content and author are required': 'Título, conteúdo e autor são obrigatórios.',
    'Name, email and password are required': 'Nome, e-mail e senha são obrigatórios.',
  };
  return map[message] ?? message;
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query } = options;

  const params = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  const url = `${API_URL}${path}${params ? `?${params}` : ''}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      `Não foi possível conectar à API (${API_URL}). Verifique se o servidor está rodando e se o celular está na mesma rede.`,
      0
    );
  } finally {
    clearTimeout(timer);
  }

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    // resposta sem corpo JSON
  }

  if (!response.ok) {
    if (response.status === 401 && authToken && onUnauthorized) onUnauthorized();
    const message = translate(payload?.message ?? `Erro ${response.status}`);
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
