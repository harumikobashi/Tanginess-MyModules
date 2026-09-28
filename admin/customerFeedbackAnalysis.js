// ===== CUSTOMER FEEDBACK ANALYSIS =====
function getFeedbackStore() {
  const existingStore = window.projectFeedbackData || window.customerFeedbackData || window.feedbackData || {};

  if (!existingStore.plaridel) {
    existingStore.plaridel = [];
  }

  if (!existingStore.malolos) {
    existingStore.malolos = [];
  }

  window.projectFeedbackData = existingStore;
  return existingStore;
}

function getBranchKeys() {
  return ["plaridel", "malolos"];
}

function hasBranchKey(branchKey) {
  const keys = getBranchKeys();
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === branchKey) {
      return true;
    }
  }
  return false;
}

function copyObject(sourceObject) {
  const copiedObject = {};
  for (const key in sourceObject) {
    copiedObject[key] = sourceObject[key];
  }
  return copiedObject;
}

function normalizeFeedbackEntry(entry, fallbackBranch) {
  const normalizedEntry = copyObject(entry || {});
  const ratingValue = Number(normalizedEntry.rating) || 0;
  normalizedEntry.rating = ratingValue;

  if (!(normalizedEntry.comment && normalizedEntry.comment.trim())) {
    normalizedEntry.comment = getDefaultFeedbackComment(ratingValue);
  }

  if (!normalizedEntry.branch) {
    normalizedEntry.branch = fallbackBranch || "Plaridel";
  }

  if (normalizedEntry.editCount === undefined || normalizedEntry.editCount === null) {
    normalizedEntry.editCount = 0;
  }

  return normalizedEntry;
}

function getCustomerFeedbackEntry(customerId, orderId) {
  if (customerId === undefined) {
    customerId = "demo-customer";
  }

  if (orderId === undefined) {
    orderId = "completed-order-1";
  }

  const store = getFeedbackStore();
  const branchKeys = getBranchKeys();

  for (let i = 0; i < branchKeys.length; i++) {
    const branchKey = branchKeys[i];
    const branchEntries = store[branchKey] || [];

    for (let j = 0; j < branchEntries.length; j++) {
      const feedback = branchEntries[j];
      if (feedback.customerId === customerId && feedback.orderId === orderId) {
        return feedback;
      }
    }
  }

  return null;
}

function addCustomerFeedbackEntry(entry, branchKey) {
  if (branchKey === undefined || branchKey === null || branchKey === "") {
    branchKey = "plaridel";
  }

  const store = getFeedbackStore();
  const safeBranchKey = hasBranchKey(branchKey) ? branchKey : "plaridel";
  const existingReview = getCustomerFeedbackEntry(entry.customerId, entry.orderId);

  if (existingReview) {
    return false;
  }

  const branchNameMap = {
    plaridel: "Plaridel",
    malolos: "Malolos",
  };

  const currentEntries = store[safeBranchKey] || [];
  const newEntries = [];
  const newEntry = normalizeFeedbackEntry(entry, branchNameMap[safeBranchKey]);

  newEntries[0] = newEntry;

  for (let i = 0; i < currentEntries.length; i++) {
    newEntries[i + 1] = currentEntries[i];
  }

  store[safeBranchKey] = newEntries;

  const branchSelect = document.getElementById("branchFilterSelect");
  if (branchSelect) {
    branchSelect.value = safeBranchKey;
  }

  renderOwnerFeedbackReviews();
  renderCustomerReviews();

  const filteredFeedback = filterFeedbackByDate(getSelectedBranchFeedback(), getFeedbackDateRange());
  renderFeedbackAnalysis(analyzeFeedback(filteredFeedback), filteredFeedback);
  return true;
}

