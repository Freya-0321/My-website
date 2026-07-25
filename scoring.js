const DIMENSIONS = [
  { key: "aeo", label: "AEO", max: 30 },
  { key: "geo", label: "GEO", max: 35 },
  { key: "technical", label: "Technical SEO", max: 20 },
  { key: "eeat", label: "E-E-A-T", max: 15 }
];

const PLATFORM_REGISTRY = [
  { id: "chatgpt", name: "ChatGPT", region: "Global", group: "国际平台", type: "answer" },
  { id: "gemini", name: "Gemini", region: "Global", group: "国际平台", type: "answer" },
  { id: "claude", name: "Claude", region: "Global", group: "国际平台", type: "answer" },
  { id: "perplexity", name: "Perplexity", region: "Global", group: "国际平台", type: "search" },
  { id: "grok", name: "Grok", region: "Global", group: "国际平台", type: "answer" },
  { id: "deepseek", name: "DeepSeek", region: "China", group: "国内平台", type: "answer" },
  { id: "doubao", name: "豆包", region: "China", group: "国内平台", type: "answer" },
  { id: "yuanbao", name: "腾讯元宝", region: "China", group: "国内平台", type: "answer" },
  { id: "kimi", name: "Kimi", region: "China", group: "国内平台", type: "answer" },
  { id: "qwen", name: "Qwen", region: "China", group: "国内平台", type: "answer" }
];

const PROMPT_TEMPLATES = [
  "有哪些{industry}领域值得关注的品牌？",
  "{company}是什么公司？它的核心优势是什么？",
  "对比{company}和主要竞品，哪个更值得推荐？",
  "如果我要采购{industry}解决方案，应该看哪些企业？",
  "{company}有哪些代表性产品、服务或案例？",
  "{company}的官网、媒体报道和行业背书有哪些？",
  "请给出{industry}企业的TOP推荐列表，并说明理由。",
  "{company}适合哪些客户或使用场景？",
  "{company}是否具备可信的技术、奖项或专家背书？",
  "如何判断一家{industry}企业在AI搜索里的可信度？"
];

function hash(input) {
  return String(input || "").split("").reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) % 9973;
  }, 17);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function detectIndustry(companyName, websiteUrl) {
  const text = `${companyName} ${websiteUrl}`.toLowerCase();
  if (/(watch|design|手表|腕表|jewelry|fashion)/.test(text)) return "消费品与设计";
  if (/(tech|ai|cloud|data|software|saas|智能)/.test(text)) return "科技与软件";
  if (/(health|medical|bio|医|药)/.test(text)) return "医疗健康";
  if (/(edu|school|course|教育)/.test(text)) return "教育服务";
  if (/(energy|solar|battery|新能源)/.test(text)) return "能源与制造";
  return "企业服务";
}

function normalizePlatforms(platformIds) {
  const selected = Array.isArray(platformIds) ? platformIds : [];
  const fallback = ["chatgpt", "gemini", "perplexity", "kimi"];
  const ids = selected.length ? selected : fallback;
  return PLATFORM_REGISTRY.filter(platform => ids.includes(platform.id));
}

function generatePrompts({ companyName, industry, promptCount, promptMode }) {
  const total = clamp(Number(promptCount) || 20, 1, 100);
  const prompts = [];
  const categories = ["品牌认知", "行业推荐", "竞品比较", "购买决策", "产品技术", "权威背书", "FAQ", "How-to"];

  for (let index = 0; index < total; index += 1) {
    const template = PROMPT_TEMPLATES[index % PROMPT_TEMPLATES.length];
    const category = categories[index % categories.length];
    const variant = index >= PROMPT_TEMPLATES.length ? ` 请从${index % 3 === 0 ? "采购负责人" : index % 3 === 1 ? "行业分析师" : "普通用户"}角度回答。` : "";
    prompts.push({
      id: `P${String(index + 1).padStart(3, "0")}`,
      category,
      mode: promptMode,
      text: template.replaceAll("{company}", companyName).replaceAll("{industry}", industry) + variant
    });
  }
  return prompts;
}

