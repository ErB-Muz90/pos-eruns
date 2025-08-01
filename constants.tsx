

import { Product, Customer, Supplier, PurchaseOrder, SupplierInvoice, User, Settings, AuditLog, Permission, Role, Quotation, BusinessType } from './types';

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust001', name: 'Walk-in Customer', phone: 'N/A', email: 'walkin@kenpos.co.ke', address: 'N/A', city: 'N/A', dateAdded: new Date('2023-01-01'), loyaltyPoints: 0 },
];

export const MOCK_USERS: User[] = [];

export const MOCK_SUPPLIERS: Supplier[] = [];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];

export const MOCK_SUPPLIER_INVOICES: SupplierInvoice[] = [];

export const MOCK_QUOTATIONS: Quotation[] = [];

export const MOCK_AUDIT_LOGS: AuditLog[] = [];

export const DEFAULT_SETTINGS: Settings = {
    isSetupComplete: false,
    businessType: 'GeneralRetail',
    businessInfo: {
        name: 'My Biashara Ltd.',
        kraPin: 'P000000000X',
        logoUrl: '',
        location: 'Biashara Street, Nairobi',
        phone: '0712 345 678',
        currency: 'KES',
        language: 'en-US',
    },
    tax: {
        vatEnabled: true,
        vatRate: 16,
        pricingType: 'inclusive',
    },
    discount: {
        enabled: true,
        type: 'percentage',
        maxValue: 10,
    },
    communication: {
        sms: {
            provider: 'none',
            username: 'sandbox',
            apiKey: '',
            senderId: '',
            useSandbox: true,
        },
        email: {
            mailer: 'smtp',
            host: 'smtp.mailtrap.io',
            port: 587,
            username: '',
            password: '',
            encryption: 'tls',
            fromAddress: 'sales@kenpos.co.ke',
            fromName: 'KenPOS Sales',
        },
        whatsapp: {
            provider: 'none',
            apiKey: '',
            apiSecret: '',
            senderPhoneNumber: '',
        },
        mpesa: {
            enabled: false,
            environment: 'sandbox',
            shortcode: '',
            consumerKey: '',
            consumerSecret: '',
            passkey: '',
            callbackUrl: '',
        }
    },
    receipt: {
        footer: 'Thank you for your business!',
        showQrCode: true,
        invoicePrefix: 'INV-',
        quotePrefix: 'QUO-',
    },
    hardware: {
        printer: {
            type: 'Browser',
            connection: 'USB',
            name: '',
            address: '',
        },
        barcodeScanner: {
            enabled: true,
        },
        barcodePrinter: {
            enabled: false,
            type: 'Image',
            connection: 'USB',
            name: '',
        },
    },
    loyalty: {
        enabled: true,
        pointsPerKsh: 100,
        redemptionRate: 0.5, // 1 point = 0.5 KES
        minRedeemablePoints: 100,
        maxRedemptionPercentage: 50,
    },
    permissions: {
        Admin: ['view_dashboard', 'view_pos', 'view_inventory', 'edit_inventory', 'delete_inventory', 'view_purchases', 'manage_purchases', 'view_ap', 'manage_ap', 'view_tax_reports', 'view_shift_report', 'view_customers', 'manage_customers', 'view_settings', 'view_quotations', 'manage_quotations'],
        Cashier: ['view_pos', 'view_shift_report', 'view_customers'],
        Supervisor: ['view_dashboard', 'view_pos', 'view_inventory', 'edit_inventory', 'view_purchases', 'view_shift_report', 'view_customers', 'manage_customers', 'view_quotations', 'manage_quotations'],
        Accountant: ['view_dashboard', 'view_purchases', 'manage_purchases', 'view_ap', 'manage_ap', 'view_tax_reports', 'view_customers'],
    }
};

