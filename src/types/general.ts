export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';
export type AsyncFn<T> = (params?: string) => Promise<T>;
