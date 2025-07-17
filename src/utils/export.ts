import { Sale, Product } from '../types';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportSalesToCSV = (sales: Sale[]) => {
  const exportData = sales.map(sale => ({
    Date: new Date(sale.date).toLocaleDateString(),
    Product: sale.product_name,
    Quantity: sale.quantity,
    Amount: `$${sale.amount.toFixed(2)}`,
    'Payment Method': sale.payment_method,
    Employee: sale.employee_name
  }));

  exportToCSV(exportData, `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportProductsToCSV = (products: Product[]) => {
  const exportData = products.map(product => ({
    Name: product.name,
    Category: product.category,
    'Stock Quantity': product.stock_qty,
    'Cost Price': `$${product.cost_price.toFixed(2)}`,
    'Selling Price': `$${product.selling_price.toFixed(2)}`,
    Status: product.stock_qty === 0 ? 'Out of Stock' : 
             product.stock_qty < 5 ? 'Low Stock' : 'In Stock'
  }));

  exportToCSV(exportData, `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
};