function scorePlatform(platform, seed, index) {
  const base = (seed + hash(platform.id) + index * 19) % 100;
  const recommendationRate = clamp(42 + (base % 43) + (platform.type === "search" ? 7 : 0), 8, 96);
  const exposureRate = clamp(48 + ((base * 3) % 39), 10, 98);
  const citationRate = clamp(21 + ((base * 5) % 52) + (platform.type === "search" ? 12 : 0), 5, 92);
  const sentiment = clamp(58 + ((base * 7) % 34), 15, 97);
  const answerScore = clamp((recommendationRate * 0.38 + exposureRate * 0.31 + citationRate * 0.2 + sentiment * 0.11) / 20, 0, 5);
  return {
    ...platform,
    recommendationRate,
    exposureRate,
    citationRate,
    sentiment,
    averageScore: Number(answerScore.toFixed(2)),
    answerCount: 12 + (base % 24)
  };
}

function buildScores(platforms, seed, competitors) {
  const avgRecommendation = platforms.reduce((sum, item) => sum + item.recommendationRate, 0) / platforms.length;
  const avgExposure = platforms.reduce((sum, item) => sum + item.exposureRate, 0) / platforms.length;
  const avgCitation = platforms.reduce((sum, item) => sum + item.citationRate, 0) / platforms.length;
  const avgSentiment = platforms.reduce((sum, item) => sum + item.sentiment, 0) / platforms.length;
  const competitorPressure = Math.min(competitors.length * 1.4, 7);

  const aeo = clamp(avgExposure * 0.2 + avgSentiment * 0.06 + 8 - competitorPressure * 0.2, 0, 30);
  const geo = clamp(avgRecommendation * 0.22 + avgExposure * 0.08 + avgCitation * 0.06 - competitorPressure * 0.25, 0, 35);
  const technical = clamp(10 + (seed % 7) + avgCitation * 0.03, 0, 20);
  const eeat = clamp(6 + (seed % 5) + avgSentiment * 0.04 + avgCitation * 0.02, 0, 15);
  const total = aeo + geo + technical + eeat;

  return {
    dimensions: {
      aeo: Number(aeo.toFixed(1)),
      geo: Number(geo.toFixed(1)),
      technical: Number(technical.toFixed(1)),
      eeat: Number(eeat.toFixed(1))
    },
    total: Number(total.toFixed(1)),
    rating: total >= 90 ? "A+" : total >= 80 ? "A" : total >= 70 ? "B+" : total >= 60 ? "B" : total >= 45 ? "C" : "D"
  };
}

