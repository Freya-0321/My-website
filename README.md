# Super AIGEO

Super AIGEO 是一个企业 AI 可见度（AEO/GEO）分析 SaaS 网站原型，包含：

- 全屏 Hero Landing Page
- 企业 AI 可见度 Dashboard
- 产品中心
- Prompt 管理
- AI 平台监控
- 竞品分析
- 引用分析
- Dify SOP 工作流状态
- Markdown/PDF 报告入口

## 上传到 GitHub

把本文件夹里的所有内容上传到 GitHub 仓库根目录。

推荐目录结构：

```text
api/
lib/
public/
package.json
vercel.json
README.md
```

## 本地运行

```bash
npm start
```

默认访问：

```text
http://127.0.0.1:4173
```

## Vercel 部署

1. 把本文件夹内容上传到 GitHub。
2. 在 Vercel 选择该 GitHub 仓库。
3. Framework Preset 选择 `Other`。
4. Build Command 留空。
5. Output Directory 留空。
6. 点击 Deploy。

Vercel 会使用 `public/` 作为静态网站，并使用 `api/` 下的 Serverless Functions 提供接口。
