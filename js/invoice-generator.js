// START INVOICE GENERATOR
let logoDataURL = null;
document.getElementById("remove-logo").style.display = "none"; // Hide remove button initially

function updateTotals() {
  const currency = document.getElementById("currency").value;
  const taxRate = parseFloat(document.getElementById("tax-rate").value) || 0;
  let net = 0;

  document.querySelectorAll("#invoice-body tr").forEach((row) => {
    const qty = parseFloat(row.querySelector(".qty").value) || 0;
    const price = parseFloat(row.querySelector(".price").value) || 0;
    const lineTotal = qty * price;
    row.querySelector(".line-total").textContent = `${currency}${lineTotal.toFixed(2)}`;
    net += lineTotal;
  });

  const tax = (net * taxRate) / 100;
  const gross = net + tax;

  document.getElementById("net-total").textContent = `${currency}${net.toFixed(2)}`;
  document.getElementById("tax-total").textContent = `${currency}${tax.toFixed(2)}`;
  document.getElementById("total").textContent = `${currency}${gross.toFixed(2)}`;
}

function generatePreview() {
  updateTotals();

  const currency = document.getElementById("currency").value;
  const invoiceNum = document.getElementById("invoice-number").value || "";
  const invoiceDateRaw = document.getElementById("invoice-date").value || "";
  const client = document.getElementById("client-name").value || "";
  const notes = document.getElementById("invoice-notes").value || "";

  const net = document.getElementById("net-total").textContent;
  const tax = document.getElementById("tax-total").textContent;
  const total = document.getElementById("total").textContent;

  const companyName = document.getElementById("company-name").value || "";
  const companyEmail = document.getElementById("company-email").value || "";
  const companyPhone = document.getElementById("company-phone").value || "";

  let invoiceDate = "";
  if (invoiceDateRaw) {
    const d = new Date(invoiceDateRaw);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    invoiceDate = `${day}/${month}/${year}`;
  }

  const style = `
    <style>
      .invoice-container {
        background: #fff;
        width: 210mm;
        margin: 2rem auto;
        padding: 0px;
        font-family: Arial, sans-serif;
        color: #000;
        box-sizing: border-box;
      }
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
        gap: 20px;
        flex-wrap: nowrap;
      }
      .invoice-left {
        max-width: 60%;
      }
      .invoice-left img {
        max-height: 100px;
        margin-bottom: 10px;
        display: block;
      }
      .company-name {
        font-weight: bold;
        font-size: 1.25em;
        margin-bottom: 6px;
      }
      .company-contact {
        font-size: 0.95em;
        color: #333;
        margin-bottom: 20px;
        line-height: 1.3;
      }
      .invoice-notes {
        font-size: 0.9em;
        color: #555;
        white-space: pre-wrap;
      }
      .invoice-right {
        max-width: 35%;
        text-align: right;
        font-size: 0.95em;
      }
      .invoice-right div {
        margin-bottom: 6px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      thead {
        background: #EFB301;
      }
      th, td {
        border: 1px solid #000;
        padding: 10px;
      }
      th {
        text-align: left;
      }
      td:nth-child(2), td:nth-child(3), td:nth-child(4) {
        text-align: right;
      }
      td:nth-child(2) {
        text-align: center;
      }
      .totals {
        font-weight: bold;
        text-align: right;
        margin-top: 20px;
        font-size: 1.1em;
      }
        @media (max-width: 768px) {
  .invoice-container {
    width: 100%;
    padding: 20px;
    margin: 1rem;
    border-radius: 0;
  }

  #preview {
    width: 100%;
    padding: 10px;
  }

  .invoice-info {
    flex-direction: column;
    gap: 10px;
  }

  .email-phone-row {
    flex-direction: column;
    gap: 6px;
  }

  .primary-btn,
  .remove-btn {
    width: 100%;
    margin: 5px 0;
  }

  table, thead, tbody, th, td, tr {
    display: block;
  }

  thead {
    display: none;
  }

  tr {
    margin-bottom: 15px;
    border-bottom: 2px solid #ccc;
  }

  td {
    text-align: right;
    position: relative;
  }

  td::before {
    content: attr(data-label);
    position: absolute;
    left: 10px;
    width: 45%;
    padding-right: 10px;
    font-weight: bold;
    text-align: left;
  }

  .invoice-info label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
  flex: 1 1 50px;
}
}
    </style>
  `;

  let html = `
    ${style}
    <div class="invoice-container">
      <div class="invoice-header">
        <div class="invoice-left">
          ${logoDataURL ? `<img src="${logoDataURL}" alt="Logo" />` : ""}
          <div class="company-name">${companyName}</div>
          <div class="company-contact">
            <div>${companyEmail}</div>
            <div>${companyPhone}</div>
          </div>
          ${notes.trim() ? `<div class="invoice-notes">${notes.replace(/\n/g, "<br>")}</div>` : ""}
        </div>
        <div class="invoice-right">
          <div><strong>Invoice #:</strong> ${invoiceNum}</div>
          <div><strong>Date:</strong> ${invoiceDate}</div>
          <div><strong>Client:</strong> ${client}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  document.querySelectorAll("#invoice-body tr").forEach((row) => {
    const desc = row.querySelector(".desc").value || "-";
    const qty = row.querySelector(".qty").value || "0";
    const priceRaw = parseFloat(row.querySelector(".price").value) || 0;
    const price = priceRaw.toFixed(2);
    const lineTotal = (qty * priceRaw).toFixed(2);
    html += `
      <tr>
        <td>${desc}</td>
        <td>${qty}</td>
        <td>${currency}${price}</td>
        <td>${currency}${lineTotal}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
      <div class="totals">
        <div>Net Total: ${net}</div>
        <div>Tax: ${tax}</div>
        <div>Gross Total: ${total}</div>
      </div>
    </div>
    <div class="invoice-footer" style="text-align: center; font-size: 0.85em; color: #666; padding-top: 30px; border-top: 1px solid #ddd;">
      Invoice generated at <strong>TaskNectar.com</strong>
    </div>
  `;

  const previewContainer = document.getElementById("preview");
  previewContainer.innerHTML = "";
  previewContainer.innerHTML = html;
}

function downloadPDF() {
  generatePreview();

  requestAnimationFrame(() => {
    setTimeout(() => {
      const element = document.getElementById("preview");

      if (!element || element.innerHTML.trim() === "") {
        alert("The preview is not ready yet. Please try again.");
        return;
      }

      window.scrollTo(0, 0);

      const opt = {
        margin: 0,
        filename: `invoice_${document.getElementById("invoice-number").value || "preview"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollY: 0
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait"
        },
        pagebreak: {
          mode: ['avoid-all']
        }
      };

      html2pdf().set(opt).from(element).save();
    }, 100);
  });
}

// Event listeners
document.getElementById("generate").addEventListener("click", generatePreview);
document.getElementById("download").addEventListener("click", downloadPDF);

document.getElementById("add-row").addEventListener("click", () => {
  const tbody = document.getElementById("invoice-body");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td><input type="text" class="desc" placeholder="Item description" /></td>
    <td><input type="number" class="qty" value="1" min="1" /></td>
    <td><input type="number" class="price" value="0.00" step="0.01" /></td>
    <td class="line-total">£0.00</td>
    <td><button class="remove-btn">✕</button></td>
  `;
  tbody.appendChild(newRow);
  updateTotals();
});

document.getElementById("invoice-body").addEventListener("input", updateTotals);
document.getElementById("invoice-body").addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    e.target.closest("tr").remove();
    updateTotals();
  }
});

document.getElementById("currency").addEventListener("change", updateTotals);
document.getElementById("tax-rate").addEventListener("input", updateTotals);

// Handle logo upload
document.getElementById("logo-upload").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    logoDataURL = e.target.result;
    updateTotals();
    document.getElementById("remove-logo").style.display = "inline-block"; // Show remove button
  };
  reader.readAsDataURL(file);
});

// Remove logo
document.getElementById("remove-logo").addEventListener("click", () => {
  logoDataURL = null;
  document.getElementById("logo-upload").value = "";
  updateTotals();
  document.getElementById("preview").innerHTML = "";
  document.getElementById("remove-logo").style.display = "none"; // Hide remove button
});

// Initial total
updateTotals();
// END INVOICE GENERATOR
