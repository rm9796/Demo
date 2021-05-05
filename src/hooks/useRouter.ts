import { useMemo } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';

export const useRouter = () => {
  const params = useParams<{ [key: string]: string }>();
  const location = useLocation();
  const history = useHistory();

  return useMemo(() => {
    return {
      push: history.push,
      replace: history.replace,
      pathname: location.pathname,
      params,

      location,
      history,
    };
  }, [params, location, history]);
};
