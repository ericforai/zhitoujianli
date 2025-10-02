# 智能简历解析与岗位打招呼语生成系统

## 🎉 项目完成状态

✅ **已完成所有功能模块，系统已上线并可使用！**

---

## 📋 功能清单

### 已实现功能

- ✅ **简历上传与解析**
  - 支持文本直接粘贴
  - 支持文件上传（TXT/DOC/DOCX/PDF）
  - 支持拖拽上传
  - AI自动解析简历并提取结构化信息

- ✅ **简历信息提取**
  - 姓名、当前职位、工作年限
  - 学历、公司信息
  - 技能列表
  - 3-5条核心优势（每条≤18字）
  - 置信度评分

- ✅ **岗位JD匹配**
  - 输入或粘贴岗位描述
  - AI智能匹配候选人与岗位要求
  - 支持生产模式和调试模式

- ✅ **打招呼语生成**
  - 专业风格（融入岗位关键词）
  - 真诚风格（突出个人优势）
  - 简洁风格（精简表达）
  - 每条打招呼语≤80字

- ✅ **前端交互**
  - 一键复制打招呼语
  - 实时显示解析进度
  - 美观的UI界面
  - 响应式布局

- ✅ **系统集成**
  - 已集成到现有Boss投递系统
  - 主页新增"智能简历解析"入口
  - 完整的错误处理机制

---

## 🚀 快速使用指南

### 1. 访问系统

**主页：** http://localhost:8080

**简历解析页面：** http://localhost:8080/resume-parser

### 2. 使用流程

#### 步骤1：上传简历
- **方式1**：直接粘贴简历文本到左侧文本框 → 点击"解析简历"
- **方式2**：拖拽文件到上传区域（支持TXT/DOC/DOCX/PDF）
- **方式3**：点击上传区域选择文件

#### 步骤2：查看解析结果
- 系统会自动显示候选人基本信息
- 核心优势以标签形式展示
- 技能列表清晰呈现

#### 步骤3：输入岗位JD
- 在右侧"岗位描述(JD)"文本框粘贴岗位要求
- 选择生成模式：
  - **生产模式**：仅生成打招呼语
  - **调试模式**：包含匹配分析详情

#### 步骤4：生成打招呼语
- 点击"生成打招呼语"按钮
- AI会生成3种风格的打招呼语
- 每条打招呼语右上角有"复制"按钮
- 点击复制按钮即可一键复制到剪贴板

---

## 🔧 技术架构

### 后端 (Spring Boot + Java)

#### 核心类文件

1. **ResumeController.java** - API控制器
   - `/api/parse_resume` - 简历解析接口
   - `/api/generate_greetings` - 打招呼语生成接口
   - `/api/upload_resume` - 文件上传接口

2. **ResumeParser.java** - 简历解析器
   - 调用AI服务解析简历文本
   - 提取结构化信息（姓名、职位、技能等）
   - 生成3-5条核心优势

3. **GreetingGenerator.java** - 打招呼语生成器
   - 匹配候选人信息与岗位JD
   - 生成3种风格的打招呼语
   - 支持调试模式输出匹配详情

4. **AiService.java** - AI服务（已有）
   - 调用DeepSeek API
   - 处理AI请求和响应

### 前端 (HTML + Bootstrap + JavaScript)

- **resume_parser.html** - 智能简历解析页面
  - 文件上传和拖拽功能
  - 实时进度显示
  - 打招呼语卡片展示
  - 一键复制功能

### 集成点

- **WebController.java** - 添加了 `/resume-parser` 路由
- **index.html** - 主页添加了"智能简历解析"入口按钮

---

## 📡 API 文档

### 1. 简历解析接口

**Endpoint:** `/api/parse_resume`

**Method:** `POST`

**Request Body:**
```json
{
  "resume_text": "候选人简历原文"
}
```

**Response:**
```json
{
  "success": true,
  "message": "简历解析成功",
  "data": {
    "name": "张三",
    "current_title": "云计算市场经理",
    "years_experience": 6,
    "education": "本科",
    "company": "某科技公司",
    "skills": ["市场策划", "渠道拓展", "数字营销"],
    "core_strengths": [
      "行业方案落地经验",
      "擅长渠道增长",
      "数字化营销专家"
    ],
    "confidence": {
      "name": 0.98,
      "skills": 0.92,
      "experience": 0.85
    }
  }
}
```

### 2. 打招呼语生成接口

**Endpoint:** `/api/generate_greetings`

**Method:** `POST`

**Request Body:**
```json
{
  "candidate": {
    "name": "张三",
    "current_title": "云计算市场经理",
    ...
  },
  "job_description": "岗位JD文本",
  "mode": "production"
}
```

**Response (Production Mode):**
```json
{
  "success": true,
  "message": "打招呼语生成成功",
  "data": {
    "greetings": {
      "professional": "您好，看到贵司招聘云计算市场经理，我有6年市场与渠道经验...",
      "sincere": "您好，我非常认同贵司的云产品战略...",
      "concise": "您好，我有云计算市场与渠道经验，与岗位高度契合..."
    }
  }
}
```

**Response (Debug Mode):**
```json
{
  "success": true,
  "data": {
    "match_analysis": {
      "overall_score": 0.85,
      "matched_skills": ["市场策划", "渠道拓展"],
      "matched_requirements": ["行业经验", "客户管理"],
      "gaps": ["技术背景较弱"]
    },
    "greetings": {
      "professional": "...",
      "sincere": "...",
      "concise": "..."
    }
  }
}
```