function updateCustomerFeedbackEntry(entry, branchKey) {
  if (branchKey === undefined || branchKey === null || branchKey === "") {
    branchKey = "plaridel";
  }

  const store = getFeedbackStore();
  const existingReview = getCustomerFeedbackEntry(entry.customerId, entry.orderId);

  if (!existingReview || Number(existingReview.editCount || 0) >= 1) {
    return false;
  }

  const targetBranchKey = hasBranchKey(branchKey) ? branchKey : "plaridel";
  let matchedBranchKey = "plaridel";
  const branchKeys = getBranchKeys();

  for (let i = 0; i < branchKeys.length; i++) {
    const currentBranchKey = branchKeys[i];
    const branchEntries = store[currentBranchKey] || [];

    for (let j = 0; j < branchEntries.length; j++) {
      if (branchEntries[j].feedbackId === existingReview.feedbackId) {
        matchedBranchKey = currentBranchKey;
        break;
      }
    }

    if (matchedBranchKey !== "plaridel") {
      break;
    }
  }

  const updatedEntry = normalizeFeedbackEntry(entry, targetBranchKey === "plaridel" ? "Plaridel" : "Malolos");
  updatedEntry.feedbackId = existingReview.feedbackId;
  updatedEntry.customerId = existingReview.customerId;
  updatedEntry.orderId = existingReview.orderId;
  updatedEntry.branch = entry.branch || (targetBranchKey === "malolos" ? "Malolos" : "Plaridel");
  updatedEntry.date = entry.date || existingReview.date;
  updatedEntry.editCount = 1;

  if (matchedBranchKey !== targetBranchKey) {
    const oldEntries = store[matchedBranchKey] || [];
    const remainingEntries = [];
    let remainingIndex = 0;

    for (let i = 0; i < oldEntries.length; i++) {
      if (oldEntries[i].feedbackId !== existingReview.feedbackId) {
        remainingEntries[remainingIndex] = oldEntries[i];
        remainingIndex = remainingIndex + 1;
      }
    }

    store[matchedBranchKey] = remainingEntries;

    const targetEntries = store[targetBranchKey] || [];
    const mergedEntries = [];
    let mergedIndex = 0;

    mergedEntries[mergedIndex] = updatedEntry;
    mergedIndex = mergedIndex + 1;

    for (let i = 0; i < targetEntries.length; i++) {
      mergedEntries[mergedIndex] = targetEntries[i];
      mergedIndex = mergedIndex + 1;
    }

    store[targetBranchKey] = mergedEntries;
  } else {
    const branchEntries = store[matchedBranchKey] || [];
    const revisedEntries = [];
    let revisedIndex = 0;

    for (let i = 0; i < branchEntries.length; i++) {
      if (branchEntries[i].feedbackId === existingReview.feedbackId) {
        revisedEntries[revisedIndex] = updatedEntry;
      } else {
        revisedEntries[revisedIndex] = branchEntries[i];
      }
      revisedIndex = revisedIndex + 1;
    }

    store[matchedBranchKey] = revisedEntries;
  }

  const branchSelect = document.getElementById("branchFilterSelect");
  if (branchSelect) {
    branchSelect.value = targetBranchKey;
  }

  renderOwnerFeedbackReviews();
  renderCustomerReviews();

  const filteredFeedback = filterFeedbackByDate(getSelectedBranchFeedback(), getFeedbackDateRange());
  renderFeedbackAnalysis(analyzeFeedback(filteredFeedback), filteredFeedback);
  return true;
}

window.addCustomerFeedbackEntry = addCustomerFeedbackEntry;
window.updateCustomerFeedbackEntry = updateCustomerFeedbackEntry;
window.getCustomerFeedbackEntry = getCustomerFeedbackEntry;

function getStarDisplay(rating) {
  const value = Number(rating) || 0;
  let rounded = Math.round(value);

  if (rounded < 0) {
    rounded = 0;
  }

  if (rounded > 5) {
    rounded = 5;
  }

  let stars = "";
  for (let index = 0; index < 5; index++) {
    if (index < rounded) {
      stars = stars + "★";
    } else {
      stars = stars + "☆";
    }
  }

  return stars;
}