export const BUSINESS_TYPES_CONFIG: { [key in BusinessType]: { name: string; description: string; icon: React.ReactNode; } } = {
    GeneralRetail: {
        name: 'General Retail',
        description: 'For kiosks, shops, boutiques, hardware stores, or any business selling physical items.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    },
    Restaurant: {
        name: 'Restaurant / Cafe',
        description: 'For food businesses like restaurants, cafes, pizza shops, and fast-food joints.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    Salon: {
        name: 'Salon / Spa',
        description: 'For service businesses like hair salons, barber shops, nail bars, and spas.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a1 1 0 01-1.414 0L9 12m0 0l2.879-2.879a1 1 0 011.414 0L15 11" /></svg>,
    },
    Services: {
        name: 'Professional Services',
        description: 'For project-based work like tailors, interior designers, consultants, and agencies.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    }
};

export const PERMISSIONS_CONFIG: { module: string; permissions: { id: Permission; label: string }[] }[] = [
    {
        module: "General",
        permissions: [
            { id: "view_pos", label: "Access POS Screen" },
            { id: "view_dashboard", label: "View Dashboard" },
            { id: "view_shift_report", label: "View Shift Reports" },
        ],
    },
    {
        module: "Inventory & Products",
        permissions: [
            { id: "view_inventory", label: "View Inventory" },
            { id: "edit_inventory", label: "Edit Products" },
            { id: "delete_inventory", label: "Delete Products" },
        ],
    },
    {
        module: "Financial",
        permissions: [
            { id: "view_purchases", label: "View Purchases" },
            { id: "manage_purchases", label: "Manage Purchases (Receive)" },
            { id: "view_ap", label: "View Accounts Payable" },
            { id: "manage_ap", label: "Manage Accounts Payable (Pay)" },
            { id: "view_tax_reports", label: "View Tax Reports" },
        ],
    },
     {
        module: "Sales",
        permissions: [
            { id: "view_quotations", label: "View Quotations" },
            { id: "manage_quotations", label: "Create/Edit Quotations" },
        ],
    },
    {
        module: "Customers",
        permissions: [
            { id: "view_customers", label: "View Customers" },
            { id: "manage_customers", label: "Manage Customers" },
        ],
    },
    {
        module: "Administration",
        permissions: [
            { id: "view_settings", label: "Access System Settings" },
        ],
    },
];


export const ICONS = {
  pos: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  inventory: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  purchases: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  ap: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  tax: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18m-4.5-9a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm9 9a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" /></svg>,
  shiftReport: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  customers: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  quotations: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  hardware: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-14a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  bell: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  
  // Settings Icons
  business: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h5m-5 4h5" /></svg>,
  receipt: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  discount: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
  loyalty: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  users: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1.5a2.5 2.5 0 00-5 0V21" /></svg>,
  email: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  sms: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  whatsapp: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004l-1.03 3.766l3.847-1.026z"/></svg>,
  mpesa: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 250 250"><path fill="#FFF" d="M0 0h250v250H0z"/><path fill="#67b32e" d="M125 40c-46.939 0-85 38.061-85 85s38.061 85 85 85 85-38.061 85-85-38.061-85-85-85zm-.01 150.01c-35.898 0-65.01-29.112-65.01-65.01s29.112-65.01 65.01-65.01 65.01 29.112 65.01 65.01-29.112 65.01-65.01 65.01z"/><path fill="#67b32e" d="M101.07 110.13c-.875-.312-1.792-.543-2.739-.688l-1.427-.229c-1.396-.219-2.583-.406-3.563-.562-1.938-.302-3.802-.688-5.594-1.156-2.5- D .667-4.625-1.5-6.385-2.5-2.073-1.198-3.792-2.865-5.156-4.99-1.365-2.125-2.052-4.667-2.052-7.625 0-3.135.802-5.896 2.406-8.281 1.604-2.385 3.865-4.229 6.781-5.531 2.917-1.302 6.292-1.958 10.125-1.958 4.74 0 8.781 1.01 12.125 3.031 3.344 2.021 5.865 4.865 7.573 8.531l-10.813 5.438c-.375-.823-.781-1.5-1.219-2.031-.438-.531-1.021-.958-1.75-1.281-.729-.323-1.635-.489-2.719-.489-1.281 0-2.365.312-3.25.938-.885.625-1.323 1.552-1.323 2.781 0 .99.302 1.812.906 2.469.604.656 1.458 1.146 2.563 1.469.948.271 1.875.5 2.781.688l1.438.219c1.375.219 2.552.406 3.531.562 1.958.312 3.823.688 5.615 1.156 2.5.667 4.625 1.5 6.385 2.5 2.073 1.198 3.792 2.865 5.156 4.99 1.365 2.125 2.052 4.667 2.052 7.625 0 3.125-.802 5.896-2.406 8.281-1.604 2.385-3.865 4.229-6.781 5.531-2.917 1.302-6.292 1.958-10.125 1.958-4.729 0-8.771-1.01-12.115-3.031-3.344-2.021-5.865-4.865-7.573-8.531l10.813-5.438c.375.823.781 1.5 1.219 2.031.438.531 1.021.958 1.75 1.281.729.323 1.635.489 2.719-.489 1.281 0 2.365-.312 3.25-.938.885-.625 1.323-1.552 1.323-2.781 0-.99-.302-1.812-.906-2.469-.604-.656-1.469-1.146-2.573-1.469z"/><path fill="#67b32e" d="M140.28 77.292h14.229v18.781c1.688-1.906 3.354-3.417 5.01-4.531 1.656-1.115 3.365-1.677 5.125-1.677 1.313 0 2.51.24 3.594.719.927.479 1.708 1.104 2.344 1.885.635.781 1.104 1.688 1.406 2.719.302 1.031.458 2.146.458 3.344v27.021h-14.229v-25.135c0-2.312-.531-4.042-1.594-5.188-.958-1.146-2.312-1.719-4.062-1.719-1.396 0-2.75.438-4.062 1.313-1.313.875-2.448 2.073-3.406 3.604-1.083 1.531-1.625 3.323-1.625 5.375v21.75h-14.229V77.292z"/></svg>,
  audit: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.611-5.611A12.035 12.035 0 0112 12c1.785 0 3.472.464 4.882 1.255L21 12.417c0-2.39-1.02-4.6-2.618-6.084z" /></svg>,
  data: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
  reset: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0119.5 19.5M20 20l-1.5-1.5A9 9 0 004.5 4.5" /></svg>,
};