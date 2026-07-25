const { DIMENSIONS, PLATFORM_REGISTRY, PROMPT_TEMPLATES } = require("../lib/scoring");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({
    dimensions: DIMENSIONS,
    platforms: PLATFORM_REGISTRY,
    promptTemplates: PROMPT_TEMPLATES,
    promptCounts: [10, 20, 30, 50, 100]
  }));
};
