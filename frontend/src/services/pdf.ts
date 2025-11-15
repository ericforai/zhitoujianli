/**
 * PDF 导出服务（带 devMock）
 * - /api/pdf/export  (POST { html, filename? }) -> { url }
 */

const DEV_MOCK = String(process.env.REACT_APP_RESUME_DEV_MOCK || '').toLowerCase() === 'true';

export async function exportPdf(html: string, filename = 'resume.pdf'): Promise<{ url: string }> {
  if (DEV_MOCK) {
    // 以HTML Blob占位（开发期演示用），生产由后端导出PDF
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return { url };
  }
  const res = await fetch('/api/pdf/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ html, filename })
  });
  if (!res.ok) throw new Error(`Export PDF failed: ${res.status}`);
  return (await res.json()) as { url: string };
}


