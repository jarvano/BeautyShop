import { Sale, SalesReport } from '../types';

export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => 
      JSON.stringify(row[header] || '')
    ).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const generateSalesReport = (sales: Sale[], startDate?: string, endDate?: string): SalesReport => {
  let filteredSales = sales;

  if (startDate && endDate) {
    filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });
  }

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalSales = filteredSales.length;

  const paymentBreakdown = filteredSales.reduce((breakdown, sale) => {
    breakdown[sale.paymentMethod] += sale.totalAmount;
    return breakdown;
  }, { cash: 0, card: 0, mobile: 0 });

  const productSales = filteredSales.reduce((products, sale) => {
    const existing = products.find(p => p.name === sale.productName);
    if (existing) {
      existing.quantity += sale.quantity;
      existing.revenue += sale.totalAmount;
    } else {
      products.push({
        name: sale.productName,
        quantity: sale.quantity,
        revenue: sale.totalAmount
      });
    }
    return products;
  }, [] as Array<{ name: string; quantity: number; revenue: number }>);

  const topProducts = productSales.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return {
    totalRevenue,
    totalItems,
    totalSales,
    paymentBreakdown,
    topProducts
  };
};