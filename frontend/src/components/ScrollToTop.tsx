import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 路由切换时自动滚动到页面顶部或锚点位置
 * 解决React Router切换路由时保留滚动位置的问题
 * 支持hash锚点导航（如 /#jd-matching）
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 如果有hash锚点，滚动到对应元素
    if (hash) {
      // 延迟执行以确保DOM已完全渲染
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);

        if (element) {
          // 使用smooth滚动效果
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    } else {
      // 没有hash时，滚动到顶部
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
