from PIL import Image, ImageDraw, ImageFont
import os

# 创建图片目录
os.makedirs('.', exist_ok=True)

# 文章配图配置
articles = [
    {
        'filename': 'career-development-guide.jpg',
        'title': '职场发展指南',
        'subtitle': '从新手到专家的成长路径',
        'color': (59, 130, 246)  # 蓝色
    },
    {
        'filename': 'ai-job-matching.jpg', 
        'title': 'AI职位匹配技术',
        'subtitle': '让求职更精准',
        'color': (16, 185, 129)  # 绿色
    },
    {
        'filename': 'industry-trends.jpg',
        'title': '就业市场趋势分析',
        'subtitle': 'AI时代的职业新机遇',
        'color': (239, 68, 68)   # 红色
    },
    {
        'filename': 'resume-optimization-tips.jpg',
        'title': '简历优化技巧',
        'subtitle': '让你的简历脱颖而出',
        'color': (168, 85, 247)  # 紫色
    },
    {
        'filename': 'interview-preparation-guide.jpg',
        'title': '面试准备指南',
        'subtitle': '面试成功的秘诀',
        'color': (245, 158, 11)  # 橙色
    }
]

def create_article_image(config):
    # 创建图片
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    # 绘制背景渐变
    for y in range(600):
        color_ratio = y / 600
        r = int(config['color'][0] * (1 - color_ratio * 0.3))
        g = int(config['color'][1] * (1 - color_ratio * 0.3))
        b = int(config['color'][2] * (1 - color_ratio * 0.3))
        draw.line([(0, y), (800, y)], fill=(r, g, b))
    
    # 添加标题
    try:
        title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 48)
        subtitle_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # 绘制标题
    title_bbox = draw.textbbox((0, 0), config['title'], font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (800 - title_width) // 2
    draw.text((title_x, 200), config['title'], fill='white', font=title_font)
    
    # 绘制副标题
    subtitle_bbox = draw.textbbox((0, 0), config['subtitle'], font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (800 - subtitle_width) // 2
    draw.text((subtitle_x, 280), config['subtitle'], fill='white', font=subtitle_font)
    
    # 添加装饰元素
    draw.rectangle([100, 100, 700, 500], outline='white', width=3)
    
    # 保存图片
    img.save(config['filename'], 'JPEG', quality=85)
    print(f"Created {config['filename']}")

# 创建所有图片
for article in articles:
    create_article_image(article)

print("All images created successfully!")
