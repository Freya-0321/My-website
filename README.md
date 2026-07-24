# 企业 AI 可见度自动化分析平台（AI Visibility Platform）

自动化评估企业品牌在 Claude、ChatGPT、Gemini、Perplexity 等主流 AI 大模型中的
**AEO（Answer Engine Optimization）/ GEO（Generative Engine Optimization）可见度**，
将「大模型怎么推荐你的品牌」变成一套可持续追踪、可量化优化的指标体系。

方法论与评分公式参考了 CIGA Design（玺佳）品牌的 AEO/GEO 可见度分析报告
（四维度：AEO 30 分 + GEO 35 分 + Technical SEO 20 分 + E-E-A-T 15 分 = 综合 100 分）。

---

## 一、功能概览

| 模块 | 说明 |
| --- | --- |
| AI 模型测试器 | 可插拔架构，内置 Claude / ChatGPT / Gemini / Perplexity 四个测试器，新增平台只需实现一个 `query()` 方法并注册 |
| AEO/GEO 评分计算器 | 完整还原四维度评分公式，支持结构化分项打分与自动等级判定（卓越/良好/中等/较低/极差）|
| 自动化监控 | Celery Beat 定时任务，按周期重跑核心 Prompt，得分大幅下降时输出告警日志 |
| 数据可视化仪表盘 | 综合评分环形图、四维度雷达图、平台对比柱状图、历史趋势折线图 |
| 报告导出 | 一键导出 Excel / CSV 明细数据 |
| Playwright 爬虫 | 可选模块，用于没有开放 API 的平台，模拟网页端提问并截图留证 |

---

## 二、技术栈

- **后端**：Python 3.11 · FastAPI · SQLAlchemy 2.0（异步）· Celery · Redis
- **前端**：Next.js 14（App Router）· TypeScript · TailwindCSS · Recharts
- **数据库**：PostgreSQL 16
- **AI 集成**：anthropic / openai / google-generativeai SDK，Perplexity 走 HTTP API
- **爬虫**：Playwright + BeautifulSoup4
- **部署**：Docker + Docker Compose

---

## 三、目录结构

```
ai-visibility-platform/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI 入口
│   │   ├── config.py                # 全局配置（环境变量驱动）
│   │   ├── models/                  # SQLAlchemy 模型：Brand / Evaluation / TestResult / MonitorLog
│   │   ├── schemas/                 # Pydantic Schema
│   │   ├── api/v1/endpoints/        # brands / evaluations / reports / monitors
│   │   ├── services/
│   │   │   ├── ai_testers/          # 各平台测试器 + 工厂函数 get_tester()
│   │   │   ├── calculators/         # 评分计算核心：visibility_calculator.py
│   │   │   ├── monitors/            # 定时监控逻辑
│   │   │   └── crawlers/            # Playwright 网页爬虫
│   │   ├── tasks/                   # Celery 任务：evaluation_tasks / monitor_tasks
│   │   └── db/                      # 数据库会话与 CRUD
│   ├── tests/                       # pytest 单元测试
│   ├── alembic/                     # 数据库迁移
│   └── requirements.txt / Dockerfile
├── frontend/
│   ├── app/                         # page / dashboard / evaluations / reports
│   ├── components/                  # 图表、表单、表格、导航等组件
│   ├── lib/                         # api.ts（后端调用）/ utils.ts
│   └── package.json / Dockerfile
├── docker-compose.yml
├── .env.example
├── Makefile
└── README.md
```

---

## 四、快速开始

### 1. 准备环境变量

```bash
cp .env.example .env
# 编辑 .env，至少填入你要使用的平台的 API Key：
# ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY / PERPLEXITY_API_KEY
```

### 2. 一键启动全部服务

```bash
make dev
```

该命令会启动：PostgreSQL、Redis、FastAPI 后端（:8000）、Celery Worker、Celery Beat、Next.js 前端（:3000）。

首次启动后端会自动建表（`init_db()`），生产环境建议改用 Alembic 迁移：

```bash
make migrate
```

### 3. 访问

- 前端仪表盘：http://localhost:3000
- 后端 API 文档（Swagger）：http://localhost:8000/docs
- 健康检查：http://localhost:8000/health

### 4. 运行测试

```bash
make test
```

### 5. 常用命令

```bash
make logs     # 查看全部服务日志
make stop     # 停止所有服务
make clean    # 停止并清空数据库数据卷（慎用）
```

---

## 五、评分公式说明

```
AEO总分       = Σ(AEO各结构化分项得分)                          # 满分 30
GEO总分       = (实际总得分 / (N题 × M平台 × 5分)) × 35          # 满分 35，由实测数据动态计算
Technical总分 = Σ(Technical各结构化分项得分)                     # 满分 20
E-E-A-T总分   = Σ(E-E-A-T各结构化分项得分)                       # 满分 15

综合总分 = AEO总分 + GEO总分 + Technical总分 + E-E-A-T总分   （满分 100）
得分率   = 综合总分 / 100

等级：
  ≥90 卓越   ≥75 良好   ≥60 中等   ≥40 较低   <40 极差
```

单条 Prompt 在单个平台的 0-5 分评分标准：

| 分值 | 含义 |
| --- | --- |
| 5 | 首要推荐 / 核心详解 |
| 4 | 积极提及（前5名，描述积极无误）|
| 3 | 普通提及（位置靠后或描述简略）|
| 2 | 简单提及（长列表中一笔带过）|
| 1 | 回答错误（关联错误信息）|
| 0 | 完全未出现 |

代码实现见 `backend/app/services/calculators/visibility_calculator.py`，
对应的单元测试见 `backend/tests/test_calculator.py`。

---

## 六、扩展新的 AI 平台

只需两步：

1. 在 `backend/app/services/ai_testers/` 下新建 `xxx_tester.py`，继承 `BaseAITester` 并实现 `query()`：

```python
class XxxTester(BaseAITester):
    platform_name = "xxx"

    async def query(self, prompt: str) -> str:
        # 调用对应 SDK / HTTP API，返回纯文本回答
        ...
```

2. 在 `backend/app/services/ai_testers/__init__.py` 的 `TESTER_REGISTRY` 中注册即可，
   品牌提及检测、情感判断、重试、批量并发等能力自动继承，无需重复实现。

---

## 七、重要说明与注意事项

- **API 密钥安全**：`.env` 已加入 `.gitignore`，切勿将真实密钥提交到版本库；生产环境建议使用密钥管理服务（如 AWS Secrets Manager / Vault）。
- **情感分析**：内置版本使用轻量级关键词规则判断情感倾向，适合快速起步；生产环境建议替换为基于 LLM 的分类器以提升准确度。
- **Playwright 爬虫**：`crawlers/ai_crawler.py` 中的选择器为示例配置，各平台网页版 DOM 结构会不定期调整，实际使用前需要重新校准，并注意遵守各平台的服务条款。
- **限流与重试**：`BaseAITester` 内置指数退避重试，`MAX_RETRY_COUNT` 可在 `.env` 中调整；生产环境建议再加一层令牌桶限流，避免触发平台侧的速率限制。
- **本项目为架构与代码脚手架**：核心业务逻辑（评分公式、测试器、API、前端页面）均为完整可运行实现，但受限于当前生成环境无网络访问，未执行真实的 `docker compose up` 联调测试，建议在本地/服务器环境完成首次构建验证后再用于生产。

---

## 八、License

本项目代码仅供内部评估与学习使用，请遵守所调用的各 AI 平台的服务条款（Terms of Service）。
