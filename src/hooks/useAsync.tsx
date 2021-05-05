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
          setValue(response.data.movies);
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






















import React, { useState, useEffect, useCallback } from 'react';
// Usage
function App() {
  const { execute, status, value, error } = useAsync<string>(myFunction, false);
  return (
    <div>
      {status === 'idle' && <div>Start your journey by clicking a button</div>}
      {status === 'success' && <div>{value}</div>}
      {status === 'error' && <div>{error}</div>}
      <button onClick={execute} disabled={status === 'pending'}>
        {status !== 'pending' ? 'Click me' : 'Loading...'}
      </button>
    </div>
  );
}
// An async function for testing our hook.
// Will be successful 50% of the time.
const myFunction = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const rnd = Math.random() * 10;
      rnd <= 5
        ? resolve('Submitted successfully 🙌')
        : reject('Oh no there was an error 😞');
    }, 2000);
  });
};
// Hook
const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true,
) => {
  const [status, setStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback(() => {
    setStatus('pending');
    setValue(null);
    setError(null);
    return asyncFunction()
      .then((response: any) => {
        setValue(response);
        setStatus('success');
      })
      .catch((error: any) => {
        setError(error);
        setStatus('error');
      });
  }, [asyncFunction]);
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  return { execute, status, value, error };
};



import { Message, Dialog } from '@alifd/next';
import axios, { AxiosRequestConfig } from 'axios';
import { decodeHtml } from '@/utils';

export interface IRequest extends AxiosRequestConfig {
  url: string;
  /** 请求参数，当method为post的时候请使用data属性 */
  params?: any;
  /** 当method为post的时候使用data属性 */
  data?: any;
  /**
   * 是否缓存数据，相同url数据只请求一次，后面的请求都使用第一次请求的数据
   */
  cache?: boolean;
  /** 更据 cacheKey 进行缓存， 当cache 为true时生效 */
  cacheKey?: string;
  /**
   * 错误时是否Message提示错误信息, 默认开启
   */
  enableErrorMsg?: boolean;
  //  缓存有效期
  maxAge?: number;
  [key: string]: any;
}

// 缓存存储对象，当项目大了的时候考虑释放内存，目前不需要
const request_cache = {};

export interface IResult {
  success?: boolean;
  code?: string;
  message?: string;
  data?: any;
  [key: string]: any;
}

// 设置为ajax请求
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * 数据请求
 * @example
 * request({
 *   url: '/a/b/c',
 *   params: {}
 * })
 * // res.success === true的时候执行 then
 * .then(res => {...})
 * // res.success === false 的时候执行 catch
 * .catch(res => {...})
 *
 * 请配合 `ahooks` 的 `useRequest` 使用 https://ahooks.js.org/hooks/async#dependent-request
 */
export default ({
  cache = false,
  enableErrorMsg = true,
  cacheKey = '',
  maxAge = Infinity, //过期时间
  ...params
}: IRequest) => {
  // 本地缓存，只请求一次
  if (cache && request_cache[`${params.url}-${cacheKey}`]) {
    if (request_cache[`${params.url}-${cacheKey}`].then) {
      return request_cache[`${params.url}-${cacheKey}`];
    } else if (
      new Date().getTime() -
        request_cache[`${params.url}-${cacheKey}`].cacheTime <
      maxAge
    ) {
      return new Promise(resolve => {
        resolve(request_cache[`${params.url}-${cacheKey}`].res);
      });
    }
  } else if (request_cache[`${params.url}-${cacheKey}`]) {
    delete request_cache[`${params.url}-${cacheKey}`];
  }

  if (params.method && params.method.toLowerCase() === 'post') {
    // post时传入参数是data字段
    params.data = params.data || params.params || undefined;
    // params.data = qs.stringify(params.data); // 和后端约定 post请求用json的方式传递数据，所以关掉
    params.params = undefined;
    params.headers = params.headers || {
      'Content-Type': 'application/json;charset=UTF-8', // 和后端约定 post请求用json的方式传递数据
    };
    // 如果需要做csrf可以采用以下方案，需要后端先在接口返回信息中设置cookie 
    // if (!isLocal()) {
    //   const csrfToken = getCookie('XSRF-TOKEN');
    //   if (csrfToken) {
    //     params.headers['X-XSRF-TOKEN'] = csrfToken;
    //   } else {
    //     Message.error('cookie获取失败'); // XSRF-TOKEN cookie 缺失
    //     throw new Error('cookie获取失败');
    //   }
    // }
  } else if (
    !params.method ||
    (params.method && params.method.toLowerCase() === 'get')
  ) {
    // get时传入的参数是params字段
    params.params = params.params || params.data || undefined;
  }

  const servicePromise = new Promise((resolve, reject) => {
    axios(params)
      .then(({ data: res, status }: IResult) => {
        const { message, success, data, code } = res;
        if (success && status === 200) {
          // 成功
          // 需要缓存的数据缓存下来
          cache &&
            (request_cache[`${params.url}-${cacheKey}`] = {
              res,
              cacheTime: new Date().getTime(),
            });
          resolve(res);
        } else if (code === '9003') {
          // 状态过期重定向，后端code为9003，这里的code每个团队有自己的规范 
          Dialog.confirm({
            content: `状态已过期，是否重新刷新页面? `,
            onOk: () => {
              window.location.reload();
            },
          });
        } else if (data?.applyUrl) {
          // 临时处理无权限跳转
          window.location.href = data.applyUrl;
          reject(res);
        } else {
          // 失败
          // 失败时是否展示错误信息
          enableErrorMsg &&
            Message.error(
              `[${params.apiName || params.url}]: ${decodeHtml(message)}`
            );
          reject(res);
        }
      })
      .catch(e => {
        // 接口非200 || 接口非304
        enableErrorMsg && Message.error(`[http]: ${e}`);
        reject(e);
      });
  });
//缓存这里需要考虑一种情况是，在第二次请求发出时，第一次请求还未完成
//那么可以先把第一次请求操作缓存，第二次请求时判断若还在pending中，则返回promise对象，否则返回结果
  if (cache) {
    request_cache[`${params.url}-${cacheKey}`] = servicePromise;
  }

  return servicePromise;
};


作者：羽晋
链接：https://juejin.cn/post/6957945548607324191
来源：掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。