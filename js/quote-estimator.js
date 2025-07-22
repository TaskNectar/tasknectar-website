console.log("quote-estimator.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quoteForm");
  const addItemBtn = document.getElementById("addItemBtn");
  const itemsBody = document.getElementById("itemsBody");
  const subtotalEl = document.getElementById("subtotal");
  const taxAmountEl = document.getElementById("taxAmount");
  const quoteTotalEl = document.getElementById("quoteTotal");
  const currencyEl = document.getElementById("currency");
  const taxRateEl = document.getElementById("taxRate");
  const previewContainer = document.getElementById("pdfPreviewContainer");
  const generatePreviewBtn = document.getElementById("generatePreviewBtn");
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");

  function formatCurrency(value) {
    const symbol = currencyEl.value;
    return `${symbol}${value.toFixed(2)}`;
  }

  function updateTotals() {
    let subtotal = 0;

    itemsBody.querySelectorAll("tr").forEach(row => {
      const qty = parseFloat(row.querySelector(".item-qty").value) || 0;
      const price = parseFloat(row.querySelector(".item-price").value) || 0;
      const total = qty * price;

      row.querySelector(".item-total").textContent = formatCurrency(total);
      subtotal += total;
    });

    const taxRate = parseFloat(taxRateEl.value) || 0;
    const tax = subtotal * (taxRate / 100);
    const grandTotal = subtotal + tax;

    subtotalEl.textContent = formatCurrency(subtotal);
    taxAmountEl.textContent = formatCurrency(tax);
    quoteTotalEl.textContent = formatCurrency(grandTotal);
  }

  function createItemRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" class="item-desc" placeholder="Item description" required></td>
      <td><input type="number" class="item-qty" value="1" min="0" required></td>
      <td><input type="number" class="item-price" value="0.00" min="0" step="0.01" required></td>
      <td class="item-total">£0.00</td>
      <td><button type="button" class="remove-item-btn">&times;</button></td>
    `;

    tr.querySelector(".item-qty").addEventListener("input", updateTotals);
    tr.querySelector(".item-price").addEventListener("input", updateTotals);
    tr.querySelector(".remove-item-btn").addEventListener("click", () => {
      tr.remove();
      updateTotals();
    });

    return tr;
  }

  addItemBtn.addEventListener("click", () => {
    itemsBody.appendChild(createItemRow());
    updateTotals();
  });

  currencyEl.addEventListener("change", updateTotals);
  taxRateEl.addEventListener("input", updateTotals);

  // Add initial row on page load
  itemsBody.appendChild(createItemRow());
  updateTotals();

  async function toDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function generatePreview() {
    console.log("generatePreview called");

    const logoFile = document.getElementById("companyLogo").files[0];
    const logoURL = logoFile ? await toDataURL(logoFile) : null;

    const data = collectFormData(logoURL);

    console.log("Preview data object:", data);

    const preview = buildPreviewElement(data);

    previewContainer.innerHTML = "";
    previewContainer.appendChild(preview);
  }

  function collectFormData(logoURL) {
    const data = {
      companyName: document.getElementById("companyName").value.trim(),
      companyEmail: document.getElementById("companyEmail").value.trim(),
      companyPhone: document.getElementById("companyPhone").value.trim(),
      notes: document.getElementById("notes").value.trim(),
      quoteNumber: document.getElementById("quoteNumber").value.trim(),
      quoteDate: document.getElementById("quoteDate").value,
      clientName: document.getElementById("clientName").value.trim(),
      currency: currencyEl.value,
      taxRate: parseFloat(taxRateEl.value) || 0,
      items: [],
      logo: logoURL
    };

    itemsBody.querySelectorAll("tr").forEach(row => {
      const desc = row.querySelector(".item-desc").value.trim();
      const qty = parseFloat(row.querySelector(".item-qty").value) || 0;
      const price = parseFloat(row.querySelector(".item-price").value) || 0;
      // Changed condition here to allow items with description only
      if (desc) {
        data.items.push({ desc, qty, price });
      }
    });

    return data;
  }

  function buildPreviewElement(data) {
    const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const tax = subtotal * (data.taxRate / 100);
    const total = subtotal + tax;

    const preview = document.createElement("div");
    preview.setAttribute("id", "pdfContent");
    preview.style.fontFamily = "Arial, sans-serif";
    preview.style.maxWidth = "800px";
    preview.style.padding = "20px";
    preview.style.background = "white";

    preview.innerHTML = `
      <div style="display: flex; justify-content: space-between;">
        <div>
          ${data.logo ? `<img src="${data.logo}" style="max-height: 80px;"><br>` : ""}
          <strong>${data.companyName}</strong><br>
          ${data.companyEmail}<br>
          ${data.companyPhone}<br>
          ${data.notes ? `<p style="margin-top:10px;">${data.notes}</p>` : ""}
        </div>
        <div style="text-align: right;">
          <strong>Quote #: </strong>${data.quoteNumber}<br>
          <strong>Date: </strong>${data.quoteDate}<br>
          <strong>Customer: </strong>${data.clientName}
        </div>
      </div>
      <hr>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 6px;">Description</th>
            <th style="border: 1px solid #ccc; padding: 6px;">Qty</th>
            <th style="border: 1px solid #ccc; padding: 6px;">Price</th>
            <th style="border: 1px solid #ccc; padding: 6px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 6px;">${item.desc}</td>
              <td style="border: 1px solid #ccc; padding: 6px; text-align:center;">${item.qty}</td>
              <td style="border: 1px solid #ccc; padding: 6px;">${data.currency}${item.price.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 6px;">${data.currency}${(item.qty * item.price).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="margin-top: 10px; text-align: right;">
        <p><strong>Subtotal:</strong> ${data.currency}${subtotal.toFixed(2)}</p>
        <p><strong>Tax (${data.taxRate}%):</strong> ${data.currency}${tax.toFixed(2)}</p>
        <p><strong>Total:</strong> ${data.currency}${total.toFixed(2)}</p>
      </div>
    `;

    // Debug log of generated HTML
    console.log("Preview innerHTML generated:", preview.innerHTML);

    return preview;
  }

  generatePreviewBtn.addEventListener("click", async () => {
    await generatePreview();
  });

  downloadPdfBtn.addEventListener("click", async () => {
  console.log("Download PDF triggered");

  const logoFile = document.getElementById("companyLogo").files[0];
  const logoURL = logoFile ? await toDataURL(logoFile) : null;
  const data = collectFormData(logoURL);

  if (data.items.length === 0) {
    alert("Please add at least one item to generate the quote.");
    return;
  }

  const preview = buildPreviewElement(data);

  preview.style.position = "absolute";
  preview.style.left = "-9999px";
  document.body.appendChild(preview);

  // Wait for logo image to load if present
  if (data.logo) {
    const img = preview.querySelector("img");
    await new Promise((resolve, reject) => {
      if (!img) resolve();
      else if (img.complete) resolve();
      else img.onload = () => resolve();
      img.onerror = () => resolve(); // fail gracefully
    });
  }

  // Add a short delay to ensure rendering
  await new Promise(resolve => setTimeout(resolve, 100));

  html2pdf()
    .set({
      margin: 10,
      filename: `Quote-${data.quoteNumber || "Generated"}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    })
    .from(preview)
    .save()
    .finally(() => {
      preview.remove();
      console.log("Temporary preview element removed from DOM");
    });
});



});
