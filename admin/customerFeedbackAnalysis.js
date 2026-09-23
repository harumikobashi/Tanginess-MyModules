// ===== CUSTOMER FEEDBACK ANALYSIS =====
// Sample feedback data. Later this will be replaced by real feedback
// records from your groupmate's Customer Feedback module.
const branchFeedback = {
  plaridel: [
    { feedbackId: 11, rating: 5, comment: "Fresh at masarap ang yogurt!", date: "2026-09-01", branch: "Plaridel" },
    { feedbackId: 12, rating: 4, comment: "Maganda ang service.", date: "2026-09-02", branch: "Plaridel" },
  ],
  malolos: [
    { feedbackId: 21, rating: 4, comment: "Mabilis ang order at masarap.", date: "2026-09-01", branch: "Malolos" },
    { feedbackId: 22, rating: 2, comment: "Medyo mahabang pila.", date: "2026-09-02", branch: "Malolos" },
  ],
};

function getCustomerFeedbackEntry(customerId = "demo-customer", orderId = "completed-order-1") {
  const allFeedback = Object.values(branchFeedback).flat();
  return allFeedback.find((feedback) => feedback.customerId === customerId && feedback.orderId === orderId) || null;
}

function addCustomerFeedbackEntry(entry, branchKey = "plaridel") {
  const safeBranchKey = branchFeedback[branchKey] ? branchKey : "plaridel";
  const existingReview = getCustomerFeedbackEntry(entry.customerId, entry.orderId);

  if (existingReview) {
    return false;
  }

  const branchName = {
    plaridel: "Plaridel",
    malolos: "Malolos",
  }[safeBranchKey] || "Plaridel";

  branchFeedback[safeBranchKey].unshift({
    ...entry,
    rating: Number(entry.rating) || 0,
    comment: (entry.comment && entry.comment.trim()) || getDefaultFeedbackComment(entry.rating),
    branch: entry.branch || branchName,
    editCount: 0,
  });

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

function updateCustomerFeedbackEntry(entry, branchKey = "plaridel") {
  const existingReview = getCustomerFeedbackEntry(entry.customerId, entry.orderId);
  if (!existingReview || Number(existingReview.editCount || 0) >= 1) {
    return false;
  }

  const targetBranchKey = branchFeedback[branchKey] ? branchKey : "plaridel";
  const matchedBranchKey = Object.keys(branchFeedback).find((branch) =>
    (branchFeedback[branch] || []).some((feedback) => feedback.feedbackId === existingReview.feedbackId)
  ) || "plaridel";

  const updatedEntry = {
    ...existingReview,
    rating: Number(entry.rating) || existingReview.rating || 0,
    comment: (entry.comment && entry.comment.trim()) || getDefaultFeedbackComment(entry.rating || existingReview.rating),
    branch: entry.branch || {
      plaridel: "Plaridel",
      malolos: "Malolos",
    }[targetBranchKey] || "Plaridel",
    date: entry.date || existingReview.date,
    editCount: 1,
  };

  if (matchedBranchKey !== targetBranchKey) {
    branchFeedback[matchedBranchKey] = (branchFeedback[matchedBranchKey] || []).filter(
      (feedback) => feedback.feedbackId !== existingReview.feedbackId
    );
    branchFeedback[targetBranchKey].unshift(updatedEntry);
  } else {
    const branchEntries = branchFeedback[matchedBranchKey] || [];
    const reviewIndex = branchEntries.findIndex((feedback) => feedback.feedbackId === existingReview.feedbackId);
    if (reviewIndex >= 0) {
      branchEntries[reviewIndex] = updatedEntry;
    }
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
  const rounded = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return Array.from({ length: 5 }, (_, index) => (index < rounded ? "★" : "☆")).join("");
}

function formatFeedbackDate(dateValue) {
  if (!dateValue) return "Recent";

  const parsedDate = typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ? new Date(`${dateValue}T12:00:00`)
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

  if (selectedBranch === "all") {
    return ["plaridel", "malolos"].reduce((allFeedback, branchKey) => {
      return allFeedback.concat(branchFeedback[branchKey] || []);
    }, []);
  }

  return branchFeedback[selectedBranch] || branchFeedback.plaridel;
}

function getCustomerBranchFeedback() {
  const customerBranchSelect = document.getElementById("feedbackBranchSelect");
  const selectedBranch = customerBranchSelect ? customerBranchSelect.value : "plaridel";
  return branchFeedback[selectedBranch] || branchFeedback.plaridel;
}

function getCustomerReviewBranchFilterValue() {
  const customerReviewBranchFilter = document.getElementById("customerReviewBranchFilter");
  return customerReviewBranchFilter ? customerReviewBranchFilter.value : "all";
}

function getCustomerReviewBranchFeedback() {
  const selectedBranch = getCustomerReviewBranchFilterValue();

  if (selectedBranch === "all") {
    return ["plaridel", "malolos"].reduce((allFeedback, branchKey) => {
      return allFeedback.concat(branchFeedback[branchKey] || []);
    }, []);
  }

  return branchFeedback[selectedBranch] || [];
}

function formatLocalDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRangeFromPreset(preset = "all") {
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
  const activeButton = document.querySelector(`.date-filter-button[data-date-group="${groupName}"].active`);
  return activeButton ? activeButton.dataset.dateFilter : "all";
}

function getFeedbackDateRange() {
  return getDateRangeFromPreset(getDatePreset("owner"));
}

function getCustomerReviewDateRange() {
  return getDateRangeFromPreset(getDatePreset("customer"));
}

function filterFeedbackByDate(feedbackList, dateRange = { start: "", end: "" }) {
  if (!Array.isArray(feedbackList)) return [];
  const { start, end } = dateRange || { start: "", end: "" };

  return feedbackList.filter((entry) => {
    if (start && entry.date < start) return false;
    if (end && entry.date > end) return false;
    return true;
  });
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
  if (star !== "all") return `${star}★ reviews`;
  return "All reviews";
}

function getFilteredReviews(feedbackList) {
  const filterValue = getReviewFilterValue();
  let filtered = [...feedbackList];

  if (filterValue !== "all") {
    filtered = filtered.filter((entry) => Number(entry.rating) === Number(filterValue));
  }

  return filtered;
}

function getFilteredOwnerReviews(feedbackList) {
  let filtered = [...(feedbackList || [])];
  const star = getOwnerStarFilterValue();

  if (star !== "all") {
    filtered = filtered.filter((entry) => Number(entry.rating) === Number(star));
  }

  return filtered;
}

function getReviewCommentText(entry) {
  if (entry?.commentHidden) {
    return "Comment hidden";
  }

  return (entry?.comment && entry.comment.trim()) || getDefaultFeedbackComment(entry?.rating);
}

function toggleFeedbackCommentVisibility(feedbackId) {
  const allFeedback = ["plaridel", "malolos"].flatMap((branchKey) => branchFeedback[branchKey] || []);
  const targetEntry = allFeedback.find((entry) => Number(entry.feedbackId) === Number(feedbackId));

  if (!targetEntry) return;

  targetEntry.commentHidden = !Boolean(targetEntry.commentHidden);
  renderOwnerFeedbackReviews();
  renderCustomerReviews();
}

function summarizeFeedbackInsights(feedbackList = []) {
  const positiveThemes = ["sarap", "fresh", "masarap", "maganda", "friendly", "service", "mabilis", "clean", "ambiance", "quality"];
  const negativeThemes = ["mahal", "matagal", "pila", "mali", "mainit", "slow", "delay", "issue", "bad", "uncomfortable"];

  const comments = feedbackList.map((entry) => (entry.comment || "").toLowerCase());
  const findings = {
    positive: [],
    negative: [],
  };

  positiveThemes.forEach((theme) => {
    const matches = comments.filter((comment) => comment.includes(theme)).length;
    if (matches > 0) {
      findings.positive.push({ theme, count: matches });
    }
  });

  negativeThemes.forEach((theme) => {
    const matches = comments.filter((comment) => comment.includes(theme)).length;
    if (matches > 0) {
      findings.negative.push({ theme, count: matches });
    }
  });

  findings.positive.sort((a, b) => b.count - a.count);
  findings.negative.sort((a, b) => b.count - a.count);

  return {
    highlightPositive: findings.positive[0] || { theme: "Positive service", count: 0 },
    highlightNegative: findings.negative[0] || { theme: "No key concern", count: 0 },
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
  const cards = reviews.map((entry) => {
    const tone = entry.rating >= 4 ? "positive" : entry.rating <= 2 ? "negative" : "neutral";
    const reviewText = getReviewCommentText(entry);
    const commentToggleLabel = entry.commentHidden ? "Show comment" : "Hide comment";

    return `
      <article class="review-card ${tone} ${entry.commentHidden ? "comment-hidden" : ""}">
        <div class="review-header">
          <div class="review-avatar">${(entry.branch || "C").charAt(0).toUpperCase()}</div>
          <div class="review-user-info">
            <strong>Customer</strong>
            <span>${entry.branch || "Plaridel"} • ${formatFeedbackDate(entry.date)}</span>
          </div>
          ${showOwnerControls ? `<button type="button" class="review-action-button" data-feedback-id="${entry.feedbackId}" data-review-action="toggle-comment-visibility">${commentToggleLabel}</button>` : ""}
        </div>
        <div class="review-score" aria-label="${entry.rating} out of 5 stars">${getStarDisplay(entry.rating)}</div>
        <p class="review-comment">“${reviewText}”</p>
      </article>
    `;
  }).join("");

  const label = overrideList !== undefined ? getOwnerFilterLabel() : (getReviewFilterValue() === "all" ? "All reviews" : `${getReviewFilterValue()}★ reviews`);
  container.innerHTML = `
    <div class="review-feed-header">
      <h3>${label}</h3>
      <span>${reviews.length} reviews</span>
    </div>
    <div class="review-feed-grid">${cards}</div>
  `;
}

function renderCustomerFeedbackSummary(feedbackList) {
  const container = document.getElementById("customerFeedbackSummary");
  if (!container) return;

  const stats = analyzeFeedback(feedbackList || []);
  const totalFeedback = stats.totalFeedback || 0;
  const averageRating = totalFeedback ? stats.averageRating : 0;
  const ratingEntries = [5, 4, 3, 2, 1];

  const distribution = ratingEntries.map((rating) => {
    const count = stats.ratingCounts[rating] || 0;
    const share = totalFeedback ? (count / totalFeedback) * 100 : 0;
    return `
      <div class="summary-breakdown-row">
        <span class="summary-breakdown-label">${rating}★</span>
        <div class="summary-breakdown-track">
          <span class="summary-breakdown-fill" style="width: ${share}%"></span>
        </div>
        <span class="summary-breakdown-count">${count}</span>
      </div>
    `;
  }).join("");

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
        ${distribution}
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
    ratingCounts[feedback.rating]++;
    totalRatingSum += feedback.rating;
  }

  const totalFeedback = feedbackList.length;
  const averageRating = totalFeedback > 0 ? (totalRatingSum / totalFeedback) : 0;
  const positiveCount = ratingCounts[4] + ratingCounts[5];
  const neutralCount = ratingCounts[3];
  const negativeCount = ratingCounts[1] + ratingCounts[2];

  return {
    totalFeedback,
    averageRating,
    ratingCounts,
    positiveCount,
    neutralCount,
    negativeCount,
  };
}

function renderFeedbackAnalysis(stats, feedbackList = []) {
  const container = document.getElementById("feedbackAnalysisContainer");
  if (!container) return;

  const totalFeedback = stats.totalFeedback || 0;
  const ratingEntries = [5, 4, 3, 2, 1];
  const insights = summarizeFeedbackInsights(feedbackList);
  const sentimentLabel = totalFeedback === 0 ? "No reviews yet" : stats.averageRating >= 4 ? "Strong positive" : stats.averageRating >= 3 ? "Healthy" : "Needs attention";

  const ratingRows = ratingEntries.map((rating) => {
    const count = stats.ratingCounts[rating] || 0;
    const width = totalFeedback ? (count / totalFeedback) * 100 : 0;
    let sentiment = "neutral";
    if (rating >= 4) sentiment = "positive";
    if (rating <= 2) sentiment = "negative";

    return `
      <div class="rating-row" data-sentiment="${sentiment}">
        <span class="rating-label">${rating}★</span>
        <div class="rating-bar-track">
          <div class="rating-bar-fill" style="width: ${width}%"></div>
        </div>
        <span class="rating-count">${count}</span>
      </div>
    `;
  }).join("");

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
          ${ratingRows}
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

  document.querySelectorAll(".date-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.dateGroup;
      document.querySelectorAll(`.date-filter-button[data-date-group="${group}"]`).forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      if (group === "customer") {
        renderCustomerReviews();
      } else {
        renderBranchFeedback();
      }
    });
  });

  document.querySelectorAll(".review-filter-button[data-review-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".review-filter-button[data-review-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderCustomerReviews();
    });
  });

  document.querySelectorAll(".owner-star-filter").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".owner-star-filter").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderBranchFeedback();
    });
  });
});