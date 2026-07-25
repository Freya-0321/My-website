const state = {
  config: null,
  analysis: null,
  promptMode: "hybrid"
};

const $ = selector => document.querySelector(selector);

function initLandingExperience() {
  const video = $("#heroVideo");
  const typewriter = $("#typewriterText");
  const actions = $("#heroActions");
  const menuButton = $("#mobileMenuButton");
  const mobileOverlay = $("#mobileOverlay");
  const copyButton = $("#copyEmailButton");
  const message = "Glad you stopped in. AI answers are already shaping demand. Super AIGEO shows where your brand appears, why it ranks, and what to fix next.";
  const sensitivity = 0.8;
  let prevX = null;
  let targetTime = 0;
  let seeking = false;
  let loaded = false;

  function clampTime(value) {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    return Math.max(0, Math.min(duration, value));
  }

  function requestSeek() {
    if (!loaded || seeking) return;
    if (Math.abs(video.currentTime - targetTime) < 0.03) return;
    seeking = true;
    video.currentTime = clampTime(targetTime);
  }

  video?.addEventListener("loadedmetadata", () => {
    loaded = true;
    targetTime = clampTime(video.currentTime || 0);
  });

  video?.addEventListener("seeked", () => {
    seeking = false;
    requestSeek();
  });

  window.addEventListener("mousemove", event => {
    if (!video || !loaded || !Number.isFinite(video.duration)) return;
    if (prevX == null) {
      prevX = event.clientX;
      return;
    }
    const delta = event.clientX - prevX;
    prevX = event.clientX;
    targetTime = clampTime(targetTime + (delta / window.innerWidth) * sensitivity * video.duration);
    requestSeek();
  });

  window.addEventListener("scroll", () => {
    const shouldHide = window.scrollY > window.innerHeight * 0.72;
    document.querySelector(".landing-navbar")?.classList.toggle("is-hidden", shouldHide);
  }, { passive: true });

  if (typewriter) {
    let index = 0;
    typewriter.innerHTML = `<span></span><i class="typewriter-cursor"></i>`;
    const textNode = typewriter.querySelector("span");
    const cursor = typewriter.querySelector("i");
    window.setTimeout(() => {
      const timer = window.setInterval(() => {
        index += 1;
        textNode.textContent = message.slice(0, index);
        if (index >= message.length) {
          window.clearInterval(timer);
          cursor.remove();
        }
      }, 38);
    }, 600);
  }

  window.setTimeout(() => actions?.classList.add("visible"), 400);

  menuButton?.addEventListener("click", () => {
    const open = !menuButton.classList.contains("active");
    menuButton.classList.toggle("active", open);
    mobileOverlay?.classList.toggle("active", open);
    menuButton.setAttribute("aria-expanded", String(open));
    mobileOverlay?.setAttribute("aria-hidden", String(!open));
  });

  mobileOverlay?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menuButton?.classList.remove("active");
      mobileOverlay.classList.remove("active");
      menuButton?.setAttribute("aria-expanded", "false");
      mobileOverlay.setAttribute("aria-hidden", "true");
    });
  });

  copyButton?.addEventListener("click", async () => {
    await navigator.clipboard?.writeText("hello@aivisibility.ai");
    copyButton.querySelector("span").innerHTML = "Copied: <u>hello@aivisibility.ai</u>";
  });
}

function fitCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const fallbackHeight = Number(canvas.getAttribute("height")) || 300;
  const cssHeight = rect.height > 40 ? rect.height : fallbackHeight;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(cssHeight * ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width: rect.width, height: cssHeight };
}