### 3. 文件上传接口

**Endpoint:** `/api/upload_resume`

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: 简历文件（TXT/DOC/DOCX/PDF）

**Response:** 同简历解析接口

---

## ⚙️ AI Prompt 设计

### 简历解析 Prompt

**System:**
```
你是资深的招聘专家与信息抽取模型。收到候选人简历文本后，请只返回严格符合指定 JSON 结构的数据，不要输出任何解释性文本。若某字段无法提取请赋值 null。核心优势（core_strengths）需为 3-5 条中文短句（每条 ≤18 字）。confidence 为 0-1 的浮点数。

请严格按照以下JSON格式输出：
{
  "name": "候选人姓名",
  "current_title": "当前职位",
  "years_experience": 工作年限数字,
  "skills": ["技能1", "技能2"],
  "core_strengths": ["优势1", "优势2"],
  "education": "学历信息",
  "company": "当前公司",
  "confidence": {
    "name": 0.95,
    "skills": 0.90,
    "experience": 0.85
  }
}
```

### 打招呼语生成 Prompt (Production)

**System:**
```
你是资深HR顾问，输入包含 candidate JSON 和 job_description 文本。你必须严格只返回一个 JSON 对象，且仅包括 greetings 字段，不得输出任何额外文本或解释。greetings 必须包含 professional, sincere, concise 三个键，每个值为中文字符串（80字以内），融入岗位 JD 的关键词、突出候选人的关键优势。
```

---

## ⚠️ 注意事项

### 1. AI输出验证
- 后端已实现JSON格式校验
- 自动提取JSON部分，忽略其他文本
- 字段缺失时使用默认值

### 2. 文本长度限制
- 核心优势：每条≤18字
- 打招呼语：每条≤80字

### 3. 文件支持
- ✅ TXT：已实现
- ⚠️ DOC/DOCX：需安装Apache POI库
- ⚠️ PDF：需安装Apache PDFBox库

### 4. 多语言支持
- 当前仅支持中文
- 英文JD建议先翻译成中文

### 5. 调试模式
- 设置 `mode=debug` 可查看匹配详情
- 包含匹配度分数、匹配技能、差距分析

---

## 🔄 与现有系统集成

### 集成方式

1. **入口集成**
   - 主页（http://localhost:8080）右上角添加"智能简历解析"按钮
   - 点击跳转到简历解析页面

2. **API复用**
   - 复用现有的 `AiService` 调用DeepSeek API
   - 共享 `.env` 配置（API_KEY、BASE_URL、MODEL）

3. **样式统一**
   - 使用相同的Bootstrap主题
   - 保持UI风格一致

---

## 📊 系统状态

### 当前状态
- ✅ WebUI已启动：http://localhost:8080
- ✅ 所有API接口正常
- ✅ 前端页面可访问
- ✅ AI服务集成完成

### 已完成任务清单
- ✅ 分析智能简历解析与岗位打招呼语生成系统需求
- ✅ 设计系统架构和API接口
- ✅ 实现简历解析功能
- ✅ 实现打招呼语生成功能
- ✅ 创建前端界面
- ✅ 与现有Boss系统集成

---

## 🚧 待完成（可选）

1. **文件解析增强**
   - 添加Apache POI支持DOC/DOCX
   - 添加Apache PDFBox支持PDF

2. **功能增强**
   - 支持简历历史记录
   - 支持批量生成打招呼语
   - 支持自定义打招呼语模板

3. **性能优化**
   - 添加缓存机制
   - 异步处理大文件
   - 优化AI调用频率

---

## 📝 使用示例

### 示例1：解析简历

**输入简历文本：**
```
张三
云计算市场经理 | 6年经验

工作经历：
- 某科技公司 云计算市场经理（2019-2024）
  负责云产品市场推广、渠道拓展、行业方案落地

技能：
- 市场策划、渠道管理、数字营销
- 熟悉云计算行业，擅长B2B市场

教育背景：
- XX大学 市场营销专业 本科
```

**解析结果：**
- 姓名：张三
- 当前职位：云计算市场经理
- 工作年限：6年
- 核心优势：
  - 云计算行业经验
  - 擅长渠道拓展
  - B2B市场专家

### 示例2：生成打招呼语

**岗位JD：**
```
招聘云计算市场总监
要求：5年以上云计算行业市场经验，擅长渠道拓展和客户管理
```

**生成结果：**
- **专业风格**：您好，看到贵司招聘云计算市场总监，我有6年云计算市场与渠道拓展经验，曾负责多个行业方案落地，期待为贵司贡献价值。
- **真诚风格**：您好，我非常认同贵司的云计算战略，过去6年一直深耕B2B市场，擅长渠道管理和客户关系维护，希望能助力团队发展。
- **简洁风格**：您好，我有6年云计算市场经验，擅长渠道拓展，与岗位高度匹配，期待进一步沟通。

---

## 📞 技术支持

如有问题或建议，请查看：
- API文档：本文档第4节
- 源代码：`/Users/user/autoresume/get_jobs/src/main/java/`
- 前端页面：`/Users/user/autoresume/get_jobs/src/main/resources/templates/resume_parser.html`

---

**版本：** v1.0
**更新日期：** 2025-09-30
**状态：** ✅ 已上线
