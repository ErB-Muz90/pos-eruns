import React, { useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Product, Permission } from '../types';
import ProductModal from './inventory/ProductModal';

interface InventoryViewProps {
    products: Product[];
    onAddProduct: (product: Omit<Product, 'id' | 'stock'>) => Product;
    onUpdateProduct: (product: Product) => void;
    onDeleteProductRequest: (product: Product) => void;
    permissions: Permission[];
    onImportProducts: (products: Omit<Product, 'id' | 'stock'>[]) => void;
}

const InventoryView = ({ products, onAddProduct, onUpdateProduct, onDeleteProductRequest, permissions, onImportProducts }: InventoryViewProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const importInputRef = useRef<HTMLInputElement>(null);

    const canEdit = permissions.includes('edit_inventory');
    const canDelete = permissions.includes('delete_inventory');

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);
    
    const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

    const handleNewClick = () => {
        setEditingProduct(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    const handleSaveProduct = (productData: Product | Omit<Product, 'id' | 'stock'>) => {
        if ('id' in productData) {
            onUpdateProduct(productData as Product);
        } else {
            onAddProduct(productData as Omit<Product, 'id' | 'stock'>);
        }
        setIsModalOpen(false);
        setEditingProduct(undefined);
    };

    const exportToCSV = () => {
        if (products.length === 0) {
            alert("No products to export.");
            return;
        }
        const headers = ['sku', 'name', 'category', 'price', 'costPrice', 'pricingType', 'productType', 'unitOfMeasure', 'description', 'imageUrl'];
        const csvRows = [
            headers.join(','),
            ...products.map(p => {
                const row = [
                    p.sku,
                    `"${p.name.replace(/"/g, '""')}"`, // Handle quotes in name
                    `"${p.category.replace(/"/g, '""')}"`,
                    p.price,
                    p.costPrice || 0,
                    p.pricingType,
                    p.productType,
                    p.unitOfMeasure,
                    `"${(p.description || '').replace(/"/g, '""')}"`,
                    p.imageUrl,
                ];
                return row.join(',');
            })
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "kenpos_inventory_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) throw new Error("CSV file must have a header and at least one data row.");
                
                const headerLine = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
                const requiredHeaders = ['sku', 'name', 'price', 'category'];
                for (const h of requiredHeaders) {
                    if (!headerLine.includes(h)) throw new Error(`Missing required header column: ${h}`);
                }

                const importedProducts: Omit<Product, 'id' | 'stock'>[] = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const productData: any = {};
                    headerLine.forEach((header, index) => {
                         // A simple way to remove quotes if they exist at the start/end
                        const value = values[index]?.trim().replace(/^"|"$/g, '');
                        productData[header] = value;
                    });
                    
                    const price = parseFloat(productData.price);
                    if (isNaN(price)) throw new Error(`Invalid price for SKU ${productData.sku}`);

                    return {
                        sku: productData.sku,
                        name: productData.name,
                        category: productData.category,
                        price: price,
                        costPrice: parseFloat(productData.costprice) || 0,
                        pricingType: ['inclusive', 'exclusive'].includes(productData.pricingtype) ? productData.pricingtype : 'exclusive',
                        productType: ['Inventory', 'Service'].includes(productData.producttype) ? productData.producttype : 'Inventory',
                        unitOfMeasure: productData.unitofmeasure || 'pc(s)',
                        description: productData.description || '',
                        imageUrl: productData.imageurl || '',
                    };
                });
                onImportProducts(importedProducts);
            } catch (error: any) {
                alert(`Error importing CSV: ${error.message}`);
            } finally {
                if (event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
                {canEdit && (
                    <div className="flex items-center space-x-2">
                        <input type="file" ref={importInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />
                        <motion.button 
                            onClick={() => importInputRef.current?.click()}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-slate-700 border border-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors shadow-sm flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Import
                        </motion.button>
                         <motion.button 
                            onClick={exportToCSV}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-slate-700 border border-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors shadow-sm flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export
                        </motion.button>
                         <motion.button 
                            onClick={handleNewClick}
                            whileTap={{ scale: 0.95 }}
                            className="bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            New Product
                        </motion.button>
                    </div>
                )}
            </div>
            <div className="mb-4">
                 <input
                    type="text"
                    placeholder="Search inventory by name or SKU..."
                    className="w-full max-w-sm px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Product Name</th>
                            <th scope="col" className="px-6 py-3">SKU</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Price (Ksh)</th>
                            <th scope="col" className="px-6 py-3">Cost (Ksh)</th>
                            <th scope="col" className="px-6 py-3">Stock</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="bg-white border-b hover:bg-slate-50">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center space-x-3">
                                    <img src={product.imageUrl || `https://placehold.co/100x100/e2e8f0/475569?text=${product.name.charAt(0)}`} alt={product.name} className="w-10 h-10 rounded-md object-cover"/>
                                    <span>{product.name}</span>
                                </th>
                                <td className="px-6 py-4 font-mono text-xs">{product.sku}</td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4 font-mono">{product.price.toFixed(2)} / {product.unitOfMeasure}</td>
                                <td className="px-6 py-4 font-mono">{product.costPrice?.toFixed(2) || '0.00'}</td>
                                <td className="px-6 py-4 font-bold">{product.stock}</td>
                                <td className="px-6 py-4">
                                    {product.stock > 20 ? (
                                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">In Stock</span>
                                    ) : product.stock > 0 ? (
                                        <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Low Stock</span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Out of Stock</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                     {canEdit && <button onClick={() => handleEditClick(product)} className="font-medium text-emerald-600 hover:underline">Edit</button>}
                                     {canDelete && <button onClick={() => onDeleteProductRequest(product)} className="font-medium text-red-600 hover:underline">Delete</button>}
                                </td>
                            </tr>
                        ))}
                         {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-10 text-slate-500">No products found. Add products via the "New Product" button.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <AnimatePresence>
                {isModalOpen && (
                    <ProductModal
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSaveProduct}
                        product={editingProduct}
                        categories={categories}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryView;