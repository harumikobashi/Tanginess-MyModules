function getSelectedBranchOrders() {
  if (typeof window.getSelectedOrderLogs === "function") {
    return window.getSelectedOrderLogs();
  }

  const branchSelect = document.getElementById("branchFilterSelect");
  const selectedBranch = branchSelect ? branchSelect.value : "general";

  if (window.orderLogsByBranch && window.orderLogsByBranch[selectedBranch]) {
    return window.orderLogsByBranch[selectedBranch];
  }

  if (window.orderLogsByBranch && window.orderLogsByBranch.general) {
    return window.orderLogsByBranch.general;
  }

  return [];
}

function calculateSalesAnalytics(orders) {
  let totalOrders = 0;
  let totalItemsSold = 0;
  let totalRevenue = 0;

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    if (order.status !== "Completed") continue;
    totalOrders++;
    for (let j = 0; j < order.items.length; j++) {
      totalItemsSold += order.items[j].qty;
    }
    totalRevenue += order.total;
  }

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  return { totalOrders, totalItemsSold, totalRevenue, averageOrderValue };
}

function filterOrdersByDate(orders, startDate, endDate) {
  const filteredOrders = [];
  let filteredCount = 0;

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];

    if (order.date >= startDate && order.date <= endDate) {
      filteredOrders[filteredCount] = order;
      filteredCount = filteredCount + 1;
    }
  }

  filteredOrders.length = filteredCount;
  return filteredOrders;
}

function renderSalesAnalytics(stats) {
  const container = document.getElementById("salesAnalyticsContainer");
  container.innerHTML = `
    <div class="analytics-shell">
      <div class="analytics-summary-grid">
        <div class="analytics-metric">
          <span class="metric-label">Total Orders</span>
          <span class="metric-value">${stats.totalOrders}</span>
          <span class="metric-subtext">Completed orders</span>
        </div>
        <div class="analytics-metric">
          <span class="metric-label">Items Sold</span>
          <span class="metric-value">${stats.totalItemsSold}</span>
          <span class="metric-subtext">Units sold</span>
        </div>
        <div class="analytics-metric">
          <span class="metric-label">Revenue</span>
          <span class="metric-value">Php ${stats.totalRevenue}</span>
          <span class="metric-subtext">Gross sales</span>
        </div>
        <div class="analytics-metric">
          <span class="metric-label">Avg. Order</span>
          <span class="metric-value">Php ${stats.averageOrderValue.toFixed(2)}</span>
          <span class="metric-subtext">Per order</span>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const applyFilterButton = document.getElementById("applySalesFilterButton");
  const branchSelect = document.getElementById("branchFilterSelect");

  function renderBranchSales() {
    const orders = getSelectedBranchOrders();
    const startDate = document.getElementById("salesStartDate").value;
    const endDate = document.getElementById("salesEndDate").value;

    const filtered = startDate && endDate ? filterOrdersByDate(orders, startDate, endDate) : orders;
    renderSalesAnalytics(calculateSalesAnalytics(filtered));
  }

  renderBranchSales();

  if (branchSelect) {
    branchSelect.addEventListener("change", renderBranchSales);
  }

  applyFilterButton.addEventListener("click", () => {
    const startDate = document.getElementById("salesStartDate").value;
    const endDate = document.getElementById("salesEndDate").value;
    if (!startDate || !endDate) {
      alert("Please select both a start and end date.");
      return;
    }
    renderBranchSales();
  });
});