function formatFeedbackDate(dateValue) {
  if (!dateValue) return "Recent";

  const parsedDate = typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ? new Date(dateValue + "T12:00:00")
    : new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recent";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSelectedBranchFeedback() {
  const branchSelect = document.getElementById("branchFilterSelect");
  const selectedBranch = branchSelect ? branchSelect.value : "all";
  const store = getFeedbackStore();

  if (selectedBranch === "all") {
    const allFeedback = [];
    const branchKeys = getBranchKeys();
    let allIndex = 0;

    for (let i = 0; i < branchKeys.length; i++) {
      const branchEntries = store[branchKeys[i]] || [];

      for (let j = 0; j < branchEntries.length; j++) {
        allFeedback[allIndex] = branchEntries[j];
        allIndex = allIndex + 1;
      }
    }

    return allFeedback;
  }

  return store[selectedBranch] || [];
}

function getCustomerBranchFeedback() {
  const customerBranchSelect = document.getElementById("feedbackBranchSelect");
  const selectedBranch = customerBranchSelect ? customerBranchSelect.value : "plaridel";
  const store = getFeedbackStore();
  return store[selectedBranch] || [];
}

function getCustomerReviewBranchFilterValue() {
  const customerReviewBranchFilter = document.getElementById("customerReviewBranchFilter");
  return customerReviewBranchFilter ? customerReviewBranchFilter.value : "all";
}

function getCustomerReviewBranchFeedback() {
  const selectedBranch = getCustomerReviewBranchFilterValue();
  const store = getFeedbackStore();

  if (selectedBranch === "all") {
    const allFeedback = [];
    const branchKeys = getBranchKeys();
    let allIndex = 0;

    for (let i = 0; i < branchKeys.length; i++) {
      const branchEntries = store[branchKeys[i]] || [];

      for (let j = 0; j < branchEntries.length; j++) {
        allFeedback[allIndex] = branchEntries[j];
        allIndex = allIndex + 1;
      }
    }

    return allFeedback;
  }

  return store[selectedBranch] || [];
}

function formatLocalDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function getDateRangeFromPreset(preset) {
  if (preset === undefined) {
    preset = "all";
  }

  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (preset === "all") {
    return { start: "", end: "" };
  }

  const startDate = new Date(endDate);
  const days = Number(preset) || 0;

  if (days > 0) {
    startDate.setDate(endDate.getDate() - days + 1);
    return {
      start: formatLocalDateForInput(startDate),
      end: formatLocalDateForInput(endDate),
    };
  }

  if (preset === "365") {
    startDate.setFullYear(endDate.getFullYear() - 1);
    return {
      start: formatLocalDateForInput(startDate),
      end: formatLocalDateForInput(endDate),
    };
  }

  return { start: "", end: "" };
}

function getDatePreset(groupName) {
  const selector = '.date-filter-button[data-date-group="' + groupName + '"]';
  const activeButton = document.querySelector(selector + ".active");
  return activeButton ? activeButton.dataset.dateFilter : "all";
}

function getFeedbackDateRange() {
  return getDateRangeFromPreset(getDatePreset("owner"));
}

function getCustomerReviewDateRange() {
  return getDateRangeFromPreset(getDatePreset("customer"));
}

function filterFeedbackByDate(feedbackList, dateRange) {
  if (!Array.isArray(feedbackList)) {
    return [];
  }

  if (dateRange === undefined) {
    dateRange = { start: "", end: "" };
  }

  const result = [];
  let resultCount = 0;
  const start = dateRange.start || "";
  const end = dateRange.end || "";

  for (let i = 0; i < feedbackList.length; i++) {
    const entry = feedbackList[i];

    if (start && entry.date < start) {
      continue;
    }

    if (end && entry.date > end) {
      continue;
    }

    result[resultCount] = entry;
    resultCount = resultCount + 1;
  }

  result.length = resultCount;
  return result;
}

function getReviewFilterValue() {
  const activeButton = document.querySelector(".review-filter-button[data-review-filter].active");
  return activeButton ? activeButton.dataset.reviewFilter : "all";
}

