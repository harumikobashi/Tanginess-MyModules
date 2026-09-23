function disableNonPresentationActions() {
  const orderGroup = document.getElementById("sidebarOrdersGroup");
  const orderToggle = document.getElementById("sidebarOrdersToggle");
  const queueButton = document.getElementById("sidebarQueueButton");
  const orderLogsButton = document.getElementById("sidebarOrderLogsButton");

  [orderGroup, orderToggle, queueButton, orderLogsButton].forEach((element) => {
    if (!element) return;
    element.classList.add("disabled");
    element.setAttribute("aria-disabled", "true");
    if (element.tagName === "BUTTON") {
      element.disabled = true;
    }
  });

  const customerTabButtonsToDisable = [
    document.getElementById("showOrderTabButton"),
    document.getElementById("showCustomerStatusTabButton"),
  ];

  customerTabButtonsToDisable.forEach((button) => {
    if (!button) return;
    button.disabled = true;
    button.classList.add("disabled");
    button.setAttribute("aria-disabled", "true");
  });
}

// ===== VIEW SWITCHING (Cashier <-> Owner) =====
const customerView = document.getElementById("customerView");
const adminView = document.getElementById("adminView");
const switchToAdminButton = document.getElementById("switchToAdminButton");
const switchToCustomerButton = document.getElementById("switchToCustomerButton");

switchToAdminButton.addEventListener("click", () => {
  customerView.hidden = true;
  adminView.hidden = false;
});

switchToCustomerButton.addEventListener("click", () => {
  adminView.hidden = true;
  customerView.hidden = false;
});

// ===== CUSTOMER TABS (Create Order <-> Order Status) =====
const customerOrderTab = document.getElementById("customerOrderTab");
const customerStatusTab = document.getElementById("customerStatusTab");
const customerFeedbackTab = document.getElementById("customerFeedbackTab");
const showOrderTabButton = document.getElementById("showOrderTabButton");
const showCustomerStatusTabButton = document.getElementById("showCustomerStatusTabButton");
const showCustomerFeedbackTabButton = document.getElementById("showCustomerFeedbackTabButton");
const customerTabButtons = [showOrderTabButton, showCustomerStatusTabButton, showCustomerFeedbackTabButton];

function activateCustomerTab(tabName) {
  const tabs = {
    order: customerOrderTab,
    status: customerStatusTab,
    feedback: customerFeedbackTab,
  };

  customerOrderTab.hidden = tabName !== "order";
  customerStatusTab.hidden = tabName !== "status";
  customerFeedbackTab.hidden = tabName !== "feedback";

  customerTabButtons.forEach((button) => {
    button.classList.toggle("active", button.id === {
      order: "showOrderTabButton",
      status: "showCustomerStatusTabButton",
      feedback: "showCustomerFeedbackTabButton",
    }[tabName]);
  });
}

showOrderTabButton?.addEventListener("click", (event) => {
  event.preventDefault();
  return;
});
showCustomerStatusTabButton?.addEventListener("click", (event) => {
  event.preventDefault();
  return;
});
showCustomerFeedbackTabButton?.addEventListener("click", () => activateCustomerTab("feedback"));
activateCustomerTab("feedback");

// ===== OWNER SIDEBAR NAVIGATION =====
const adminShell = document.getElementById("adminShell");
const sidebarToggleButton = document.getElementById("sidebarToggleButton");

sidebarToggleButton.addEventListener("click", () => {
  adminShell.classList.toggle("sidebar-open");
});

// Every admin "page" section lives here. Hiding all, then showing one,
// is the same traversal pattern we used for the top tabs before.
const adminPages = {
  dashboard: document.getElementById("adminDashboardTab"),
  queue: document.getElementById("adminQueueTab"),
  orderLogs: document.getElementById("adminOrderLogsTab"),
  salesAnalytics: document.getElementById("adminSalesAnalyticsTab"),
  productSales: document.getElementById("adminProductSalesTab"),
  feedback: document.getElementById("adminFeedbackAnalysisTab"),
};

// Every clickable sidebar link/sublink lives here, so we can clear
// "active" highlighting before applying it to the one just clicked.
const adminNavButtons = [
  document.getElementById("sidebarDashboardButton"),
  document.getElementById("sidebarQueueButton"),
  document.getElementById("sidebarOrderLogsButton"),
  document.getElementById("sidebarSalesAnalyticsButton"),
  document.getElementById("sidebarProductSalesButton"),
  document.getElementById("sidebarFeedbackAnalysisButton"),
];

function showAdminPage(pageKey, buttonClicked) {
  for (const key in adminPages) {
    adminPages[key].hidden = true;
  }
  adminPages[pageKey].hidden = false;

  for (let i = 0; i < adminNavButtons.length; i++) {
    adminNavButtons[i].classList.remove("active");
  }
  buttonClicked.classList.add("active");

  // On mobile, close the sidebar after picking a page.
  adminShell.classList.remove("sidebar-open");
}

document.getElementById("sidebarDashboardButton")?.addEventListener("click", (e) => showAdminPage("dashboard", e.currentTarget));
document.getElementById("sidebarQueueButton")?.addEventListener("click", (e) => showAdminPage("queue", e.currentTarget));
document.getElementById("sidebarOrderLogsButton")?.addEventListener("click", (e) => showAdminPage("orderLogs", e.currentTarget));
document.getElementById("sidebarSalesAnalyticsButton").addEventListener("click", (e) => showAdminPage("salesAnalytics", e.currentTarget));
document.getElementById("sidebarProductSalesButton").addEventListener("click", (e) => showAdminPage("productSales", e.currentTarget));
document.getElementById("sidebarFeedbackAnalysisButton").addEventListener("click", (e) => showAdminPage("feedback", e.currentTarget));
showAdminPage("salesAnalytics", document.getElementById("sidebarSalesAnalyticsButton"));

document.getElementById("dashboardScannerButton").addEventListener("click", () => {
  showAdminPage("queue", document.getElementById("sidebarQueueButton"));
});
document.getElementById("dashboardSalesTabButton").addEventListener("click", () => {
  showAdminPage("salesAnalytics", document.getElementById("sidebarSalesAnalyticsButton"));
});
document.getElementById("dashboardProductSalesTabButton").addEventListener("click", () => {
  showAdminPage("productSales", document.getElementById("sidebarProductSalesButton"));
});
document.getElementById("dashboardFeedbackTabButton").addEventListener("click", () => {
  showAdminPage("feedback", document.getElementById("sidebarFeedbackAnalysisButton"));
});

document.getElementById("dashboardQueueLink").addEventListener("click", () => {
  showAdminPage("queue", document.getElementById("sidebarQueueButton"));
});
document.getElementById("dashboardSalesLink").addEventListener("click", () => {
  showAdminPage("salesAnalytics", document.getElementById("sidebarSalesAnalyticsButton"));
});
document.getElementById("dashboardProductSalesLink").addEventListener("click", () => {
  showAdminPage("productSales", document.getElementById("sidebarProductSalesButton"));
});
document.getElementById("dashboardRecentOrdersLink").addEventListener("click", () => {
  showAdminPage("queue", document.getElementById("sidebarQueueButton"));
});
document.getElementById("dashboardFeedbackLink").addEventListener("click", () => {
  showAdminPage("feedback", document.getElementById("sidebarFeedbackAnalysisButton"));
});

// ===== CUSTOMER FEEDBACK FORM =====
const customerFeedbackForm = document.getElementById("customerFeedbackForm");
const customerFeedbackMessage = document.getElementById("customerFeedbackMessage");

function getDefaultFeedbackComment(rating) {
  const safeRating = Number(rating) || 0;

  if (safeRating >= 4) {
    return "Customer shared a positive experience.";
  }

  if (safeRating <= 2) {
    return "Customer shared a negative experience.";
  }

  return "Customer shared a neutral experience.";
}

function getBranchKeyFromLabel(branchLabel) {
  const normalizedBranch = typeof branchLabel === "string" ? branchLabel.trim() : "";
  const branchMap = {
    Plaridel: "plaridel",
    Malolos: "malolos",
  };

  return branchMap[normalizedBranch] || "plaridel";
}

function getCurrentCustomerFeedbackEntry() {
  if (typeof window.getCustomerFeedbackEntry === "function") {
    return window.getCustomerFeedbackEntry("demo-customer", "completed-order-1");
  }

  return null;
}

