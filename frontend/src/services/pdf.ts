/**
 * PDF 导出服务（带 devMock）
 * - /api/pdf/export  (POST { html, filename? }) -> { url }
 */

const DEV_MOCK = String(process.env.REACT_APP_RESUME_DEV_MOCK || '').toLowerCase() === 'true';

export async function exportPdf(html: string, filename = 'resume.pdf'): Promise<{ url: string }> {
  if (DEV_MOCK) {
    // 开发期：包装成完整HTML并自动触发打印，用户可选择“保存为PDF”
    const printable = `<!doctype html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${filename}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif; color:#111; }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
</style>
</head><body>
${html}
<script>
  try { window.onload = function(){ setTimeout(function(){ window.print(); }, 100); } } catch(e) {}
</script>
</body></html>`;
    const blob = new Blob([printable], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return { url };
  }
  const res = await fetch('/api/pdf/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ html, filename })
  });
  if (!res.ok) {
    // 生产降级：同样返回可打印页面，保证用户可导出为PDF
    const printable = `<!doctype html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${filename}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif; color:#111; }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
</style>
</head><body>
${html}
<script>
  try { window.onload = function(){ setTimeout(function(){ window.print(); }, 100); } } catch(e) {}
</script>
</body></html>`;
    const blob = new Blob([printable], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return { url };
  }
  return (await res.json()) as { url: string };
}