function getOwnerStarFilterValue() {
  const activeButton = document.querySelector(".owner-star-filter.active");
  return activeButton ? activeButton.dataset.ownerStar : "all";
}

function getOwnerFilterLabel() {
  const star = getOwnerStarFilterValue();
  if (star !== "all") return star + "★ reviews";
  return "All reviews";
}

function getFilteredReviews(feedbackList) {
  const filterValue = getReviewFilterValue();
  const filtered = [];
  let filteredIndex = 0;

  for (let i = 0; i < feedbackList.length; i++) {
    const entry = feedbackList[i];
    if (filterValue === "all" || Number(entry.rating) === Number(filterValue)) {
      filtered[filteredIndex] = entry;
      filteredIndex = filteredIndex + 1;
    }
  }

  filtered.length = filteredIndex;
  return filtered;
}

function getFilteredOwnerReviews(feedbackList) {
  const star = getOwnerStarFilterValue();
  const filtered = [];
  let filteredIndex = 0;

  for (let i = 0; i < feedbackList.length; i++) {
    const entry = feedbackList[i];
    if (star === "all" || Number(entry.rating) === Number(star)) {
      filtered[filteredIndex] = entry;
      filteredIndex = filteredIndex + 1;
    }
  }

  filtered.length = filteredIndex;
  return filtered;
}

function getReviewCommentText(entry) {
  if (entry && entry.commentHidden) {
    return "Comment hidden";
  }

  if (entry && entry.comment && entry.comment.trim()) {
    return entry.comment.trim();
  }

  return getDefaultFeedbackComment(entry ? entry.rating : 0);
}

function toggleFeedbackCommentVisibility(feedbackId) {
  const store = getFeedbackStore();
  const branchKeys = getBranchKeys();

  for (let i = 0; i < branchKeys.length; i++) {
    const branchEntries = store[branchKeys[i]] || [];

    for (let j = 0; j < branchEntries.length; j++) {
      const entry = branchEntries[j];
      if (Number(entry.feedbackId) === Number(feedbackId)) {
        entry.commentHidden = !Boolean(entry.commentHidden);
        renderOwnerFeedbackReviews();
        renderCustomerReviews();
        return;
      }
    }
  }
}

function containsTheme(text, theme) {
  if (!text || !theme) {
    return false;
  }

  const themeLength = theme.length;
  const textLength = text.length;

  if (themeLength === 0) {
    return false;
  }

  for (let i = 0; i <= textLength - themeLength; i++) {
    let matchFound = true;

    for (let j = 0; j < themeLength; j++) {
      if (text.charAt(i + j) !== theme.charAt(j)) {
        matchFound = false;
        break;
      }
    }

    if (matchFound) {
      return true;
    }
  }

  return false;
}

function summarizeFeedbackInsights(feedbackList) {
  if (feedbackList === undefined) {
    feedbackList = [];
  }

  const positiveThemes = ["sarap", "fresh", "masarap", "maganda", "friendly", "service", "mabilis", "clean", "ambiance", "quality"];
  const negativeThemes = ["mahal", "matagal", "pila", "mali", "mainit", "slow", "delay", "issue", "bad", "uncomfortable"];
  const comments = [];

  for (let i = 0; i < feedbackList.length; i++) {
    comments[i] = (feedbackList[i].comment || "").toLowerCase();
  }

  const positiveResults = [];
  const negativeResults = [];

  for (let i = 0; i < positiveThemes.length; i++) {
    const theme = positiveThemes[i];
    let matchCount = 0;

    for (let j = 0; j < comments.length; j++) {
      if (containsTheme(comments[j], theme)) {
        matchCount = matchCount + 1;
      }
    }

    if (matchCount > 0) {
      positiveResults[positiveResults.length] = { theme: theme, count: matchCount };
    }
  }

  for (let i = 0; i < negativeThemes.length; i++) {
    const theme = negativeThemes[i];
    let matchCount = 0;

    for (let j = 0; j < comments.length; j++) {
      if (containsTheme(comments[j], theme)) {
        matchCount = matchCount + 1;
      }
    }

    if (matchCount > 0) {
      negativeResults[negativeResults.length] = { theme: theme, count: matchCount };
    }
  }

  for (let i = 1; i < positiveResults.length; i++) {
    const current = positiveResults[i];
    let j = i - 1;

    while (j >= 0 && positiveResults[j].count < current.count) {
      positiveResults[j + 1] = positiveResults[j];
      j = j - 1;
    }

    positiveResults[j + 1] = current;
  }

  for (let i = 1; i < negativeResults.length; i++) {
    const current = negativeResults[i];
    let j = i - 1;

    while (j >= 0 && negativeResults[j].count < current.count) {
      negativeResults[j + 1] = negativeResults[j];
      j = j - 1;
    }

    negativeResults[j + 1] = current;
  }

  return {
    highlightPositive: positiveResults[0] || { theme: "Positive service", count: 0 },
    highlightNegative: negativeResults[0] || { theme: "No key concern", count: 0 },
  };
}

