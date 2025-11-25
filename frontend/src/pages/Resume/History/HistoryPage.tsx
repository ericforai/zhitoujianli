import React, { useEffect, useState } from 'react';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import { list, type HistoryItem } from '../../../services/resumes';
import { useNavigate } from 'react-router-dom';

const HistoryPage: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadList() {
    setLoading(true);
    try {
      const data = await list();
      console.log('历史记录加载结果:', data);
      setItems(data);
    } catch (error) {
      console.error('加载历史记录失败:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadList();
    })();
  }, []);

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <header>
        <Navigation />
      </header>
      <main className='flex-1 max-w-7xl mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-4'>
          <div className='text-xl font-semibold'>历史记录</div>
          <button
            type='button'
            className='px-3 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200'
            onClick={loadList}
          >
            刷新
          </button>
        </div>
        <div className='border rounded-2xl overflow-hidden shadow'>
          <table className='w-full text-left'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3'>时间</th>
                <th className='px-4 py-3'>类型</th>
                <th className='px-4 py-3'>分数</th>
                <th className='px-4 py-3'>导出次数</th>
                <th className='px-4 py-3'>下载链接</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className='px-4 py-3 text-sm text-gray-500' colSpan={5}>
                    加载中...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className='px-4 py-3 text-sm text-gray-500' colSpan={5}>
                    暂无记录
                  </td>
                </tr>
              ) : (
                items.map(it => (
                  <tr
                    key={it.id}
                    className='border-t hover:bg-gray-50 cursor-pointer'
                    onClick={() => {
                      if (it.type === '优化') {
                        navigate(`/resume/optimize?hid=${encodeURIComponent(it.id)}`);
                      } else {
                        navigate(`/resume/templates`); // 模板类可扩展重放
                      }
                    }}
                  >
                    <td className='px-4 py-3 text-sm text-gray-700'>{new Date(it.createdAt).toLocaleString()}</td>
                    <td className='px-4 py-3 text-sm'>{it.type}</td>
                    <td className='px-4 py-3 text-sm'>{it.score ?? '-'}</td>
                    <td className='px-4 py-3 text-sm'>{it.exportCount ?? 0}</td>
                    <td className='px-4 py-3 text-sm'>
                      {it.downloadUrl ? (
                        <a href={it.downloadUrl} target='_blank' rel='noreferrer' className='text-blue-600'>
                          下载
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HistoryPage;


