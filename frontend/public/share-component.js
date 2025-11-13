/**
 * 智投简历博客 - 通用分享组件
 * 功能：微信、微博、复制链接
 * 使用方式：在HTML中引入此文件即可
 */

// 获取当前页面信息
const pageUrl = window.location.href;
const pageTitle = document.title;
const pageDescription = document.querySelector('meta[name="description"]')?.content || '';

// 显示消息提示
function showMessage(message, duration = 3000) {
    const messageEl = document.getElementById('share-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, duration);
    }
}

// 分享到微信（显示二维码弹窗）
function shareToWechat() {
    // 如果是微信浏览器内，提示使用原生分享
    if (navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1) {
        showMessage('请点击右上角"..."按钮分享给朋友');
        return;
    }

    // 显示弹窗
    const modal = document.getElementById('wechat-modal');
    if (!modal) return;

    // 使用canvas绘制带logo的二维码
    generateQRCodeWithLogo(pageUrl);

    // 显示弹窗
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 禁止页面滚动
}

// 生成带logo的二维码
function generateQRCodeWithLogo(url) {
    const qrcodeImg = document.getElementById('wechat-qrcode-img');
    if (!qrcodeImg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 220;
    canvas.height = 220;

    // 先加载二维码
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = function() {
        // 绘制二维码
        ctx.drawImage(qrImg, 0, 0, 220, 220);

        // 加载logo
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = function() {
            // 计算logo位置（中心）
            const logoSize = 45;
            const x = (220 - logoSize) / 2;
            const y = (220 - logoSize) / 2;

            // 绘制白色背景圆角矩形（让logo更清晰）
            ctx.fillStyle = 'white';
            const padding = 4;
            ctx.fillRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2);

            // 绘制logo
            ctx.drawImage(logoImg, x, y, logoSize, logoSize);

            // 将canvas转为图片
            qrcodeImg.src = canvas.toDataURL();
        };
        logoImg.onerror = function() {
            // logo加载失败，只显示二维码
            console.warn('Logo加载失败，显示纯二维码');
            qrcodeImg.src = canvas.toDataURL();
        };
        logoImg.src = '/images/logo.png';
    };
    qrImg.onerror = function() {
        console.error('二维码生成失败');
        showMessage('二维码生成失败，请稍后重试');
    };
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;
}

// 关闭微信分享弹窗
function closeWechatModal() {
    const modal = document.getElementById('wechat-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // 恢复页面滚动
    }
}

// 从弹窗复制链接
function copyLinkFromModal() {
    copyLink();
    // 复制成功后关闭弹窗
    setTimeout(() => {
        closeWechatModal();
    }, 1500);
}

// 分享到微博
function shareToWeibo() {
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(pageTitle + ' - ' + pageDescription)}&pic=&appkey=`;
    window.open(weiboUrl, '_blank', 'width=600,height=400');
    showMessage('正在打开微博分享...');
}

// 复制链接
function copyLink() {
    // 优先使用现代API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(pageUrl).then(() => {
            showMessage('✓ 链接已复制到剪贴板！');
        }).catch(() => {
            fallbackCopyLink();
        });
    } else {
        fallbackCopyLink();
    }
}

// 降级复制方法
function fallbackCopyLink() {
    const input = document.createElement('input');
    input.value = pageUrl;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showMessage('✓ 链接已复制到剪贴板！');
        } else {
            showMessage('复制失败，请手动复制：' + pageUrl);
        }
    } catch (err) {
        showMessage('复制失败，请手动复制：' + pageUrl);
    } finally {
        document.body.removeChild(input);
    }
}

// 事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 点击弹窗外部关闭
    const modal = document.getElementById('wechat-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeWechatModal();
            }
        });
    }

    // 监听键盘快捷键
    document.addEventListener('keydown', function(e) {
        // ESC键关闭弹窗
        if (e.key === 'Escape') {
            if (modal && modal.classList.contains('active')) {
                closeWechatModal();
            }
        }

        // Ctrl+C / Cmd+C 复制链接（未选中文本时）
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && window.getSelection().toString() === '') {
            e.preventDefault();
            copyLink();
        }
    });
});

