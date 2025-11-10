import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 路由切换时自动滚动到页面顶部
 * 解决React Router切换路由时保留滚动位置的问题
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
