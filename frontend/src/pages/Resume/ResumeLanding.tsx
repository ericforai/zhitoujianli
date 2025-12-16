import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';

const ResumeLanding: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth?.() || { isAuthenticated: false };
  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <header>
        <Navigation />
      </header>
      <main className='flex-1 pt-20 md:pt-24'>
        <section className='bg-gradient-to-b from-blue-50 to-white'>
          <div className='max-w-7xl mx-auto px-4 py-14'>
            <h1 className='text-3xl font-bold mb-4'>
              智能简历：模板生成 + 一键优化
            </h1>
            <p className='text-gray-700 mb-6'>
              ATS 友好、关键词对齐、量化导向，助你提升面试命中率。
            </p>
            <div className='flex gap-3'>
              <button
                className='px-5 py-3 rounded-lg bg-blue-600 text-white'
                onClick={() =>
                  navigate(
                    isAuthenticated
                      ? '/resume/templates'
                      : '/login?next=/resume/templates'
                  )
                }
              >
                {isAuthenticated ? '进入模板生成' : '登录后使用模板'}
              </button>
              <button
                className='px-5 py-3 rounded-lg bg-emerald-600 text-white'
                onClick={() =>
                  navigate(
                    isAuthenticated
                      ? '/resume/optimize'
                      : '/login?next=/resume/optimize'
                  )
                }
              >
                {isAuthenticated ? '进入上传优化' : '登录后使用优化'}
              </button>
            </div>
          </div>
        </section>
        <section className='max-w-7xl mx-auto px-4 py-10'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='rounded-2xl border shadow-lg p-6'>
              <div className='text-lg font-semibold mb-2'>模板生成</div>
              <div className='text-gray-600 mb-3'>
                选择人群画像，填写核心信息，AI 生成 ATS 友好 HTML，可导出 PDF。
              </div>
              <Link
                to={
                  isAuthenticated
                    ? '/resume/templates'
                    : '/login?next=/resume/templates'
                }
                className='text-blue-600 text-sm'
              >
                立即体验 →
              </Link>
            </div>
            <div className='rounded-2xl border shadow-lg p-6'>
              <div className='text-lg font-semibold mb-2'>上传优化</div>
              <div className='text-gray-600 mb-3'>
                上传现有简历，智能诊断并生成修订版，提升关键词覆盖与量化表达。
              </div>
              <Link
                to={
                  isAuthenticated
                    ? '/resume/optimize'
                    : '/login?next=/resume/optimize'
                }
                className='text-blue-600 text-sm'
              >
                立即体验 →
              </Link>
            </div>
          </div>
        </section>
        <section className='max-w-7xl mx-auto px-4 pb-16'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {['ATS 友好', '关键词对齐', '量化导向', '一键导出'].map(s => (
              <div
                key={s}
                className='rounded-2xl border p-6 text-center shadow'
              >
                <div className='font-semibold mb-1'>{s}</div>
                <div className='text-gray-600 text-sm'>
                  更高通过率与更强说服力
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ResumeLanding;