function renderReviewCards(feedbackList, containerId, overrideList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const filteredReviews = overrideList !== undefined ? overrideList : getFilteredReviews(feedbackList || []);
  if (!filteredReviews.length) {
    container.innerHTML = `
      <div class="review-empty-state">
        <strong>No matching reviews</strong>
        <span>Try another filter or time range.</span>
      </div>
    `;
    return;
  }

  const reviews = filteredReviews;
  const showOwnerControls = containerId === "feedbackRecentReviews";
  let cardsHtml = "";

  for (let i = 0; i < reviews.length; i++) {
    const entry = reviews[i];
    const tone = entry.rating >= 4 ? "positive" : entry.rating <= 2 ? "negative" : "neutral";
    const reviewText = getReviewCommentText(entry);
    const commentToggleLabel = entry.commentHidden ? "Show comment" : "Hide comment";

    let ownerControlHtml = "";
    if (showOwnerControls) {
      ownerControlHtml = '<button type="button" class="review-action-button" data-feedback-id="' + entry.feedbackId + '" data-review-action="toggle-comment-visibility">' + commentToggleLabel + '</button>';
    }

    cardsHtml = cardsHtml + `
      <article class="review-card ${tone} ${entry.commentHidden ? "comment-hidden" : ""}">
        <div class="review-header">
          <div class="review-avatar">${(entry.branch || "C").charAt(0).toUpperCase()}</div>
          <div class="review-user-info">
            <strong>Customer</strong>
            <span>${entry.branch || "Plaridel"} • ${formatFeedbackDate(entry.date)}</span>
          </div>
          ${ownerControlHtml}
        </div>
        <div class="review-score" aria-label="${entry.rating} out of 5 stars">${getStarDisplay(entry.rating)}</div>
        <p class="review-comment">“${reviewText}”</p>
      </article>
    `;
  }

  const label = overrideList !== undefined ? getOwnerFilterLabel() : (getReviewFilterValue() === "all" ? "All reviews" : getReviewFilterValue() + "★ reviews");

  container.innerHTML = `
    <div class="review-feed-header">
      <h3>${label}</h3>
      <span>${reviews.length} reviews</span>
    </div>
    <div class="review-feed-grid">${cardsHtml}</div>
  `;
}