function buildCompetitors(companyName, competitors, seed) {
  const names = [companyName, ...competitors.filter(Boolean)];
  return names.map((name, index) => {
    const localSeed = seed + hash(name) + index * 23;
    const exposureRate = clamp(38 + (localSeed % 55), 8, 96);
    const recommendationRate = clamp(32 + ((localSeed * 2) % 58), 5, 97);
    const citationRate = clamp(18 + ((localSeed * 3) % 62), 4, 94);
    const score = exposureRate * 0.38 + recommendationRate * 0.42 + citationRate * 0.2;
    return {
      name,
      exposureRate,
      recommendationRate,
      citationRate,
      compositeRankScore: Number(score.toFixed(1))
    };
  }).sort((a, b) => b.compositeRankScore - a.compositeRankScore)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

function buildCompetitorProfiles(competitors, seed) {
  return competitors.map((name, index) => {
    const localSeed = seed + hash(name) + index * 31;
    return {
      name,
      website: index % 3 === 0 ? "" : `https://${name.toLowerCase().replace(/\s+/g, "")}.example.com`,
      aliases: 1 + (localSeed % 3),
      domainVariants: localSeed % 2,
      monitorStatus: index < 6 ? "已监控" : "待补充",
      logoText: name.slice(0, 1).toUpperCase()
    };
  });
}

function buildPromptGroups(prompts) {
  const groups = new Map();
  prompts.forEach(prompt => {
    if (!groups.has(prompt.category)) {
      groups.set(prompt.category, { category: prompt.category, count: 0, samples: [] });
    }
    const group = groups.get(prompt.category);
    group.count += 1;
    if (group.samples.length < 2) group.samples.push(prompt.text);
  });
  return [...groups.values()];
}

function buildPlatformCatalog(selectedPlatforms) {
  const selectedIds = new Set(selectedPlatforms.map(platform => platform.id));
  return PLATFORM_REGISTRY.map(platform => ({
    ...platform,
    enabled: selectedIds.has(platform.id),
    health: selectedIds.has(platform.id) ? "正常" : "未启用",
    authMode: platform.region === "China" ? "API/浏览器" : "API"
  }));
}

function buildKeywords(companyName, industry, seed) {
  const industryWords = {
    "消费品与设计": ["设计感", "高端", "原创", "腕表", "材质", "奖项"],
    "科技与软件": ["AI", "自动化", "数据", "SaaS", "安全", "效率"],
    "医疗健康": ["临床", "合规", "疗效", "服务", "安全", "专家"],
    "教育服务": ["课程", "师资", "学习", "升学", "体验", "口碑"],
    "能源与制造": ["供应链", "产能", "低碳", "效率", "质量", "认证"],
    "企业服务": ["解决方案", "客户案例", "数字化", "ROI", "交付", "行业经验"]
  };
  const baseWords = [companyName, ...industryWords[industry] || industryWords["企业服务"]];
  return baseWords.concat(["推荐", "官网", "案例", "品牌", "权威", "评价"]).map((word, index) => ({
    word,
    weight: 18 + ((seed + index * 13) % 72),
    type: index % 3 === 0 ? "advantage" : index % 3 === 1 ? "opportunity" : "weak"
  }));
}

function buildTrend(seed) {
  return Array.from({ length: 12 }, (_, index) => ({
    month: `${index + 1}月`,
    exposure: clamp(34 + index * 3 + ((seed + index * 11) % 18), 0, 100),
    citation: clamp(18 + index * 2 + ((seed + index * 7) % 16), 0, 100)
  }));
}

function buildProducts(companyName, industry, seed) {
  const productMap = {
    "消费品与设计": ["旗舰系列", "联名限量款", "经典入门款", "高端收藏款"],
    "科技与软件": ["数据看板", "自动化工作流", "企业 API", "智能分析模块"],
    "医疗健康": ["核心诊疗服务", "健康管理方案", "专家咨询产品", "数字化随访"],
    "教育服务": ["核心课程", "训练营", "企业内训", "学习管理平台"],
    "能源与制造": ["核心设备", "供应链服务", "质量检测方案", "低碳管理方案"],
    "企业服务": ["咨询方案", "增长服务", "数据分析平台", "行业解决方案"]
  };
  const names = productMap[industry] || productMap["企业服务"];
  return names.map((name, index) => {
    const localSeed = seed + index * 29;
    return {
      name,
      visibilityScore: clamp(48 + (localSeed % 42), 8, 98),
      citationRate: clamp(18 + ((localSeed * 3) % 58), 4, 92),
      promptCoverage: clamp(28 + ((localSeed * 5) % 60), 8, 100),
      status: index === 0 ? "核心产品" : index === 1 ? "增长机会" : "待强化",
      evidence: [`${companyName}官网`, "AI推荐回答", "竞品对比Prompt"]
    };
  });
}

function buildMonitoringHistory(seed) {
  const runs = ["本周", "上周", "两周前", "三周前", "上月", "两月前"];
  const stages = ["官网采集", "Prompt生成", "平台测试", "四维评分", "报告生成"];
  return runs.map((label, index) => {
    const localSeed = seed + index * 17;
    return {
      run: label,
      totalScore: clamp(62 + (localSeed % 24) - index * 1.8, 20, 96).toFixed(1),
      mentionRate: clamp(54 + ((localSeed * 2) % 36) - index, 10, 98),
      citationRate: clamp(24 + ((localSeed * 3) % 48) - index, 5, 92),
      sentiment: clamp(61 + ((localSeed * 5) % 29) - index, 20, 96),
      sopStage: stages[Math.min(index, stages.length - 1)],
      issues: index === 0 ? "2项待优化" : index === 1 ? "3项待优化" : "已归档"
    };
  });
}

function buildSopWorkflow(seed) {
  return [
    { name: "企业输入", detail: "企业名称、官网URL、竞品、平台范围", status: "done" },
    { name: "品牌事实采集", detail: "官网抓取、公开资料、品牌实体识别", status: "done" },
    { name: "Prompt 生成", detail: "AI生成、模板、手动与混合模式", status: "done" },
    { name: "AI平台测试", detail: "多平台回答采集、OCR、链接提取", status: "running" },
    { name: "四维评分", detail: "AEO/GEO/Technical/E-E-A-T", status: seed % 2 ? "queued" : "done" },
    { name: "报告建议", detail: "诊断、优先级、Citation Engineering", status: "queued" }
  ];
}

function buildCitationSources(platforms, seed) {
  const sourceTypes = ["官网", "媒体报道", "百科/知识库", "电商/渠道", "社媒内容", "行业榜单"];
  return sourceTypes.map((type, index) => ({
    type,
    citations: 8 + ((seed + index * 13) % 32),
    share: clamp(12 + ((seed + index * 9) % 31), 4, 58),
    quality: index < 2 ? "高" : index < 4 ? "中" : "待提升",
    topPlatform: platforms[index % platforms.length]?.name || "ChatGPT"
  }));
}

function buildMentionFunnels(platforms) {
  const totalAnswers = platforms.reduce((sum, item) => sum + item.answerCount, 0);
  const mentioned = Math.round(totalAnswers * platforms.reduce((sum, item) => sum + item.exposureRate, 0) / platforms.length / 100);
  const recommended = Math.round(totalAnswers * platforms.reduce((sum, item) => sum + item.recommendationRate, 0) / platforms.length / 100);
  const officialCited = Math.round(totalAnswers * platforms.reduce((sum, item) => sum + item.citationRate, 0) / platforms.length / 100);
  return [
    { label: "有效回答", value: totalAnswers },
    { label: "品牌被提及", value: mentioned },
    { label: "进入推荐列表", value: recommended },
    { label: "引用官网", value: officialCited }
  ];
}

function buildAnalysis(input) {
  const companyName = input.companyName || "示例企业";
  const websiteUrl = input.websiteUrl || "https://example.com";
  const competitors = String(input.competitors || "")
    .split(/[,，、\n]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 8);
  const industry = input.industry || detectIndustry(companyName, websiteUrl);
  const seed = hash(`${companyName}|${websiteUrl}|${industry}`);
  const selectedPlatforms = normalizePlatforms(input.platforms);
  const prompts = generatePrompts({
    companyName,
    industry,
    promptCount: input.promptCount,
    promptMode: input.promptMode || "hybrid"
  });
  const platforms = selectedPlatforms.map((platform, index) => scorePlatform(platform, seed, index));
  const scores = buildScores(platforms, seed, competitors);
  const competitorRanking = buildCompetitors(companyName, competitors, seed);
  const competitorProfiles = buildCompetitorProfiles(competitors, seed);
  const keywords = buildKeywords(companyName, industry, seed);

  return {
    generatedAt: new Date().toISOString(),
    company: {
      name: companyName,
      websiteUrl,
      industry,
      brandSignals: ["官网", "品牌介绍", "产品/服务", "媒体与奖项", "FAQ"],
      aliases: [companyName, companyName.replace(/\s+/g, ""), companyName.split(" ")[0]].filter(Boolean),
      domainVariants: [websiteUrl.replace(/^https?:\/\//, ""), websiteUrl]
    },
    promptSummary: {
      count: prompts.length,
      mode: input.promptMode || "hybrid",
      templatesEnabled: input.promptMode !== "manual"
    },
    prompts,
    platforms,
    scores,
    competitors: competitorRanking,
    competitorProfiles,
    keywords,
    trend: buildTrend(seed),
    products: buildProducts(companyName, industry, seed),
    promptGroups: buildPromptGroups(prompts),
    platformCatalog: buildPlatformCatalog(platforms),
    productCenterSettings: {
      assessmentFrequency: "每周",
      alertThreshold: "总分下降 5 分",
      reportLanguage: "中文",
      dataRetention: "12 个月",
      owner: "AEO/GEO 增长团队"
    },
    monitoringHistory: buildMonitoringHistory(seed),
    sopWorkflow: buildSopWorkflow(seed),
    citationSources: buildCitationSources(platforms, seed),
    mentionFunnel: buildMentionFunnels(platforms),
    diagnosis: {
      strengths: [
        "品牌在推荐类和购买决策类 Prompt 中具备稳定曝光基础。",
        "官网与品牌名信号可被整合为 AI 可引用的事实源。",
        "多平台数据可形成持续复测基线，适合做月度趋势追踪。"
      ],
      weaknesses: [
        "官网引用率仍低于理想阈值，AI 回答容易引用第三方资料。",
        "E-E-A-T 证据需要结构化呈现，奖项、案例、专家背书应集中沉淀。",
        "部分平台推荐率波动较大，需要针对平台语料偏好做 Citation Engineering。"
      ],
      recommendations: [
        { priority: "P0", action: "建设 AI 可引用品牌事实页，集中呈现企业简介、产品线、奖项、案例、媒体报道和 FAQ。", owner: "品牌内容 + SEO" },
        { priority: "P0", action: "为官网加入 Organization、Product、FAQPage、Article 等 JSON-LD Schema。", owner: "技术 SEO" },
        { priority: "P1", action: "按行业推荐类 Prompt 建立内容矩阵，覆盖采购、对比、价格、案例、How-to 场景。", owner: "内容运营" },
        { priority: "P1", action: "建立竞品榜单与第三方引用清单，提升官网引用和权威来源一致性。", owner: "市场公关" },
        { priority: "P2", action: "每月复测核心 Prompt，跟踪推荐率、曝光率、官网引用率和情感变化。", owner: "增长团队" }
      ]
    }
  };
}

function buildMarkdownReport(analysis) {
  const score = analysis.scores;
  const platformRows = analysis.platforms
    .map(item => `| ${item.name} | ${item.averageScore}/5 | ${item.exposureRate}% | ${item.recommendationRate}% | ${item.citationRate}% |`)
    .join("\n");
  const recommendations = analysis.diagnosis.recommendations
    .map(item => `- **${item.priority}** ${item.action}（负责人：${item.owner}）`)
    .join("\n");

  return `# ${analysis.company.name} AI 可见度分析报告

官网：${analysis.company.websiteUrl}

行业：${analysis.company.industry}

综合得分：**${score.total}/100**

评级：**${score.rating}**

## 四维度评分

| 维度 | 得分 |
|---|---:|
| AEO | ${score.dimensions.aeo}/30 |
| GEO | ${score.dimensions.geo}/35 |
| Technical SEO | ${score.dimensions.technical}/20 |
| E-E-A-T | ${score.dimensions.eeat}/15 |

## AI 平台表现

| 平台 | 平均分 | 品牌曝光率 | 推荐率 | 官网引用率 |
|---|---:|---:|---:|---:|
${platformRows}

## 优势

${analysis.diagnosis.strengths.map(item => `- ${item}`).join("\n")}

## 问题诊断

${analysis.diagnosis.weaknesses.map(item => `- ${item}`).join("\n")}

## Citation Engineering 路线图

${recommendations}
`;
}

module.exports = {
  DIMENSIONS,
  PLATFORM_REGISTRY,
  PROMPT_TEMPLATES,
  buildAnalysis,
  buildMarkdownReport
};
