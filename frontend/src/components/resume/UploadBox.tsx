import React, { useCallback, useState } from 'react';
import { parse, validateFile } from '../../services/uploads';

interface Props {
  onParsed: (text: string) => void;
}

const UploadBox: React.FC<Props> = ({ onParsed }) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || !files.length) return;
      const file = files[0];
      const valid = validateFile(file);
      if (!valid.ok) {
        setError(valid.reason || '文件无效');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const res = await parse(file);
        onParsed(res.text);
      } catch (e: any) {
        setError(e?.message || '解析失败');
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={e => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={e => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={e => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className='text-gray-700 mb-3'>拖拽文件到此处，或点击选择（支持 pdf/docx/txt/md，≤5MB）</div>
      <div className='flex justify-center'>
        <label className='px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer'>
          选择文件
          <input
            type='file'
            className='hidden'
            accept='.pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown'
            onChange={e => handleFiles(e.target.files)}
          />
        </label>
      </div>
      {loading ? <div className='text-sm text-gray-500 mt-3'>解析中...</div> : null}
      {error ? <div className='text-sm text-red-600 mt-3'>{error}</div> : null}
    </div>
  );
};

export default UploadBox;