function renderCustomerFeedbackSummary(feedbackList) {
  const container = document.getElementById("customerFeedbackSummary");
  if (!container) return;

  const stats = analyzeFeedback(feedbackList || []);
  const totalFeedback = stats.totalFeedback || 0;
  const averageRating = totalFeedback ? stats.averageRating : 0;
  const ratingEntries = [5, 4, 3, 2, 1];
  let distributionHtml = "";

  for (let i = 0; i < ratingEntries.length; i++) {
    const rating = ratingEntries[i];
    const count = stats.ratingCounts[rating] || 0;
    const share = totalFeedback ? (count / totalFeedback) * 100 : 0;

    distributionHtml = distributionHtml + `
      <div class="summary-breakdown-row">
        <span class="summary-breakdown-label">${rating}★</span>
        <div class="summary-breakdown-track">
          <span class="summary-breakdown-fill" style="width: ${share}%"></span>
        </div>
        <span class="summary-breakdown-count">${count}</span>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="customer-summary-card">
      <div class="summary-header">
        <div>
          <span class="summary-kicker">Overall rating</span>
          <div class="summary-score-row">
            <strong>${averageRating.toFixed(1)}</strong>
            <span class="summary-stars">${getStarDisplay(Math.round(averageRating))}</span>
          </div>
        </div>
        <div class="summary-metrics">
          <div>
            <span class="summary-metric-label">Reviews</span>
            <strong>${totalFeedback}</strong>
          </div>
          <div>
            <span class="summary-metric-label">Positive</span>
            <strong>${stats.positiveCount}</strong>
          </div>
        </div>
      </div>
      <div class="summary-breakdown">
        ${distributionHtml}
      </div>
    </div>
  `;
}

function renderCustomerReviews() {
  const customerDateRange = getCustomerReviewDateRange();
  const baseFeedback = filterFeedbackByDate(getCustomerReviewBranchFeedback(), customerDateRange);
  const filteredFeedback = getFilteredReviews(baseFeedback);
  renderCustomerFeedbackSummary(filteredFeedback);
  renderReviewCards(filteredFeedback, "customerReviewFeed");
}

function renderOwnerFeedbackReviews() {
  const feedbackList = filterFeedbackByDate(getSelectedBranchFeedback(), getFeedbackDateRange());
  const filteredOwnerReviews = getFilteredOwnerReviews(feedbackList);
  renderReviewCards(feedbackList, "feedbackRecentReviews", filteredOwnerReviews);
}

function analyzeFeedback(feedbackList) {
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRatingSum = 0;

  for (let i = 0; i < feedbackList.length; i++) {
    const feedback = feedbackList[i];
    ratingCounts[feedback.rating] = ratingCounts[feedback.rating] + 1;
    totalRatingSum = totalRatingSum + feedback.rating;
  }

  const totalFeedback = feedbackList.length;
  const averageRating = totalFeedback > 0 ? (totalRatingSum / totalFeedback) : 0;
  const positiveCount = ratingCounts[4] + ratingCounts[5];
  const neutralCount = ratingCounts[3];
  const negativeCount = ratingCounts[1] + ratingCounts[2];

  return {
    totalFeedback: totalFeedback,
    averageRating: averageRating,
    ratingCounts: ratingCounts,
    positiveCount: positiveCount,
    neutralCount: neutralCount,
    negativeCount: negativeCount,
  };
}

function renderFeedbackAnalysis(stats, feedbackList) {
  if (feedbackList === undefined) {
    feedbackList = [];
  }

  const container = document.getElementById("feedbackAnalysisContainer");
  if (!container) return;

  const totalFeedback = stats.totalFeedback || 0;
  const ratingEntries = [5, 4, 3, 2, 1];
  let ratingRowsHtml = "";

  for (let i = 0; i < ratingEntries.length; i++) {
    const rating = ratingEntries[i];
    const count = stats.ratingCounts[rating] || 0;
    const width = totalFeedback ? (count / totalFeedback) * 100 : 0;
    let sentiment = "neutral";

    if (rating >= 4) {
      sentiment = "positive";
    }

    if (rating <= 2) {
      sentiment = "negative";
    }

    ratingRowsHtml = ratingRowsHtml + `
      <div class="rating-row" data-sentiment="${sentiment}">
        <span class="rating-label">${rating}★</span>
        <div class="rating-bar-track">
          <div class="rating-bar-fill" style="width: ${width}%"></div>
        </div>
        <span class="rating-count">${count}</span>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="analytics-shell">
      <div class="feedback-grid">
        <div class="feedback-pill positive">
          <strong>${stats.totalFeedback}</strong>
          <span>Total Feedback</span>
        </div>
        <div class="feedback-pill neutral">
          <strong>${stats.averageRating.toFixed(2)}</strong>
          <span>Average Rating</span>
        </div>
        <div class="feedback-pill positive">
          <strong>${stats.positiveCount}</strong>
          <span>Positive</span>
        </div>
        <div class="feedback-pill negative">
          <strong>${stats.negativeCount}</strong>
          <span>Negative</span>
        </div>
      </div>

      <div class="data-card">
        <h3>Rating Distribution</h3>
        <div class="rating-list">
          ${ratingRowsHtml}
        </div>
      </div>

      <div class="data-card">
        <h3>Feedback Classification</h3>
        <div class="feedback-grid">
          <div class="feedback-pill positive">
            <strong>${stats.positiveCount}</strong>
            <span>Positive (4-5)</span>
          </div>
          <div class="feedback-pill neutral">
            <strong>${stats.neutralCount}</strong>
            <span>Neutral (3)</span>
          </div>
          <div class="feedback-pill negative">
            <strong>${stats.negativeCount}</strong>
            <span>Negative (1-2)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const branchSelect = document.getElementById("branchFilterSelect");
  const customerBranchSelect = document.getElementById("feedbackBranchSelect");
  const customerReviewBranchFilter = document.getElementById("customerReviewBranchFilter");

  function renderBranchFeedback() {
    const baseFeedback = filterFeedbackByDate(getSelectedBranchFeedback(), getFeedbackDateRange());
    const filteredFeedback = getFilteredOwnerReviews(baseFeedback);
    renderFeedbackAnalysis(analyzeFeedback(filteredFeedback), filteredFeedback);
    renderOwnerFeedbackReviews();
  }

  renderBranchFeedback();
  renderCustomerReviews();

  if (branchSelect) {
    branchSelect.addEventListener("change", renderBranchFeedback);
  }

  if (customerBranchSelect) {
    customerBranchSelect.addEventListener("change", renderCustomerReviews);
  }

  if (customerReviewBranchFilter) {
    customerReviewBranchFilter.addEventListener("change", renderCustomerReviews);
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-review-action='toggle-comment-visibility']");
    if (!target) return;

    const feedbackId = target.dataset.feedbackId;
    if (feedbackId) {
      toggleFeedbackCommentVisibility(feedbackId);
    }
  });

  const dateButtons = document.querySelectorAll(".date-filter-button");
  for (let i = 0; i < dateButtons.length; i++) {
    const button = dateButtons[i];
    button.addEventListener("click", () => {
      const group = button.dataset.dateGroup;
      const dateGroupButtons = document.querySelectorAll('.date-filter-button[data-date-group="' + group + '"]');

      for (let j = 0; j < dateGroupButtons.length; j++) {
        dateGroupButtons[j].classList.remove("active");
      }

      button.classList.add("active");

      if (group === "customer") {
        renderCustomerReviews();
      } else {
        renderBranchFeedback();
      }
    });
  }

  const reviewButtons = document.querySelectorAll(".review-filter-button[data-review-filter]");
  for (let i = 0; i < reviewButtons.length; i++) {
    const button = reviewButtons[i];
    button.addEventListener("click", () => {
      const reviewFilterButtons = document.querySelectorAll(".review-filter-button[data-review-filter]");

      for (let j = 0; j < reviewFilterButtons.length; j++) {
        reviewFilterButtons[j].classList.remove("active");
      }

      button.classList.add("active");
      renderCustomerReviews();
    });
  }

  const ownerStarButtons = document.querySelectorAll(".owner-star-filter");
  for (let i = 0; i < ownerStarButtons.length; i++) {
    const button = ownerStarButtons[i];
    button.addEventListener("click", () => {
      const starButtons = document.querySelectorAll(".owner-star-filter");

      for (let j = 0; j < starButtons.length; j++) {
        starButtons[j].classList.remove("active");
      }

      button.classList.add("active");
      renderBranchFeedback();
    });
  }
});