document.addEventListener('DOMContentLoaded', () => {
    const billingTableBody = document.getElementById('billing-rows');
    const addRowBtn = document.getElementById('add-row-btn');
    const totalHtSpan = document.getElementById('total-ht');
    const tvaSpan = document.getElementById('tva');
    const totalTtcSpan = document.getElementById('total-ttc');

    function addRow(data = { designation: '', quantity: 1, unitPrice: 0 }) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="designation" value="${data.designation}" placeholder="Ex. Vérification extincteur"></td>
            <td><input type="number" class="quantity" value="${data.quantity}" min="1"></td>
            <td><input type="number" class="unit-price" value="${data.unitPrice}" min="0" step="0.01"></td>
            <td class="total-price">0.00</td>
            <td><button class="remove-row-btn btn">🗑️</button></td>
        `;
        billingTableBody.appendChild(row);
        attachRowListeners(row);
        updateTotals();
    }

    function removeRow(e) {
        e.target.closest('tr').remove();
        updateTotals();
    }

    function updateTotals() {
        let totalHt = 0;
        const rows = billingTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
            const unitPrice = parseFloat(row.querySelector('.unit-price').value) || 0;
            const totalPrice = quantity * unitPrice;
            row.querySelector('.total-price').textContent = totalPrice.toFixed(2);
            totalHt += totalPrice;
        });
        const tva = totalHt * 0.2;
        const totalTtc = totalHt + tva;
        totalHtSpan.textContent = totalHt.toFixed(2);
        tvaSpan.textContent = tva.toFixed(2);
        totalTtcSpan.textContent = totalTtc.toFixed(2);
    }

    function attachRowListeners(row) {
        row.querySelectorAll('input').forEach(input => input.addEventListener('input', updateTotals));
        row.querySelector('.remove-row-btn').addEventListener('click', removeRow);
    }

    addRowBtn.addEventListener('click', () => addRow());
    addRow();

    document.getElementById('save-draft-btn').addEventListener('click', () => {
        const rows = document.querySelectorAll('#billing-rows tr');
        const data = Array.from(rows).map(row => ({
            designation: row.querySelector('.designation').value,
            quantity: parseFloat(row.querySelector('.quantity').value),
            unitPrice: parseFloat(row.querySelector('.unit-price').value)
        }));
        localStorage.setItem('brouillon_billing', JSON.stringify(data));
    });

    const draftData = JSON.parse(localStorage.getItem('brouillon_billing') || '[]');
    draftData.forEach(item => addRow(item));

    document.getElementById('generate-pdf-btn').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.autoTable({
            html: '#billing-table',
            theme: 'striped',
            styles: { fontSize: 10 },
            margin: { top: 20 }
        });
        doc.save('bon_intervention.pdf');
    });
});
