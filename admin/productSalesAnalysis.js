// ===== PRODUCT SALES ANALYSIS =====
// Uses the existing order records already managed by the project instead of
// duplicating sample order data. The processing logic is implemented manually
// to satisfy beginner-friendly DSA requirements.
function getSelectedBranchProducts() {
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

// STEP 1 & 2: TRAVERSAL + GROUPING
// This function goes through every order, then every item inside each order,
// and groups quantities/revenue by product name.
function analyzeProductSales(orders) {
  // "productMap" is like a dictionary/box labeled by product name.
  // Example: { "Strawberry": { quantity: 3, revenue: 150 } }
  const productMap = {};

  // TRAVERSAL: go through every order one by one.
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    if (order.status !== "Completed") continue;

    // TRAVERSAL (nested): go through every item inside this order.
    for (let j = 0; j < order.items.length; j++) {
      const item = order.items[j];

      // If we haven't seen this product before, create a fresh entry for it.
      if (!productMap[item.name]) {
        productMap[item.name] = { quantity: 0, revenue: 0 };
      }

      // AGGREGATION: add this item's quantity and revenue to its product's totals.
      productMap[item.name].quantity += item.qty;
      productMap[item.name].revenue += item.qty * item.price;
    }
  }

  // Convert the productMap into a plain array so we can sort it.
  // Each entry becomes: { name: "Strawberry", quantity: 3, revenue: 150 }
  const productNames = [];
  let productNameIndex = 0;
  for (const productName in productMap) {
    productNames[productNameIndex] = productName;
    productNameIndex = productNameIndex + 1;
  }

  const productArray = [];

  for (let i = 0; i < productNames.length; i++) {
    const name = productNames[i];
    productArray[i] = {
      name: name,
      quantity: productMap[name].quantity,
      revenue: productMap[name].revenue,
    };
  }

  // SORTING: arrange products from highest revenue to lowest.
  // This manual insertion sort keeps the same result without using the built-in sort method.
  for (let i = 1; i < productArray.length; i++) {
    const currentItem = productArray[i];
    let j = i - 1;

    while (j >= 0 && productArray[j].revenue < currentItem.revenue) {
      productArray[j + 1] = productArray[j];
      j = j - 1;
    }

    productArray[j + 1] = currentItem;
  }

  // Add rank (1st, 2nd, 3rd...) based on the sorted order.
  for (let i = 0; i < productArray.length; i++) {
    productArray[i].rank = i + 1;
  }

  return productArray;
}

// ===== RENDER FUNCTION =====
function renderProductSalesTable(products) {
  const container = document.getElementById("productSalesContainer");

  let rowsHtml = "";
  let topProduct = null;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (i === 0) topProduct = p;

    rowsHtml += `
      <tr>
        <td>#${p.rank}</td>
        <td>${p.name}</td>
        <td>${p.quantity}</td>
        <td>Php ${p.revenue}</td>
      </tr>
    `;
  }

  container.innerHTML = `
    <div class="analytics-shell">
      <div class="data-card top-product-highlight">
        <div>
          <span class="top-product-label">Top Product</span>
          <h3>${topProduct ? topProduct.name : "No product yet"}</h3>
        </div>
        <div class="top-product-badge">#${topProduct ? topProduct.rank : "-"}</div>
      </div>

      <div class="data-card table-card">
        <h3>Top performing products</h3>
        <table class="product-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Qty Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="4">No product sales data available.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const branchSelect = document.getElementById("branchFilterSelect");

  function renderBranchProductSales() {
    renderProductSalesTable(analyzeProductSales(getSelectedBranchProducts()));
  }

  renderBranchProductSales();

  if (branchSelect) {
    branchSelect.addEventListener("change", renderBranchProductSales);
  }
});