function setFeedbackFormEditState(isEditing) {
  const submitButton = document.getElementById("customerFeedbackSubmitButton");
  const editActions = document.getElementById("customerFeedbackEditActions");
  const editButton = document.getElementById("customerFeedbackEditButton");
  const cancelButton = document.getElementById("customerFeedbackCancelButton");

  customerFeedbackForm.dataset.editMode = isEditing ? "true" : "false";

  if (submitButton) {
    submitButton.textContent = isEditing ? "Update Feedback" : "Submit Feedback";
    submitButton.classList.toggle("is-editing", isEditing);
  }

  if (editActions) {
    editActions.hidden = !isEditing && !getCurrentCustomerFeedbackEntry();
  }

  if (editButton) {
    editButton.hidden = !isEditing && !getCurrentCustomerFeedbackEntry();
  }

  if (cancelButton) {
    cancelButton.hidden = !isEditing;
  }
}

function updateCustomerFeedbackEditButton() {
  const existingEntry = getCurrentCustomerFeedbackEntry();
  const editActions = document.getElementById("customerFeedbackEditActions");
  const editButton = document.getElementById("customerFeedbackEditButton");
  const cancelButton = document.getElementById("customerFeedbackCancelButton");
  const submitButton = document.getElementById("customerFeedbackSubmitButton");
  const canEdit = existingEntry && Number(existingEntry.editCount || 0) < 1;

  if (editActions) {
    editActions.hidden = !canEdit && !customerFeedbackForm.dataset.editMode;
  }

  if (editButton) {
    editButton.hidden = !canEdit && customerFeedbackForm.dataset.editMode !== "true";
  }

  if (cancelButton) {
    cancelButton.hidden = customerFeedbackForm.dataset.editMode !== "true";
  }

  if (submitButton) {
    const isEditing = customerFeedbackForm.dataset.editMode === "true";
    submitButton.textContent = isEditing ? "Update Feedback" : "Submit Feedback";
    submitButton.classList.toggle("is-editing", isEditing);
  }
}

if (document.getElementById("customerFeedbackEditButton")) {
  document.getElementById("customerFeedbackEditButton").addEventListener("click", () => {
    const entry = getCurrentCustomerFeedbackEntry();
    if (!entry || Number(entry.editCount || 0) >= 1) {
      return;
    }

    customerFeedbackForm.dataset.editMode = "true";
    const branchSelect = document.getElementById("feedbackBranchSelect");
    const commentInput = document.getElementById("feedbackComment");
    const ratingInput = document.querySelector(`input[name="customerRating"][value="${entry.rating}"]`);
    if (branchSelect) branchSelect.value = getBranchKeyFromLabel(entry.branch);
    if (commentInput) commentInput.value = entry.comment || "";
    if (ratingInput) ratingInput.checked = true;

    if (customerFeedbackMessage) {
      customerFeedbackMessage.textContent = "You may update your feedback once before it is locked.";
      customerFeedbackMessage.classList.add("visible");
    }

    setFeedbackFormEditState(true);
    if (commentInput) commentInput.focus();
  });
}

if (document.getElementById("customerFeedbackCancelButton")) {
  document.getElementById("customerFeedbackCancelButton").addEventListener("click", () => {
    customerFeedbackForm.reset();
    const defaultRating = document.getElementById("rating5");
    if (defaultRating) defaultRating.checked = true;
    setFeedbackFormEditState(false);
    if (customerFeedbackMessage) {
      customerFeedbackMessage.textContent = "Edit cancelled.";
      customerFeedbackMessage.classList.add("visible");
    }
  });
}

customerFeedbackForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const branchSelect = document.getElementById("feedbackBranchSelect");
  const commentInput = document.getElementById("feedbackComment");
  const selectedRating = document.querySelector('input[name="customerRating"]:checked');
  const rating = Number(selectedRating ? selectedRating.value : 5);
  const branchKey = branchSelect && branchSelect.value ? branchSelect.value : "plaridel";
  const branchLabel = {
    plaridel: "Plaridel",
    malolos: "Malolos",
  }[branchKey] || "Plaridel";

  const localNow = new Date();
  const localDate = new Date(localNow.getTime() - localNow.getTimezoneOffset() * 60000).toISOString().split("T")[0];

  const existingEntry = getCurrentCustomerFeedbackEntry();
  const isEditing = customerFeedbackForm.dataset.editMode === "true" && existingEntry && Number(existingEntry.editCount || 0) < 1;

  const newEntry = {
    feedbackId: existingEntry ? existingEntry.feedbackId : Date.now(),
    customerId: "demo-customer",
    orderId: "completed-order-1",
    rating,
    comment: (commentInput ? commentInput.value.trim() : "") || getDefaultFeedbackComment(rating),
    date: localDate,
    branch: branchLabel,
  };

  let feedbackAccepted = false;
  if (isEditing && typeof window.updateCustomerFeedbackEntry === "function") {
    feedbackAccepted = window.updateCustomerFeedbackEntry(newEntry, branchKey);
  } else if (typeof window.addCustomerFeedbackEntry === "function") {
    feedbackAccepted = window.addCustomerFeedbackEntry(newEntry, branchKey);
  }

  if (customerFeedbackMessage) {
    customerFeedbackMessage.textContent = feedbackAccepted
      ? (isEditing
        ? "Your feedback has been saved. This was your final edit."
        : "Thank you! Your feedback has been submitted for this completed order.")
      : (existingEntry && Number(existingEntry.editCount || 0) < 1
        ? "This completed order already has a review. Use the edit button to update it once."
        : "This completed order already has a review.");
    customerFeedbackMessage.classList.add("visible");
  }

  if (feedbackAccepted && customerFeedbackForm) {
    customerFeedbackForm.reset();
    const defaultRating = document.getElementById("rating5");
    if (defaultRating) defaultRating.checked = true;
    setFeedbackFormEditState(false);
    updateCustomerFeedbackEditButton();
  }

  if (commentInput) commentInput.focus();
});

updateCustomerFeedbackEditButton();

// ===== EXPANDABLE SUBMENUS (Orders / Sales / Feedback groups) =====
function wireSubmenuToggle(toggleId, submenuId) {
  const toggleButton = document.getElementById(toggleId);
  const submenu = document.getElementById(submenuId);
  if (!toggleButton || !submenu) return;
  if (toggleButton.classList.contains("disabled")) return;
  toggleButton.addEventListener("click", () => {
    submenu.classList.toggle("collapsed");
    toggleButton.classList.toggle("open");
  });
}

wireSubmenuToggle("sidebarOrdersToggle", "sidebarOrdersSubmenu");
wireSubmenuToggle("sidebarSalesToggle", "sidebarSalesSubmenu");
wireSubmenuToggle("sidebarFeedbackToggle", "sidebarFeedbackSubmenu");

disableNonPresentationActions();

