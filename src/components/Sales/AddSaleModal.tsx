import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { Product, Sale, User } from '../../types';

interface AddSaleModalProps {
  onClose: () => void;
  onSave: (sale: Omit<Sale, 'id' | 'created_at'>) => void;
  products: Product[];
  currentUser: User;
}

const AddSaleModal: React.FC<AddSaleModalProps> = ({ onClose, onSave, products, currentUser }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const totalAmount = selectedProduct.selling_price * quantity;
    
    const saleData: Omit<Sale, 'id' | 'created_at'> = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity,
      amount: totalAmount,
      date: new Date().toISOString(),
      employee_id: currentUser.id,
      employee_name: currentUser.name
    };

    onSave(saleData);
  };

  const isValidQuantity = selectedProduct ? quantity <= selectedProduct.stock_qty : false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ShoppingCart className="w-6 h-6 text-pink-600 mr-2" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              onChange={(e) => handleProductSelect(e.target.value)}
            >
              <option value="">Select a product</option>
              {products.filter(p => p.stock_qty > 0).map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.selling_price} (Stock: {product.stock_qty})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-pink-50 p-4 rounded-lg">
              <h3 className="font-medium text-pink-900">{selectedProduct.name}</h3>
              <p className="text-sm text-pink-700">
                Price: ${selectedProduct.selling_price} | Available: {selectedProduct.stock_qty} units
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
              max={selectedProduct?.stock_qty || 1}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
            {selectedProduct && quantity > selectedProduct.stock_qty && (
              <p className="text-red-600 text-sm mt-1">
                Quantity exceeds available stock ({selectedProduct.stock_qty})
              </p>
            )}
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-pink-600">
                  ${(selectedProduct.selling_price * quantity).toFixed(2)}
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
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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