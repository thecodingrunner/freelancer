import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

async function runLighthouse(url, options = { output: "json" }, config = null) {
  const chrome = await launch({ chromeFlags: ["--headless"] });
  options.port = chrome.port;

  const runnerResult = await lighthouse(url, options, config);

  chrome.kill();

  const report = JSON.parse(runnerResult.report);
  const categories = report.categories;

  // Extract scores for each category
  const performanceScore = categories.performance.score * 100;
  const accessibilityScore = categories.accessibility.score * 100;
  const bestPracticesScore = categories['best-practices'].score * 100;
  const seoScore = categories.seo.score * 100;

  const firstContentfulPaint =
    runnerResult.lhr.audits["first-contentful-paint"].numericValue;
  const speedIndex = runnerResult.lhr.audits["speed-index"].numericValue;
  const largestContentfulPaint =
    runnerResult.lhr.audits["largest-contentful-paint"].numericValue;
  const timeToInteractive = runnerResult.lhr.audits["interactive"].numericValue;
  const totalBlockingTime =
    runnerResult.lhr.audits["total-blocking-time"].numericValue;
  const cumulativeLayoutShift =
    runnerResult.lhr.audits["cumulative-layout-shift"].numericValue;

  console.log("Performance Score:", performanceScore.toFixed(2));
  console.log('Accessibility Score:', accessibilityScore.toFixed(2));
  console.log('Best Practices Score:', bestPracticesScore.toFixed(2));
  console.log('SEO Score:', seoScore.toFixed(2));
  console.log(
    "First Contentful Paint:",
    (firstContentfulPaint / 1000).toFixed(2),
    "seconds"
  );
  console.log("Speed Index:", (speedIndex / 1000).toFixed(2), "seconds");
  console.log(
    "Largest Contentful Paint:",
    (largestContentfulPaint / 1000).toFixed(2),
    "seconds"
  );
  console.log(
    "Time to Interactive:",
    (timeToInteractive / 1000).toFixed(2),
    "seconds"
  );
  console.log(
    "Total Blocking Time:",
    totalBlockingTime.toFixed(2),
    "milliseconds"
  );
  console.log("Cumulative Layout Shift:", cumulativeLayoutShift.toFixed(3));

  // Return an object with all the extracted data
  return {
    scores: {
      performance: performanceScore,
      accessibility: accessibilityScore,
      bestPractices: bestPracticesScore,
      seo: seoScore
    },
    metrics: {
      firstContentfulPaint,
      speedIndex,
      largestContentfulPaint,
      timeToInteractive,
      totalBlockingTime,
      cumulativeLayoutShift
    }
  };
}

runLighthouse("https://www.thefurnace.uk.com/");

export default runLighthouse;
