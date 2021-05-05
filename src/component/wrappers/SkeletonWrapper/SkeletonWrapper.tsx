import React, { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

interface SkeletonWrapperProps {
  isShow?: boolean;
  style?: React.CSSProperties;
}

export const SkeletonWrapper: FC<SkeletonWrapperProps> = ({
  isShow,
  style,
  children,
}) => {
  return <>{isShow ? <Skeleton style={style} /> : <>{children}</>}</>;
};
