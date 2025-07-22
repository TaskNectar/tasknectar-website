document.addEventListener('DOMContentLoaded', () => {
  const stockForm = document.getElementById('stockForm');
  const itemNameInput = document.getElementById('itemName');
  const itemQtyInput = document.getElementById('itemQty');
  const itemPriceInput = document.getElementById('itemPrice');
  const currencySelect = document.getElementById('currencySelect');
  const currencyPrefix = document.getElementById('currencyPrefix');
  const stockBody = document.getElementById('stockBody');
  const totalQuantitySpan = document.getElementById('totalQuantity');
  const totalValueSpan = document.getElementById('totalValue');

  let currentCurrency = currencySelect.value;

  const headers = [
    "Item Name",
    "Quantity",
    "Unit Price",
    "Total Price",
    "Adjust Qty",
    "Actions"
  ];

  // Update currency prefix and prices on change
  currencySelect.addEventListener('change', () => {
    currentCurrency = currencySelect.value;
    currencyPrefix.textContent = currentCurrency;
    updateAllPricesCurrency();
    updateTotals();
  });

  // Clear the "No items yet" row if it exists
  function clearEmptyRow() {
    const emptyRow = stockBody.querySelector('tr.empty');
    if (emptyRow) emptyRow.remove();
  }

  // Create a TD with optional class and data-label attribute (for mobile)
  function createCell(text = '', className = '', label = '') {
    const td = document.createElement('td');
    if (className) td.className = className;
    td.textContent = text;
    if (label) td.setAttribute('data-label', label);
    return td;
  }

  // Create a button element with text and class
  function createButton(text, className) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.className = className;
    return btn;
  }

  // Update all unit and total prices in the table when currency changes
  function updateAllPricesCurrency() {
    const rows = stockBody.querySelectorAll('tr:not(.empty)');
    rows.forEach(row => {
      const unitPriceCell = row.querySelector('.unit-price');
      const totalPriceCell = row.querySelector('.total-price');
      const qty = parseInt(row.querySelector('.qty-value').textContent, 10);
      const unitPrice = parseFloat(unitPriceCell.dataset.price);
      unitPriceCell.textContent = currentCurrency + unitPrice.toFixed(2);
      totalPriceCell.textContent = currentCurrency + (qty * unitPrice).toFixed(2);
    });
  }

  // Update prices for a single row based on qty
  function updateRowPrices(row, qty) {
    const unitPriceTd = row.querySelector('.unit-price');
    const totalPriceTd = row.querySelector('.total-price');
    const unitPrice = parseFloat(unitPriceTd.dataset.price);
    totalPriceTd.textContent = currentCurrency + (unitPrice * qty).toFixed(2);
  }

  // Update the totals: total quantity and total value
  function updateTotals() {
    let totalQuantity = 0;
    let totalValue = 0;

    const rows = stockBody.querySelectorAll('tr:not(.empty)');
    rows.forEach(row => {
      const qty = parseInt(row.querySelector('.qty-value').textContent, 10);
      const unitPrice = parseFloat(row.querySelector('.unit-price').dataset.price);
      totalQuantity += qty;
      totalValue += qty * unitPrice;
    });

    totalQuantitySpan.textContent = totalQuantity;
    totalValueSpan.textContent = totalValue.toFixed(2);
  }

  // Add a new item row to the table
  function addItemRow(name, qty, unitPrice) {
    clearEmptyRow();

    const tr = document.createElement('tr');

    tr.appendChild(createCell(name, '', headers[0]));
    const qtyTd = createCell(qty.toString(), 'qty-value', headers[1]);
    tr.appendChild(qtyTd);

    const unitPriceTd = createCell(currentCurrency + unitPrice.toFixed(2), 'unit-price', headers[2]);
    unitPriceTd.dataset.price = unitPrice.toString();
    tr.appendChild(unitPriceTd);

    const totalPriceTd = createCell(currentCurrency + (qty * unitPrice).toFixed(2), 'total-price', headers[3]);
    tr.appendChild(totalPriceTd);

    // Adjust quantity buttons cell
    const adjustTd = document.createElement('td');
    adjustTd.setAttribute('data-label', headers[4]);
    const btnMinus = createButton('−', 'adjust-btn');
    const btnPlus = createButton('+', 'adjust-btn');

    btnMinus.addEventListener('click', () => {
      let currentQty = parseInt(qtyTd.textContent, 10);
      if (currentQty > 0) {
        currentQty--;
        qtyTd.textContent = currentQty;
        updateRowPrices(tr, currentQty);
        updateTotals();
      }
    });

    btnPlus.addEventListener('click', () => {
      let currentQty = parseInt(qtyTd.textContent, 10);
      currentQty++;
      qtyTd.textContent = currentQty;
      updateRowPrices(tr, currentQty);
      updateTotals();
    });

    adjustTd.appendChild(btnMinus);
    adjustTd.appendChild(btnPlus);
    tr.appendChild(adjustTd);

    // Remove button cell
    const removeTd = document.createElement('td');
    removeTd.setAttribute('data-label', headers[5]);
    const btnRemove = createButton('🗑️', 'remove-btn');
    btnRemove.title = 'Remove item';
    btnRemove.addEventListener('click', () => {
      tr.remove();
      updateTotals();
      if (stockBody.children.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty';
        emptyRow.innerHTML = `<td colspan="6">No items yet</td>`;
        stockBody.appendChild(emptyRow);
      }
    });
    removeTd.appendChild(btnRemove);
    tr.appendChild(removeTd);

    // Insert new row at top of tbody
    stockBody.insertBefore(tr, stockBody.firstChild);

    // Update totals after adding row
    updateTotals();
  }

  // Handle form submission
  stockForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const qty = parseInt(itemQtyInput.value, 10);
    const unitPriceRaw = itemPriceInput.value.trim();
    const unitPrice = unitPriceRaw ? parseFloat(unitPriceRaw) : 0;

    if (!name || isNaN(qty) || qty < 0 || isNaN(unitPrice) || unitPrice < 0) return;

    addItemRow(name, qty, unitPrice);

    stockForm.reset();
  });

  // Initialize totals on page load (in case of pre-existing rows)
  updateTotals();
});

// CSV export button handler
document.getElementById('exportCsvBtn').addEventListener('click', () => {
  const rows = document.querySelectorAll('#stockBody tr:not(.empty)');
  if (rows.length === 0) {
    alert('No data to export.');
    return;
  }

  // CSV Header
  const headers = ['Item Name', 'Quantity', 'Unit Price', 'Total Price'];
  let csvContent = headers.join(',') + '\n';

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    // Extract text, ignoring buttons columns (last 2)
    // Assuming first 4 columns are data columns
    const rowData = [];
    for (let i = 0; i < 4; i++) {
      let cellText = cells[i].textContent.trim();

      // Remove currency prefix if you want just numbers
      if (i === 2 || i === 3) {
        cellText = cellText.replace(/[^\d.,-]/g, '');
      }

      // Escape quotes if any
      if (cellText.includes(',') || cellText.includes('"')) {
        cellText = `"${cellText.replace(/"/g, '""')}"`;
      }

      rowData.push(cellText);
    }
    csvContent += rowData.join(',') + '\n';
  });

  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

