#!/bin/bash

# 智投简历博客自动发布脚本
# 使用方法: ./blog_publisher.sh "博客标题" "博客内容文件路径"

set -e

# 配置参数
BLOG_DOMAIN="zhitoujianli.com"
BLOG_PATH="/blog"
CONTENT_DIR="/root/zhitoujianli/blog_content"
TEMPLATE_DIR="/root/zhitoujianli/blog_templates"
OUTPUT_DIR="/root/zhitoujianli/blog_output"

# 检查参数
if [ $# -lt 2 ]; then
    echo "使用方法: $0 \"博客标题\" \"博客内容文件路径\""
    echo "示例: $0 \"简历优化指南\" \"/path/to/content.md\""
    exit 1
fi

BLOG_TITLE="$1"
CONTENT_FILE="$2"

# 检查内容文件是否存在
if [ ! -f "$CONTENT_FILE" ]; then
    echo "错误: 内容文件不存在: $CONTENT_FILE"
    exit 1
fi

# 创建输出目录
mkdir -p "$OUTPUT_DIR"
mkdir -p "$CONTENT_DIR"

# 生成SEO友好的URL
BLOG_SLUG=$(echo "$BLOG_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9\u4e00-\u9fa5]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
BLOG_URL="https://$BLOG_DOMAIN$BLOG_PATH/$BLOG_SLUG"

echo "开始处理博客: $BLOG_TITLE"
echo "URL: $BLOG_URL"

# 读取博客内容
BLOG_CONTENT=$(cat "$CONTENT_FILE")

# 生成发布时间
PUBLISH_DATE=$(date '+%Y-%m-%dT%H:%M:%S+08:00')
PUBLISH_DATE_DISPLAY=$(date '+%Y年%m月%d日')

# 生成SEO元数据
META_DESCRIPTION=$(echo "$BLOG_CONTENT" | head -n 3 | tr '\n' ' ' | sed 's/^#* *//' | cut -c1-150)
META_KEYWORDS="简历优化,AI智能投递,求职工具,简历模板,岗位匹配,智能求职,简历制作,求职技巧"

# 生成HTML文件
cat > "$OUTPUT_DIR/$BLOG_SLUG.html" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO Meta Tags -->
    <title>$BLOG_TITLE | 智投简历</title>
    <meta name="description" content="$META_DESCRIPTION">
    <meta name="keywords" content="$META_KEYWORDS">
    <meta name="author" content="智投简历团队">
    <meta name="robots" content="index, follow">

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="$BLOG_TITLE">
    <meta property="og:description" content="$META_DESCRIPTION">
    <meta property="og:type" content="article">
    <meta property="og:url" content="$BLOG_URL">
    <meta property="og:image" content="https://$BLOG_DOMAIN/images/blog/$BLOG_SLUG-og.jpg">
    <meta property="og:site_name" content="智投简历">
    <meta property="og:locale" content="zh_CN">

    <!-- Canonical URL -->
    <link rel="canonical" href="$BLOG_URL">

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "$BLOG_TITLE",
        "description": "$META_DESCRIPTION",
        "image": "https://$BLOG_DOMAIN/images/blog/$BLOG_SLUG-og.jpg",
        "author": {
            "@type": "Organization",
            "name": "智投简历团队",
            "url": "https://$BLOG_DOMAIN"
        },
        "publisher": {
            "@type": "Organization",
            "name": "智投简历",
            "logo": {
                "@type": "ImageObject",
                "url": "https://$BLOG_DOMAIN/images/logo.png"
            }
        },
        "datePublished": "$PUBLISH_DATE",
        "dateModified": "$PUBLISH_DATE",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "$BLOG_URL"
        },
        "keywords": ["简历优化", "AI智能投递", "求职工具", "简历模板", "岗位匹配", "智能求职"],
        "articleSection": "求职技巧"
    }
    </script>

    <!-- CSS -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

    <style>
        .blog-container { max-width: 800px; margin: 0 auto; line-height: 1.8; }
        .blog-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem 0; margin-bottom: 2rem; }
        .blog-title { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.2; }
        .blog-content { font-size: 1.1rem; color: #374151; }
        .blog-content h2 { font-size: 1.8rem; font-weight: 600; color: #1f2937; margin: 2rem 0 1rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; }
        .blog-content h3 { font-size: 1.4rem; font-weight: 600; color: #374151; margin: 1.5rem 0 0.8rem 0; }
        .blog-content p { margin-bottom: 1.2rem; }
        .blog-content ul, .blog-content ol { margin: 1rem 0; padding-left: 2rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .highlight-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 8px 8px 0; }
        .cta-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; transition: transform 0.2s; }
        .cta-button:hover { transform: translateY(-2px); }
        .social-share { display: flex; gap: 1rem; margin: 2rem 0; }
        .social-btn { padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; color: white; font-size: 0.9rem; transition: opacity 0.2s; }
        .wechat { background: #07c160; }
        .weibo { background: #e6162d; }
        .qq { background: #12b7f5; }
        .copy { background: #6b7280; }
        .related-posts { background: #f9fafb; padding: 2rem; border-radius: 12px; margin: 3rem 0; }
        .related-post { display: block; padding: 1rem; background: white; border-radius: 8px; text-decoration: none; color: #374151; margin-bottom: 1rem; transition: box-shadow 0.2s; }
        .related-post:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        @media (max-width: 768px) {
            .blog-title { font-size: 2rem; }
            .blog-container { padding: 0 1rem; }
            .social-share { flex-wrap: wrap; }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <a href="/" class="text-xl font-bold text-gray-900">
                        <i class="fas fa-brain text-blue-600 mr-2"></i>
                        智投简历
                    </a>
                </div>
                <div class="hidden md:flex space-x-8">
                    <a href="/" class="text-gray-700 hover:text-blue-600">首页</a>
                    <a href="/features" class="text-gray-700 hover:text-blue-600">功能特色</a>
                    <a href="/blog" class="text-gray-700 hover:text-blue-600">博客</a>
                    <a href="/pricing" class="text-gray-700 hover:text-blue-600">价格</a>
                    <a href="/contact" class="text-gray-700 hover:text-blue-600">联系我们</a>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/login" class="text-gray-700 hover:text-blue-600">登录</a>
                    <a href="/register" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">免费试用</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- 博客头部 -->
    <div class="blog-header">
        <div class="blog-container px-4">
            <div class="blog-meta mb-4">
                <span><i class="fas fa-calendar-alt mr-2"></i>$PUBLISH_DATE_DISPLAY</span>
                <span class="mx-4"><i class="fas fa-user mr-2"></i>智投简历团队</span>
                <span><i class="fas fa-clock mr-2"></i>阅读时间：8分钟</span>
            </div>
            <h1 class="blog-title">$BLOG_TITLE</h1>
            <p class="text-xl opacity-90">$META_DESCRIPTION</p>
        </div>
    </div>

    <!-- 博客内容 -->
    <div class="blog-container px-4">
        <article class="blog-content">
            <!-- 这里插入博客内容 -->
            <div id="blog-content-placeholder"></div>
        </article>

        <!-- 社交媒体分享 -->
        <div class="social-share">
            <h3>分享这篇文章：</h3>
            <a href="#" class="social-btn wechat" onclick="shareToWechat()">
                <i class="fab fa-weixin mr-1"></i>微信
            </a>
            <a href="#" class="social-btn weibo" onclick="shareToWeibo()">
                <i class="fab fa-weibo mr-1"></i>微博
            </a>
            <a href="#" class="social-btn qq" onclick="shareToQQ()">
                <i class="fab fa-qq mr-1"></i>QQ
            </a>
            <a href="#" class="social-btn copy" onclick="copyLink()">
                <i class="fas fa-link mr-1"></i>复制链接
            </a>
        </div>

        <!-- 相关文章 -->
        <div class="related-posts">
            <h3><i class="fas fa-newspaper mr-2"></i>相关文章推荐</h3>

            <a href="/blog/resume-template-guide" class="related-post">
                <h4>2024年最新简历模板大全：让HR一眼相中你</h4>
                <p>精选50+专业简历模板，涵盖各行业各岗位，助你打造完美简历...</p>
                <span class="text-sm text-gray-500">2024-01-10</span>
            </a>

            <a href="/blog/ai-interview-prep" class="related-post">
                <h4>AI面试准备指南：如何用智能工具提升面试成功率</h4>
                <p>从简历优化到面试技巧，AI工具如何帮你全面提升求职竞争力...</p>
                <span class="text-sm text-gray-500">2024-01-08</span>
            </a>

            <a href="/blog/career-switch-success" class="related-post">
                <h4>转行求职成功案例：从传统行业到互联网的华丽转身</h4>
                <p>分享3个成功转行的真实案例，教你如何用智投简历实现职业转型...</p>
                <span class="text-sm text-gray-500">2024-01-05</span>
            </a>
        </div>
    </div>

    <!-- 页脚 -->
    <footer class="bg-gray-900 text-white py-12 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 class="text-lg font-semibold mb-4">
                        <i class="fas fa-brain text-blue-400 mr-2"></i>
                        智投简历
                    </h3>
                    <p class="text-gray-400">AI驱动的智能求职平台，让每个求职者都能找到心仪的工作。</p>
                </div>

                <div>
                    <h4 class="font-semibold mb-4">产品功能</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/features/resume-parser" class="hover:text-white">智能简历解析</a></li>
                        <li><a href="/features/job-matching" class="hover:text-white">岗位智能匹配</a></li>
                        <li><a href="/features/auto-apply" class="hover:text-white">自动化投递</a></li>
                        <li><a href="/features/analytics" class="hover:text-white">投递数据分析</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-semibold mb-4">帮助中心</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/help/getting-started" class="hover:text-white">快速开始</a></li>
                        <li><a href="/help/faq" class="hover:text-white">常见问题</a></li>
                        <li><a href="/help/tutorials" class="hover:text-white">使用教程</a></li>
                        <li><a href="/help/contact" class="hover:text-white">联系我们</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-semibold mb-4">联系我们</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><i class="fas fa-envelope mr-2"></i>support@zhitoujianli.com</li>
                        <li><i class="fas fa-phone mr-2"></i>400-888-8888</li>
                        <li><i class="fas fa-map-marker-alt mr-2"></i>北京市朝阳区</li>
                    </ul>
                </div>
            </div>

            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 智投简历. 保留所有权利. | <a href="/privacy" class="hover:text-white">隐私政策</a> | <a href="/terms" class="hover:text-white">服务条款</a></p>
            </div>
        </div>
    </footer>

    <!-- JavaScript -->
    <script>
        // 社交媒体分享功能
        function shareToWechat() {
            alert('请复制链接到微信分享');
            copyLink();
        }

        function shareToWeibo() {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            window.open(\`https://service.weibo.com/share/share.php?url=\${url}&title=\${title}\`, '_blank');
        }

        function shareToQQ() {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            window.open(\`https://connect.qq.com/widget/shareqq/index.html?url=\${url}&title=\${title}\`, '_blank');
        }

        function copyLink() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('链接已复制到剪贴板');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('链接已复制到剪贴板');
            });
        }
    </script>
</body>
</html>
EOF

# 处理Markdown内容并插入到HTML中
python3 << EOF
import re
import sys

def markdown_to_html(markdown_text):
    # 简单的Markdown到HTML转换
    html = markdown_text

    # 标题转换
    html = re.sub(r'^# (.*)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.*)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)

    # 段落转换
    html = re.sub(r'^([^<\n].*)$', r'<p>\1</p>', html, flags=re.MULTILINE)

    # 列表转换
    html = re.sub(r'^- (.*)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(<li>.*</li>)', r'<ul>\1</ul>', html, flags=re.DOTALL)

    # 粗体和斜体
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)

    # 链接转换
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)

    return html

# 读取博客内容
with open('$CONTENT_FILE', 'r', encoding='utf-8') as f:
    content = f.read()

# 转换为HTML
html_content = markdown_to_html(content)

# 读取HTML模板
with open('$OUTPUT_DIR/$BLOG_SLUG.html', 'r', encoding='utf-8') as f:
    html_template = f.read()

# 替换占位符
html_template = html_template.replace('<div id="blog-content-placeholder"></div>', html_content)

# 写回文件
with open('$OUTPUT_DIR/$BLOG_SLUG.html', 'w', encoding='utf-8') as f:
    f.write(html_template)

print("博客内容已处理完成")
EOF

echo "博客HTML文件已生成: $OUTPUT_DIR/$BLOG_SLUG.html"

# 部署到服务器 (需要配置SSH密钥)
echo "准备部署到 $BLOG_DOMAIN..."

# 这里需要配置实际的部署命令
# scp "$OUTPUT_DIR/$BLOG_SLUG.html" "user@$BLOG_DOMAIN:/var/www/html/blog/"
# ssh "user@$BLOG_DOMAIN" "systemctl reload nginx"

echo "博客发布完成！"
echo "访问地址: $BLOG_URL"
echo "本地文件: $OUTPUT_DIR/$BLOG_SLUG.html"