// ===== ORDER LOGS (separate from analytics reports) =====
const orderLogsByBranch = {
  general: [
    { orderId: 1001, date: "2026-09-01", customer: "Maria D.", items: [{ name: "Strawberry", qty: 2, price: 50 }, { name: "Mango", qty: 1, price: 55 }], total: 155, status: "Completed", branch: "General" },
    { orderId: 1002, date: "2026-09-02", customer: "Jhen P.", items: [{ name: "Blueberry", qty: 3, price: 60 }], total: 180, status: "Completed", branch: "General" },
    { orderId: 1003, date: "2026-09-03", customer: "Alex C.", items: [{ name: "Strawberry", qty: 1, price: 50 }, { name: "Blueberry", qty: 2, price: 60 }], total: 170, status: "Completed", branch: "General" },
    { orderId: 1004, date: "2026-09-04", customer: "Nina L.", items: [{ name: "Mango", qty: 2, price: 55 }], total: 110, status: "Completed", branch: "General" },
  ],
  plaridel: [
    { orderId: 2001, date: "2026-09-01", customer: "Rico T.", items: [{ name: "Strawberry", qty: 3, price: 50 }], total: 150, status: "Completed", branch: "Plaridel" },
    { orderId: 2002, date: "2026-09-02", customer: "Ella S.", items: [{ name: "Mango", qty: 2, price: 55 }, { name: "Blueberry", qty: 1, price: 60 }], total: 170, status: "Completed", branch: "Plaridel" },
    { orderId: 2003, date: "2026-09-03", customer: "Paul R.", items: [{ name: "Blueberry", qty: 2, price: 60 }, { name: "Strawberry", qty: 1, price: 50 }], total: 170, status: "Completed", branch: "Plaridel" },
    { orderId: 2004, date: "2026-09-04", customer: "Grace M.", items: [{ name: "Mango", qty: 3, price: 55 }], total: 165, status: "Completed", branch: "Plaridel" },
  ],
  malolos: [
    { orderId: 3001, date: "2026-09-01", customer: "Kenneth A.", items: [{ name: "Blueberry", qty: 2, price: 60 }], total: 120, status: "Completed", branch: "Malolos" },
    { orderId: 3002, date: "2026-09-02", customer: "Dianne F.", items: [{ name: "Strawberry", qty: 2, price: 50 }, { name: "Mango", qty: 1, price: 55 }], total: 155, status: "Completed", branch: "Malolos" },
    { orderId: 3003, date: "2026-09-03", customer: "Theo N.", items: [{ name: "Blueberry", qty: 3, price: 60 }], total: 180, status: "Completed", branch: "Malolos" },
    { orderId: 3004, date: "2026-09-04", customer: "Yna B.", items: [{ name: "Strawberry", qty: 3, price: 50 }, { name: "Mango", qty: 2, price: 55 }], total: 260, status: "Completed", branch: "Malolos" },
  ],
};

function getSelectedOrderLogs() {
  const branchSelect = document.getElementById("branchFilterSelect");
  const selectedBranch = branchSelect ? branchSelect.value : "general";
  return orderLogsByBranch[selectedBranch] || orderLogsByBranch.general;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

function renderRecentOrders() {
  const container = document.getElementById("dashboardRecentOrdersContainer");
  if (!container) return;

  const orders = getSelectedOrderLogs()
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  if (!orders.length) {
    container.innerHTML = `
      <div class="dashboard-empty-state">
        <strong>No orders yet</strong>
        <span>New orders will appear here after checkout.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map((order) => {
    const itemSummary = order.items.map((item) => `${item.name} x${item.qty}`).join(" • ");
    return `
      <div class="dashboard-order-item">
        <div class="dashboard-order-main">
          <span class="dashboard-order-id">#${order.orderId}</span>
          <strong>${order.customer}</strong>
        </div>
        <div class="dashboard-order-meta">${order.date} • ${itemSummary}</div>
        <div class="dashboard-order-footer">
          <span class="dashboard-order-status">${order.status}</span>
          <span class="dashboard-order-total">${formatCurrency(order.total)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderOrderQueue() {
  const container = document.getElementById("orderQueueContainer");
  const nextOrderText = document.getElementById("nextOrderText");
  if (!container) return;

  const orders = getSelectedOrderLogs().slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!orders.length) {
    container.innerHTML = '<p>No orders in queue.</p>';
    if (nextOrderText) nextOrderText.textContent = "No next order.";
    return;
  }

  const nextOrder = orders[0];
  if (nextOrderText) {
    nextOrderText.textContent = `Next order: #${nextOrder.orderId} • ${nextOrder.customer} • ${formatCurrency(nextOrder.total)}`;
  }

  const rows = orders.map((order) => `
    <tr>
      <td>#${order.orderId}</td>
      <td>${order.customer}</td>
      <td>${order.date}</td>
      <td>${order.items.map((item) => `${item.name} x${item.qty}`).join(", ")}</td>
      <td>${formatCurrency(order.total)}</td>
      <td><span class="order-status-pill">${order.status}</span></td>
    </tr>
  `).join("");

  container.innerHTML = `
    <table class="order-queue-table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function refreshOrderLogs() {
  renderRecentOrders();
  renderOrderQueue();

  const orderLogsContainer = document.getElementById("orderLogsContainer");
  if (orderLogsContainer) {
    orderLogsContainer.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const branchSelect = document.getElementById("branchFilterSelect");

  refreshOrderLogs();

  if (branchSelect) {
    branchSelect.addEventListener("change", refreshOrderLogs);
  }
});