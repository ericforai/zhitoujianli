# 智投简历系统 - 简历模板功能设计文档

**设计日期**: 2025-10-11
**设计者**: 智投简历开发团队
**版本**: v1.0

---

## 📋 目录

1. [需求分析](#需求分析)
2. [功能目标](#功能目标)
3. [技术架构](#技术架构)
4. [数据结构设计](#数据结构设计)
5. [API设计](#api设计)
6. [前端实现](#前端实现)
7. [后端实现](#后端实现)
8. [实施计划](#实施计划)
9. [风险评估](#风险评估)

---

## 需求分析

### 业务需求

#### 核心痛点

1. **简历填写门槛高**: 用户不知道如何组织简历内容
2. **格式不规范**: 不同用户简历格式差异大，影响解析质量
3. **字段遗漏**: 用户经常遗漏重要信息字段
4. **行业差异大**: 不同行业简历重点不同

#### 目标用户

1. **求职新手**: 没有简历经验，需要引导
2. **转行人员**: 需要针对新行业的简历建议
3. **高效求职者**: 希望快速填写简历
4. **跨行业求职**: 需要针对不同行业调整简历

### 功能需求

#### 必需功能(Must Have)

- ✅ 提供3-5种预设模板
- ✅ 模板分类(技术/商务/设计/通用)
- ✅ 基于模板快速填写
- ✅ 模板预览功能
- ✅ 自动字段验证

#### 期望功能(Should Have)

- 🔄 用户自定义模板
- 🔄 模板收藏功能
- 🔄 推荐最适合的模板
- 🔄 模板使用统计

#### 可选功能(Could Have)

- 💡 模板市场(分享模板)
- 💡 AI生成模板
- 💡 模板评分系统

---

## 功能目标

### 短期目标(MVP)

1. 实现3种核心模板(技术/商务/通用)
2. 支持基于模板填写简历
3. 模板预览和选择功能
4. 基本字段验证

### 中期目标(3个月)

1. 扩展到10种模板
2. 用户自定义模板
3. 模板推荐算法
4. 使用统计和分析

### 长期目标(6个月+)

1. 模板市场
2. AI动态生成模板
3. 多语言模板支持
4. 企业定制模板

---

## 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │TemplateSelector│ │TemplateEditor │ │TemplatePreview│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │ API Calls
┌──────────────────────────┴──────────────────────────────────┐
│                        后端层                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │           ResumeTemplateController                  │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │           ResumeTemplateService                     │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ File System
┌──────────────────────────┴──────────────────────────────────┐
│                      数据存储层                              │
│  ┌──────────────┐  ┌────────────────────────┐             │
│  │ templates/   │  │ user_data/{userId}/    │             │
│  │ - tech-*.json│  │ - custom_templates/    │             │
│  │ - biz-*.json │  │   - my_template.json   │             │
│  │ - general.json│ │                        │             │
│  └──────────────┘  └────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### 技术选型

| 层级     | 技术                    | 说明                   |
| -------- | ----------------------- | ---------------------- |
| 前端     | React + TypeScript      | 组件化开发             |
| 状态管理 | React Context           | 轻量级状态管理         |
| 样式     | Tailwind CSS            | 快速UI开发             |
| 后端     | Spring Boot 3 + Java 21 | 企业级框架             |
| 存储     | 文件系统(JSON)          | 简单可靠，易于版本控制 |
| 验证     | Jakarta Validation      | 标准验证框架           |

---

## 数据结构设计

### 1. 模板数据模型(ResumeTemplate)

```typescript
interface ResumeTemplate {
  // 基本信息
  id: string; // 唯一标识，如 "tech-java-dev"
  name: string; // 模板名称，如 "Java开发工程师"
  category: TemplateCategory; // 分类
  description: string; // 描述
  icon: string; // 图标(可选)

  // 字段定义
  fields: TemplateField[]; // 模板包含的字段

  // 元数据
  version: string; // 版本号
  author: string; // 作者
  isBuiltIn: boolean; // 是否内置模板
  isPublic: boolean; // 是否公开

  // 统计
  usageCount?: number; // 使用次数
  rating?: number; // 评分(1-5)

  // 时间戳
  createdAt: string;
  updatedAt: string;
}

enum TemplateCategory {
  TECH = 'tech', // 技术类
  BUSINESS = 'business', // 商务类
  DESIGN = 'design', // 设计类
  GENERAL = 'general', // 通用类
}
```

### 2. 字段定义(TemplateField)

```typescript
interface TemplateField {
  // 基本信息
  id: string; // 字段ID，如 "name", "skills"
  label: string; // 显示标签
  type: FieldType; // 字段类型

  // 验证规则
  required: boolean; // 是否必填
  minLength?: number; // 最小长度
  maxLength?: number; // 最大长度
  pattern?: string; // 正则表达式

  // 显示控制
  placeholder?: string; // 占位符
  helpText?: string; // 帮助文本
  order: number; // 显示顺序
  group?: string; // 字段分组

  // 默认值
  defaultValue?: any; // 默认值

  // 条件显示
  visibleWhen?: FieldCondition; // 显示条件
}

enum FieldType {
  TEXT = 'text', // 单行文本
  TEXTAREA = 'textarea', // 多行文本
  NUMBER = 'number', // 数字
  EMAIL = 'email', // 邮箱
  PHONE = 'phone', // 电话
  DATE = 'date', // 日期
  SELECT = 'select', // 下拉选择
  MULTISELECT = 'multiselect', // 多选
  ARRAY = 'array', // 数组(如技能列表)
  OBJECT = 'object', // 对象(如工作经历)
  FILE = 'file', // 文件
}

interface FieldCondition {
  field: string; // 依赖的字段
  operator: 'equals' | 'notEquals' | 'contains';
  value: any;
}
```

### 3. 预设模板示例

#### 技术类 - Java开发工程师

```json
{
  "id": "tech-java-dev",
  "name": "Java开发工程师",
  "category": "tech",
  "description": "适用于Java后端开发职位的简历模板",
  "icon": "💻",
  "version": "1.0.0",
  "author": "智投简历团队",
  "isBuiltIn": true,
  "isPublic": true,
  "fields": [
    {
      "id": "name",
      "label": "姓名",
      "type": "text",
      "required": true,
      "maxLength": 50,
      "placeholder": "请输入您的姓名",
      "order": 1
    },
    {
      "id": "current_title",
      "label": "当前职位",
      "type": "text",
      "required": true,
      "placeholder": "如：高级Java开发工程师",
      "helpText": "填写您当前或最近的职位",
      "order": 2
    },
    {
      "id": "years_experience",
      "label": "工作年限",
      "type": "number",
      "required": true,
      "placeholder": "如：5",
      "helpText": "填写您的总工作年限(年)",
      "order": 3
    },
    {
      "id": "skills",
      "label": "技术栈",
      "type": "array",
      "required": true,
      "placeholder": "如：Java、Spring Boot、MySQL",
      "helpText": "列出您掌握的主要技术，用逗号分隔",
      "order": 4,
      "defaultValue": ["Java", "Spring Boot", "MySQL", "Redis"]
    },
    {
      "id": "core_strengths",
      "label": "核心优势",
      "type": "array",
      "required": true,
      "minLength": 3,
      "maxLength": 5,
      "placeholder": "如：擅长高并发系统设计",
      "helpText": "3-5条核心优势，每条不超过18字",
      "order": 5
    },
    {
      "id": "work_experience",
      "label": "工作经历",
      "type": "textarea",
      "required": true,
      "minLength": 50,
      "placeholder": "请详细描述您的工作经历...",
      "helpText": "包括公司、职位、时间、主要职责和成就",
      "order": 6
    },
    {
      "id": "projects",
      "label": "项目经验",
      "type": "textarea",
      "required": false,
      "placeholder": "描述您参与的重要项目...",
      "helpText": "包括项目名称、技术栈、您的角色和贡献",
      "order": 7
    },
    {
      "id": "education",
      "label": "教育背景",
      "type": "text",
      "required": true,
      "placeholder": "如：浙江大学 计算机科学 本科",
      "order": 8
    },
    {
      "id": "company",
      "label": "当前公司",
      "type": "text",
      "required": false,
      "placeholder": "如：阿里巴巴",
      "order": 9
    },
    {
      "id": "email",
      "label": "邮箱",
      "type": "email",
      "required": false,
      "placeholder": "your.email@example.com",
      "order": 10
    },
    {
      "id": "phone",
      "label": "手机号",
      "type": "phone",
      "required": false,
      "placeholder": "138****8888",
      "order": 11
    }
  ],
  "createdAt": "2025-10-11T00:00:00Z",
  "updatedAt": "2025-10-11T00:00:00Z"
}
```

#### 商务类 - 市场营销

```json
{
  "id": "business-marketing",
  "name": "市场营销专员",
  "category": "business",
  "description": "适用于市场营销相关职位的简历模板",
  "icon": "📈",
  "version": "1.0.0",
  "author": "智投简历团队",
  "isBuiltIn": true,
  "isPublic": true,
  "fields": [
    {
      "id": "name",
      "label": "姓名",
      "type": "text",
      "required": true,
      "order": 1
    },
    {
      "id": "current_title",
      "label": "当前职位",
      "type": "text",
      "required": true,
      "placeholder": "如：市场营销经理",
      "order": 2
    },
    {
      "id": "years_experience",
      "label": "工作年限",
      "type": "number",
      "required": true,
      "order": 3
    },
    {
      "id": "skills",
      "label": "专业技能",
      "type": "array",
      "required": true,
      "placeholder": "如：市场分析、内容营销、社交媒体运营",
      "order": 4,
      "defaultValue": ["市场分析", "品牌推广", "数据分析", "内容营销"]
    },
    {
      "id": "core_strengths",
      "label": "核心优势",
      "type": "array",
      "required": true,
      "placeholder": "如：擅长用户增长策略",
      "order": 5
    },
    {
      "id": "achievements",
      "label": "主要成就",
      "type": "textarea",
      "required": true,
      "placeholder": "描述您的营销成就，最好有数据支撑...",
      "helpText": "如：主导XX项目，带来用户增长300%",
      "order": 6
    },
    {
      "id": "education",
      "label": "教育背景",
      "type": "text",
      "required": true,
      "order": 7
    }
  ],
  "createdAt": "2025-10-11T00:00:00Z",
  "updatedAt": "2025-10-11T00:00:00Z"
}
```

#### 通用模板

```json
{
  "id": "general-standard",
  "name": "通用简历模板",
  "category": "general",
  "description": "适用于大多数职位的标准简历模板",
  "icon": "📄",
  "version": "1.0.0",
  "author": "智投简历团队",
  "isBuiltIn": true,
  "isPublic": true,
  "fields": [
    {
      "id": "name",
      "label": "姓名",
      "type": "text",
      "required": true,
      "order": 1
    },
    {
      "id": "current_title",
      "label": "职位",
      "type": "text",
      "required": true,
      "order": 2
    },
    {
      "id": "years_experience",
      "label": "工作年限",
      "type": "number",
      "required": true,
      "order": 3
    },
    {
      "id": "skills",
      "label": "专业技能",
      "type": "array",
      "required": true,
      "order": 4
    },
    {
      "id": "core_strengths",
      "label": "核心优势",
      "type": "array",
      "required": true,
      "order": 5
    },
    {
      "id": "work_experience",
      "label": "工作经历",
      "type": "textarea",
      "required": true,
      "order": 6
    },
    {
      "id": "education",
      "label": "教育背景",
      "type": "text",
      "required": true,
      "order": 7
    }
  ],
  "createdAt": "2025-10-11T00:00:00Z",
  "updatedAt": "2025-10-11T00:00:00Z"
}
```

---

## API设计

### 后端API端点

#### 1. 获取模板列表

```
GET /api/resume-templates
```

**查询参数**:

- `category`: 可选，过滤分类
- `keyword`: 可选，搜索关键词
- `isBuiltIn`: 可选，是否仅内置模板

**响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": "tech-java-dev",
      "name": "Java开发工程师",
      "category": "tech",
      "description": "...",
      "icon": "💻",
      "usageCount": 1200,
      "rating": 4.8
    }
  ],
  "total": 10,
  "timestamp": 1234567890
}
```

#### 2. 获取模板详情

```
GET /api/resume-templates/{id}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "id": "tech-java-dev",
    "name": "Java开发工程师",
    "fields": [...],
    ...
  },
  "timestamp": 1234567890
}
```

#### 3. 应用模板创建简历

```
POST /api/resume-templates/{id}/apply
```

**请求体**:

```json
{
  "name": "张三",
  "current_title": "软件工程师",
  "skills": ["Java", "Python"],
  ...
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    // 完整的简历数据
  },
  "message": "简历创建成功",
  "timestamp": 1234567890
}
```

#### 4. 保存自定义模板

```
POST /api/resume-templates/custom
```

**请求体**:

```json
{
  "name": "我的自定义模板",
  "category": "tech",
  "fields": [...]
}
```

**响应**:

```json
{
  "success": true,
  "data": {
    "id": "custom-xxx",
    ...
  },
  "message": "模板保存成功",
  "timestamp": 1234567890
}
```

#### 5. 获取用户自定义模板

```
GET /api/resume-templates/custom
```

**响应**:

```json
{
  "success": true,
  "data": [...],
  "timestamp": 1234567890
}
```

#### 6. 删除自定义模板

```
DELETE /api/resume-templates/custom/{id}
```

**响应**:

```json
{
  "success": true,
  "message": "模板删除成功",
  "timestamp": 1234567890
}
```

---

## 前端实现

### 1. TemplateSelector组件

**功能**: 模板选择器

```typescript
// frontend/src/components/ResumeManagement/TemplateSelector.tsx

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 功能实现...

  return (
    <div className="template-selector">
      {/* 分类过滤 */}
      <CategoryFilter />

      {/* 搜索框 */}
      <SearchBox />

      {/* 模板列表 */}
      <TemplateGrid templates={filteredTemplates} onSelect={onSelect} />
    </div>
  );
};
```

### 2. TemplateEditor组件

**功能**: 基于模板填写简历

```typescript
// frontend/src/components/ResumeManagement/TemplateEditor.tsx

interface TemplateEditorProps {
  template: ResumeTemplate;
  initialData?: any;
  onSave: (data: any) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  initialData,
  onSave
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 根据字段类型渲染不同的输入组件
  const renderField = (field: TemplateField) => {
    switch (field.type) {
      case 'text':
        return <TextInput field={field} />;
      case 'textarea':
        return <TextareaInput field={field} />;
      case 'array':
        return <ArrayInput field={field} />;
      // ... 其他类型
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {template.fields.map(field => (
        <div key={field.id}>
          {renderField(field)}
        </div>
      ))}
      <button type="submit">保存简历</button>
    </form>
  );
};
```

### 3. TemplatePreview组件

**功能**: 模板预览

```typescript
// frontend/src/components/ResumeManagement/TemplatePreview.tsx

const TemplatePreview: React.FC<{ template: ResumeTemplate }> = ({ template }) => {
  return (
    <div className="template-preview">
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      <div className="fields-preview">
        {template.fields.map(field => (
          <div key={field.id} className="field-item">
            <label>{field.label}</label>
            {field.required && <span className="required">*</span>}
            <p className="help-text">{field.helpText}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 后端实现

### 1. ResumeTemplateController

```java
// backend/get_jobs/src/main/java/controller/ResumeTemplateController.java

@RestController
@RequestMapping("/api/resume-templates")
@Slf4j
public class ResumeTemplateController {

    @Autowired
    private ResumeTemplateService templateService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listTemplates(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isBuiltIn) {

        List<ResumeTemplate> templates = templateService.listTemplates(category, keyword, isBuiltIn);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", templates);
        response.put("total", templates.size());
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTemplate(@PathVariable String id) {
        // 实现...
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Map<String, Object>> applyTemplate(
            @PathVariable String id,
            @RequestBody Map<String, Object> data) {
        // 实现...
    }

    @PostMapping("/custom")
    public ResponseEntity<Map<String, Object>> saveCustomTemplate(
            @RequestBody ResumeTemplate template) {
        // 实现...
    }
}
```

### 2. ResumeTemplateService

```java
// backend/get_jobs/src/main/java/service/ResumeTemplateService.java

@Service
@Slf4j
public class ResumeTemplateService {

    private static final String TEMPLATES_DIR = "templates";
    private static final String USER_TEMPLATES_DIR = "user_data/{userId}/custom_templates";

    public List<ResumeTemplate> listTemplates(String category, String keyword, Boolean isBuiltIn) {
        // 从文件系统加载模板
        // 应用过滤条件
        // 返回模板列表
    }

    public ResumeTemplate getTemplate(String id) {
        // 加载指定ID的模板
    }

    public Map<String, Object> applyTemplate(String id, Map<String, Object> data) {
        // 验证数据
        // 应用模板
        // 保存简历
    }

    public ResumeTemplate saveCustomTemplate(ResumeTemplate template, String userId) {
        // 保存用户自定义模板
    }
}
```

---

## 实施计划

### 阶段1：设计和准备(1天)

**任务**:

- [x] 完成数据结构设计
- [x] 设计API接口
- [x] 准备3个预设模板
- [ ] UI/UX设计评审

**交付物**:

- ✅ 设计文档
- 📝 模板JSON文件
- 🎨 UI原型

### 阶段2：后端开发(2天)

**任务**:

- [ ] 实现ResumeTemplateController
- [ ] 实现ResumeTemplateService
- [ ] 文件存储逻辑
- [ ] API单元测试
- [ ] 集成测试

**交付物**:

- 后端代码
- 测试用例
- API文档

### 阶段3：前端开发(2天)

**任务**:

- [ ] 实现TemplateSelector组件
- [ ] 实现TemplateEditor组件
- [ ] 实现TemplatePreview组件
- [ ] 表单验证逻辑
- [ ] 组件单元测试

**交付物**:

- 前端组件
- 测试用例
- 组件文档

### 阶段4：集成和测试(1天)

**任务**:

- [ ] 前后端集成
- [ ] 端到端测试
- [ ] 性能测试
- [ ] 用户体验测试
- [ ] Bug修复

**交付物**:

- 集成系统
- 测试报告
- Bug修复记录

### 阶段5：发布和文档(0.5天)

**任务**:

- [ ] 部署到生产环境
- [ ] 用户使用指南
- [ ] 开发文档更新
- [ ] 发布说明

**交付物**:

- 生产环境部署
- 用户手册
- 开发文档

---

## 风险评估

### 技术风险

| 风险项           | 概率 | 影响 | 缓解措施             |
| ---------------- | ---- | ---- | -------------------- |
| 模板字段验证复杂 | 中   | 中   | 使用成熟的验证框架   |
| 文件存储性能问题 | 低   | 中   | 引入缓存机制         |
| 前端表单复杂度高 | 中   | 中   | 组件化设计，复用性强 |
| 模板兼容性问题   | 低   | 高   | 版本控制，向后兼容   |

### 业务风险

| 风险项         | 概率 | 影响 | 缓解措施           |
| -------------- | ---- | ---- | ------------------ |
| 用户不喜欢模板 | 中   | 高   | 收集反馈，快速迭代 |
| 模板内容不专业 | 中   | 高   | 请行业专家审核     |
| 使用率低       | 低   | 中   | 加强用户引导和教育 |

### 时间风险

| 风险项       | 概率 | 影响 | 缓解措施            |
| ------------ | ---- | ---- | ------------------- |
| 开发时间超期 | 中   | 中   | MVP优先，功能分阶段 |
| 测试不充分   | 低   | 高   | 自动化测试，CI/CD   |

---

## 成功指标

### 技术指标

- ✅ 模板加载时间 < 500ms
- ✅ 表单验证响应时间 < 100ms
- ✅ 测试覆盖率 ≥ 70%
- ✅ 0个P0 bug发布

### 业务指标

- 🎯 模板使用率 ≥ 50% (首月)
- 🎯 用户满意度 ≥ 4.0/5.0
- 🎯 简历完成时间减少 30%
- 🎯 简历质量提升(字段完整度 ≥ 90%)

---

## 附录

### A. 预设模板清单

1. **技术类**
   - Java开发工程师 ✅
   - 前端开发工程师 🔄
   - 数据分析师 🔄
   - 产品经理 🔄

2. **商务类**
   - 市场营销专员 ✅
   - 销售代表 🔄
   - 运营专员 🔄

3. **设计类**
   - UI/UX设计师 🔄
   - 平面设计师 🔄

4. **通用类**
   - 标准简历模板 ✅

### B. 字段类型支持列表

| 类型        | 说明     | MVP支持 |
| ----------- | -------- | ------- |
| text        | 单行文本 | ✅      |
| textarea    | 多行文本 | ✅      |
| number      | 数字     | ✅      |
| email       | 邮箱     | ✅      |
| phone       | 电话     | ✅      |
| date        | 日期     | 🔄      |
| select      | 下拉选择 | 🔄      |
| multiselect | 多选     | 🔄      |
| array       | 数组     | ✅      |
| object      | 对象     | 🔄      |
| file        | 文件     | ❌      |

### C. 参考资料

- [React Hook Form文档](https://react-hook-form.com/)
- [Jakarta Validation规范](https://jakarta.ee/specifications/bean-validation/)
- [简历最佳实践](https://www.indeed.com/career-advice/)

---

**文档版本**: v1.0
**最后更新**: 2025-10-11
**审核状态**: 待审核

---

_本文档由智投简历开发团队编写，保留所有权利。_
