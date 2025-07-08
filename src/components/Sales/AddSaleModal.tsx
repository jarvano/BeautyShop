import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { Product, Sale, User } from '../../types';

interface AddSaleModalProps {
  onClose: () => void;
  onSave: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  products: Product[];
  currentUser: User;
}

const AddSaleModal: React.FC<AddSaleModalProps> = ({ onClose, onSave, products, currentUser }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const totalAmount = selectedProduct.sellingPrice * quantity;
    
    const saleData: Omit<Sale, 'id' | 'createdAt'> = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice: selectedProduct.sellingPrice,
      totalAmount,
      paymentMethod,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      date: new Date().toISOString()
    };

    onSave(saleData);
  };

  const isValidQuantity = selectedProduct ? quantity <= selectedProduct.stock : false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ShoppingCart className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Add New Sale</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onChange={(e) => handleProductSelect(e.target.value)}
            >
              <option value="">Select a product</option>
              {products.filter(p => p.stock > 0).map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.sellingPrice} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">{selectedProduct.name}</h3>
              <p className="text-sm text-purple-700">
                Price: ${selectedProduct.sellingPrice} | Available: {selectedProduct.stock} units
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max={selectedProduct?.stock || 1}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
            {selectedProduct && quantity > selectedProduct.stock && (
              <p className="text-red-600 text-sm mt-1">
                Quantity exceeds available stock ({selectedProduct.stock})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'mobile')}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile Payment</option>
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-purple-600">
                  ${(selectedProduct.sellingPrice * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedProduct || !isValidQuantity}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSaleModal;