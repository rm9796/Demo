import { useState, useCallback } from 'react';
import { AsyncFn, AsyncStatus } from 'types';

export const useAsync = <T extends {}>(asyncFunction: AsyncFn<T>) => {
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [value, setValue] = useState<T[]>([]);
  const execute = useCallback(
    (params?: string) => {
      setStatus('pending');
      setValue([]);
      return asyncFunction(params)
        .then((response: any) => {
          setValue(response.data);
          setStatus('success');
        })
        .catch((error: any) => {
          console.log(`error`, error);
          setStatus('error');
        });
    },
    [asyncFunction],
  );

  return { execute, status, value, setValue };
};