function drawRadar(canvas, dimensions) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const centerX = width / 2;
  const centerY = height / 2 + 12;
  const radius = Math.min(width - 96, height - 98) * 0.42;
  const items = [
    ["AEO", dimensions.aeo / 30],
    ["GEO", dimensions.geo / 35],
    ["Technical", dimensions.technical / 20],
    ["E-E-A-T", dimensions.eeat / 15]
  ];

  ctx.strokeStyle = "#dce5e1";
  ctx.fillStyle = "#66736e";
  ctx.font = "12px Inter, sans-serif";
  ctx.textAlign = "center";

  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    items.forEach((_, index) => {
      const angle = -Math.PI / 2 + (index / items.length) * Math.PI * 2;
      const pointRadius = radius * ring / 4;
      const x = centerX + Math.cos(angle) * pointRadius;
      const y = centerY + Math.sin(angle) * pointRadius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  ctx.beginPath();
  items.forEach(([label], index) => {
    const angle = -Math.PI / 2 + (index / items.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * (radius + 28);
    const y = centerY + Math.sin(angle) * (radius + 28);
    ctx.fillText(label, x, y + 4);
  });

  ctx.beginPath();
  items.forEach(([, value], index) => {
    const angle = -Math.PI / 2 + (index / items.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(15, 143, 116, 0.24)";
  ctx.strokeStyle = "#0f8f74";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = "left";
}

function drawPlatformChart(canvas, platforms) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const padding = { top: 20, right: 24, bottom: 48, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const groupW = chartW / platforms.length;
  const colors = ["#0f8f74", "#2b6fcf", "#c58b2a"];

  ctx.strokeStyle = "#dce5e1";
  ctx.fillStyle = "#66736e";
  ctx.font = "12px Inter, sans-serif";
  for (let tick = 0; tick <= 4; tick += 1) {
    const y = padding.top + chartH - chartH * tick / 4;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(String(tick * 25), 8, y + 4);
  }

  platforms.forEach((platform, index) => {
    const values = [platform.exposureRate, platform.recommendationRate, platform.citationRate];
    values.forEach((value, valueIndex) => {
      const barW = Math.min(20, groupW / 5);
      const x = padding.left + index * groupW + groupW / 2 - barW * 1.8 + valueIndex * barW * 1.35;
      const barH = chartH * value / 100;
      ctx.fillStyle = colors[valueIndex];
      ctx.fillRect(x, padding.top + chartH - barH, barW, barH);
    });
    ctx.fillStyle = "#17201d";
    ctx.save();
    ctx.translate(padding.left + index * groupW + groupW / 2 - 12, height - 12);
    ctx.rotate(-0.35);
    ctx.fillText(platform.name, 0, 0);
    ctx.restore();
  });
}

function drawTrendChart(canvas, trend) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const padding = { top: 18, right: 24, bottom: 34, left: 38 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  ctx.strokeStyle = "#dce5e1";
  for (let tick = 0; tick <= 4; tick += 1) {
    const y = padding.top + chartH - chartH * tick / 4;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  function line(values, color) {
    ctx.beginPath();
    values.forEach((item, index) => {
      const x = padding.left + (index / (values.length - 1)) * chartW;
      const y = padding.top + chartH - chartH * item / 100;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  line(trend.map(item => item.exposure), "#0f8f74");
  line(trend.map(item => item.citation), "#2b6fcf");
}

function drawGauge(canvas, value) {
  const { ctx, width, height } = fitCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const x = width / 2;
  const y = height / 2 + 2;
  const radius = Math.min(width, height) * 0.29;
  const start = -Math.PI / 2;
  const end = Math.PI * 1.5;

  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#e4ece8";
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.stroke();
  ctx.strokeStyle = "#0f8f74";
  ctx.beginPath();
  ctx.arc(x, y, radius, start, start + (end - start) * value / 100);
  ctx.stroke();
  ctx.fillStyle = "#17201d";
  ctx.font = "800 36px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(value)}%`, x, y + 8);
  ctx.fillStyle = "#66736e";
  ctx.font = "13px Inter, sans-serif";
  ctx.fillText("Official citation rate", x, y + 34);
  ctx.textAlign = "left";
}

function renderPlatformSelector() {
  const container = $("#platformSelector");
  container.innerHTML = state.config.platforms.map(platform => `
    <label>
      <input type="checkbox" value="${platform.id}" checked />
      ${platform.name}
    </label>
  `).join("");
}

function selectedPlatforms() {
  return [...document.querySelectorAll("#platformSelector input:checked")].map(input => input.value);
}

function updateScores(analysis) {
  $("#totalScore").textContent = analysis.scores.total;
  $("#rating").textContent = `Rating ${analysis.scores.rating}`;
  $("#aeoScore").textContent = analysis.scores.dimensions.aeo;
  $("#geoScore").textContent = analysis.scores.dimensions.geo;
  $("#technicalScore").textContent = analysis.scores.dimensions.technical;
  $("#eeatScore").textContent = analysis.scores.dimensions.eeat;
  $("#companyMeta").textContent = `${analysis.company.name} · ${analysis.company.industry} · ${analysis.promptSummary.count} prompts`;
  $("#brandArchiveStatus").textContent = "已完善";
  $("#brandAliasCount").textContent = `${analysis.company.brandSignals.length} 个品牌信号`;
  $("#competitorCount").textContent = Math.max(analysis.competitors.length - 1, 0);
  $("#promptConfigCount").textContent = analysis.promptSummary.count;
  $("#monitorPlatformCount").textContent = analysis.platforms.length;
  $("#monitorPlatformNames").textContent = analysis.platforms.slice(0, 4).map(item => item.name).join(" / ");
  $("#pcArchiveStatus").textContent = "已完善";
  $("#pcArchiveMeta").textContent = `${analysis.company.aliases.length}个名称变体、${analysis.company.domainVariants.length - 1}个域名变体`;
  $("#pcCompetitorMeta").textContent = `${analysis.competitorProfiles.length}/8`;
  $("#pcCompetitorProgress").style.width = `${Math.min(analysis.competitorProfiles.length / 8 * 100, 100)}%`;
  $("#pcPromptMeta").textContent = `${analysis.promptSummary.count}/100`;
  $("#pcPromptProgress").style.width = `${Math.min(analysis.promptSummary.count, 100)}%`;
  $("#pcPlatformMeta").textContent = analysis.platforms.length;
  $("#pcCompetitorBadge").textContent = analysis.competitorProfiles.length;
  $("#pcPromptBadge").textContent = analysis.promptSummary.count;
  $("#pcPlatformBadge").textContent = analysis.platforms.length;
  $("#pcPlatformDots").innerHTML = analysis.platforms.slice(0, 9).map(platform => `<span>${platform.name.slice(0, 1)}</span>`).join("");
}

function renderLists(analysis) {
  $("#sentimentList").innerHTML = analysis.platforms.map(platform => `
    <div class="sentiment-item">
      <span>${platform.name}</span>
      <div class="meter"><span style="width:${platform.sentiment}%"></span></div>
      <strong>${platform.sentiment}</strong>
    </div>
  `).join("");

  $("#keywordCloud").innerHTML = analysis.keywords.map(item => `
    <span class="${item.type}" style="font-size:${12 + item.weight / 10}px">${item.word}</span>
  `).join("");

  $("#competitorRows").innerHTML = analysis.competitors.map(item => `
    <tr>
      <td>${item.rank}</td>
      <td>${item.name}</td>
      <td>${item.recommendationRate}%</td>
      <td>${item.exposureRate}%</td>
      <td>${item.citationRate}%</td>
      <td>${item.compositeRankScore}</td>
    </tr>
  `).join("");

  $("#promptList").innerHTML = analysis.prompts.slice(0, 12).map(prompt => `
    <div class="prompt-card">
      <strong>${prompt.id} · ${prompt.category}</strong>
      <p>${prompt.text}</p>
    </div>
  `).join("");

  $("#strengthList").innerHTML = analysis.diagnosis.strengths.map(item => `<li>${item}</li>`).join("");
  $("#weaknessList").innerHTML = analysis.diagnosis.weaknesses.map(item => `<li>${item}</li>`).join("");
  $("#recommendationList").innerHTML = analysis.diagnosis.recommendations.map(item => `
    <div class="recommendation">
      <strong>${item.priority}</strong>
      <p>${item.action}</p>
      <p>${item.owner}</p>
    </div>
  `).join("");

  const maxFunnel = Math.max(...analysis.mentionFunnel.map(item => item.value), 1);
  $("#mentionFunnel").innerHTML = analysis.mentionFunnel.map(item => `
    <div class="funnel-item">
      <header><span>${item.label}</span><strong>${item.value}</strong></header>
      <div class="funnel-bar"><span style="width:${item.value / maxFunnel * 100}%"></span></div>
    </div>
  `).join("");

  $("#citationSources").innerHTML = analysis.citationSources.map(item => `
    <div class="source-item">
      <header><span>${item.type} · ${item.quality}</span><strong>${item.share}%</strong></header>
      <div class="source-bar"><span style="width:${item.share}%"></span></div>
      <small>${item.topPlatform} 引用 ${item.citations} 次</small>
    </div>
  `).join("");

  $("#brandArchive").innerHTML = `
    <strong>${analysis.company.name}</strong>
    <a href="${analysis.company.websiteUrl}" target="_blank" rel="noreferrer">${analysis.company.websiteUrl}</a>
    <p>${analysis.company.industry}企业，可围绕官网事实、产品系列、媒体奖项、FAQ 和竞品对比建立 AI 可引用档案。</p>
    <div class="archive-tags">
      ${analysis.company.brandSignals.concat(analysis.company.aliases).map(signal => `<span>${signal}</span>`).join("")}
    </div>
  `;

  $("#productRows").innerHTML = analysis.products.map(product => `
    <div class="product-card">
      <header>
        <strong>${product.name}</strong>
        <span class="status-pill">${product.status}</span>
      </header>
      <div class="metric-stack">
        ${[
          ["可见度", product.visibilityScore],
          ["引用率", product.citationRate],
          ["Prompt覆盖", product.promptCoverage]
        ].map(([label, value]) => `
          <div class="mini-metric">
            <span>${label}</span>
            <div class="meter"><span style="width:${value}%"></span></div>
            <strong>${value}%</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");

  $("#historyRows").innerHTML = analysis.monitoringHistory.map(item => `
    <tr>
      <td>${item.run}</td>
      <td>${item.totalScore}</td>
      <td>${item.mentionRate}%</td>
      <td>${item.citationRate}%</td>
      <td>${item.sentiment}</td>
      <td>${item.sopStage}</td>
      <td>${item.issues}</td>
    </tr>
  `).join("");

  $("#sopWorkflow").innerHTML = analysis.sopWorkflow.map((stage, index) => `
    <article class="sop-step ${stage.status}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${stage.name}</strong>
      <p>${stage.detail}</p>
    </article>
  `).join("");

  $("#competitorCards").innerHTML = analysis.competitorProfiles.map(item => `
    <article class="competitor-card">
      <span class="remove-mark">×</span>
      <header>
        <div class="entity-logo">${item.logoText}</div>
        <div>
          <strong>${item.name}</strong>
          <div class="entity-meta">${item.website || "未填写官网"}</div>
        </div>
      </header>
      <div class="chip-row">
        <span>${item.aliases}个名称变体</span>
        <span class="blue-chip">${item.domainVariants}个域名变体</span>
        <span>${item.monitorStatus}</span>
      </div>
    </article>
  `).join("") + `<div class="add-card">＋ 添加竞品</div>`;

  $("#promptGroupRows").innerHTML = analysis.promptGroups.map(group => `
    <article class="prompt-group-row">
      <strong>${group.category}</strong>
      <p>${group.samples.join(" / ")}</p>
      <span class="status-pill">${group.count} 条</span>
    </article>
  `).join("");

  $("#platformCatalog").innerHTML = analysis.platformCatalog.map(platform => `
    <article class="monitor-platform-card ${platform.enabled ? "enabled" : ""}">
      <header>
        <div class="entity-logo">${platform.name.slice(0, 1)}</div>
        <div>
          <strong>${platform.name}</strong>
          <div class="entity-meta">${platform.group} · ${platform.authMode}</div>
        </div>
        <span class="platform-check">${platform.enabled ? "✓" : ""}</span>
      </header>
      <div class="chip-row">
        <span>${platform.health}</span>
        <span class="blue-chip">${platform.type === "search" ? "搜索增强" : "问答平台"}</span>
      </div>
    </article>
  `).join("");

  const settings = analysis.productCenterSettings;
  $("#settingsRows").innerHTML = [
    ["评估频率", settings.assessmentFrequency],
    ["预警阈值", settings.alertThreshold],
    ["报告语言", settings.reportLanguage],
    ["数据保留", settings.dataRetention],
    ["负责人", settings.owner]
  ].map(([label, value]) => `
    <div class="setting-row">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderCharts(analysis) {
  drawRadar($("#radarChart"), analysis.scores.dimensions);
  drawPlatformChart($("#platformChart"), analysis.platforms);
  drawTrendChart($("#trendChart"), analysis.trend);
  const avgCitation = analysis.platforms.reduce((sum, item) => sum + item.citationRate, 0) / analysis.platforms.length;
  drawGauge($("#citationGauge"), avgCitation);
}

function renderAnalysis(analysis) {
  state.analysis = analysis;
  updateScores(analysis);
  renderLists(analysis);
  renderCharts(analysis);
}

async function runAnalysis() {
  const promptCountValue = $("#promptCount").value === "custom" ? $("#customPromptCount").value : $("#promptCount").value;
  $("#runAnalysis").textContent = "Running...";
  $("#runAnalysis").disabled = true;
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: $("#companyName").value,
        websiteUrl: $("#websiteUrl").value,
        competitors: $("#competitors").value,
        industry: $("#industry").value,
        promptCount: Number(promptCountValue),
        promptMode: state.promptMode,
        platforms: selectedPlatforms()
      })
    });
    renderAnalysis(await response.json());
  } finally {
    $("#runAnalysis").textContent = "Run Assessment";
    $("#runAnalysis").disabled = false;
  }
}

async function downloadMarkdown() {
  if (!state.analysis) return;
  const response = await fetch("/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analysis: state.analysis })
  });
  const { markdown } = await response.json();
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.analysis.company.name}_AI可见度分析报告.md`;
  link.click();
  URL.revokeObjectURL(url);
}

async function init() {
  initLandingExperience();
  state.config = await fetch("/api/config").then(response => response.json());
  renderPlatformSelector();
  document.querySelectorAll(".segmented button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segmented button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      state.promptMode = button.dataset.mode;
    });
  });
  $("#promptCount").addEventListener("change", event => {
    $("#customPromptCount").classList.toggle("hidden", event.target.value !== "custom");
  });
  $("#runAnalysis").addEventListener("click", runAnalysis);
  $("#downloadMarkdown").addEventListener("click", downloadMarkdown);
  $("#printReport").addEventListener("click", () => window.print());
  document.querySelectorAll("[data-product-tab]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-tab]").forEach(item => item.classList.remove("active"));
      document.querySelectorAll("[data-product-panel]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`[data-product-panel="${button.dataset.productTab}"]`)?.classList.add("active");
    });
  });
  window.addEventListener("resize", () => state.analysis && renderCharts(state.analysis));
  await runAnalysis();
}

init();
