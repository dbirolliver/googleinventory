
import React from 'react';
import QRCode from 'react-qr-code';
import type { InventoryItem } from '../types';

interface QRCodeModalProps {
  product: InventoryItem;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ product, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800/50 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-8 m-4 max-w-sm w-full text-center"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
        <p className="text-gray-400 mb-6">Product ID: {product.id}</p>
        <div className="bg-white p-4 rounded-lg inline-block">
          <QRCode
            value={JSON.stringify({ productId: product.id, productName: product.name })}
            size={256}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="L"
          />
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-white/10 text-white font-bold py-3 px-6 rounded-lg border border-white/30 hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;