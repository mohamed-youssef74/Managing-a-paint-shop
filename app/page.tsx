'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  Boxes,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  LayoutDashboard,
  Menu,
  PackagePlus,
  Palette,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShoppingCart,
  TrendingUp,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'

type Product = { name: string; code: string; category: string; stock: number; price: number; cost: number; color: string }
type SaleItem = { code: string; product: string; quantity: number; unitPrice: number; total: number; unitCost: number }
type Sale = { id: string; customer: string; items: SaleItem[]; subtotal: number; discount: number; total: number; paid: number; remaining: number; payment: 'نقدي' | 'آجل'; notes: string; date: string }
type Expense = { id: string; title: string; amount: number; date: string; note: string }
type Supplier = { id: string; name: string; phone: string; balance: number }
type PurchaseItem = { code: string; product: string; category: string; quantity: number; cost: number; salePrice: number }

const productCategories = ['الدهانات', 'ذياتي', 'سيلر', 'موكا', 'ديكو', 'ديكورات', 'غيراء', 'الوان عاديه', 'الوان كمبيوتر', 'ورنيش', 'بليستر', 'ديكو فرن', 'وربيش فرن', 'تنر فرن', 'تنر الصاروخين', 'فيلر', 'النجار', 'لزق انواع', 'أدوات ( العده)', 'ادوات ( الكهرباء)', 'ادوات ( الديش)', 'ادوات (الفلاحه)', 'ادوات ( الغاز)']
type Purchase = { id: string; supplier: string; items: PurchaseItem[]; total: number; paid: number; date: string }
type SupplierPayment = { id: string; supplier: string; amount: number; date: string; note: string }
type StockMovement = { id: string; code: string; product: string; quantity: number; type: 'بيع' | 'شراء' | 'تعديل'; reason: string; date: string }
type AuditLog = { id: string; action: string; target: string; date: string }
type Customer = { name: string; phone: string; balance: number; lastActivity: string; kind?: 'عميل' | 'صنايعي' }
type CustomerPayment = { id: string; customer: string; amount: number; date: string; note: string; type: 'دفعة' | 'سُلفة' }

const initialProducts: Product[] = []

const navItems = [
  { label: 'الرئيسية', icon: LayoutDashboard },
  { label: 'المبيعات والفواتير', icon: ReceiptText },
  { label: 'المخزون والمنتجات', icon: Boxes },
  { label: 'العملاء', icon: UserRound },
  { label: 'التقارير', icon: TrendingUp },
  { label: 'الموردين والمشتريات', icon: ClipboardList },
]

export default function Page() {
  const [active, setActive] = useState('الرئيسية')
  const [products, setProducts] = useState(initialProducts)
  const [sales, setSales] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [showCustomer, setShowCustomer] = useState(false)
  const [showBackup, setShowBackup] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', kind: 'عميل' as 'عميل' | 'صنايعي' })
  const [customerPayment, setCustomerPayment] = useState({ amount: '', note: '', type: 'دفعة' as 'دفعة' | 'سُلفة' })
  const [showAdd, setShowAdd] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editProductForm, setEditProductForm] = useState({ name: '', stock: '', cost: '', price: '' })
  const [showSale, setShowSale] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [paymentSale, setPaymentSale] = useState<Sale | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [newSale, setNewSale] = useState({ category: '', product: '', customer: '', quantity: '1', payment: 'نقدي' as 'نقدي' | 'آجل', paid: '', discount: '0', notes: '' })
  const [saleProductSearch, setSaleProductSearch] = useState('')
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const saleSubtotal = saleItems.reduce((sum, item) => sum + item.total, 0)
  const saleDiscount = Math.min(Number(newSale.discount) || 0, saleSubtotal)
  const saleTotal = saleSubtotal - saleDiscount
  const [search, setSearch] = useState('')
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [supplierSearch, setSupplierSearch] = useState('')
  const [reportMonthOffset, setReportMonthOffset] = useState(0)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    }
  }, [])
  const [notice, setNotice] = useState('')
  const [newProduct, setNewProduct] = useState({ name: '', code: '', category: productCategories[0], stock: '', price: '', cost: '' })
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', note: '' })
  const [showSupplier, setShowSupplier] = useState(false)
  const [showPurchase, setShowPurchase] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [supplierReport, setSupplierReport] = useState<Supplier | null>(null)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '' })
  const [purchaseForm, setPurchaseForm] = useState({ supplier: '', category: '', product: '', quantity: '1', cost: '', salePrice: '', paid: '', note: '' })
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const purchaseTotal = purchaseItems.reduce((sum, item) => sum + item.quantity * item.cost, 0)
  const [supplierPayment, setSupplierPayment] = useState('')
  const backupInputRef = useRef<HTMLInputElement>(null)
  const hasLoadedProducts = useRef(false)
  const categoriesCount = new Set(products.map((product) => product.category)).size

  const filteredProducts = useMemo(() => products.filter((p) => p.name.includes(search) || p.code.toLowerCase().includes(search.toLowerCase())), [products, search])
  const saleCategoryProducts = products.filter((product) => !newSale.category || product.category === newSale.category)
  const saleSearchTerm = saleProductSearch.trim().toLocaleLowerCase('ar-EG')
  const filteredSaleProducts = saleCategoryProducts.filter((product) => `${product.name} ${product.code}`.toLocaleLowerCase('ar-EG').includes(saleSearchTerm))

  const purchaseCategoryProducts = products.filter((product) => !purchaseForm.category || product.category === purchaseForm.category)
  const lowStock = products.filter((p) => p.stock <= 5)
  const filteredCustomers = useMemo(() => customers.filter((customer) => `${customer.name} ${customer.phone}`.toLowerCase().includes(customerSearch.toLowerCase())), [customers, customerSearch])
  const filteredSuppliers = useMemo(() => suppliers.filter((supplier) => `${supplier.name} ${supplier.phone}`.toLowerCase().includes(supplierSearch.toLowerCase())), [suppliers, supplierSearch])

  useEffect(() => {
    const savedSales = window.localStorage.getItem('lonak-sales')
    if (savedSales) {
      try { setSales(JSON.parse(savedSales)) } catch { window.localStorage.removeItem('lonak-sales') }
    }
    const savedPayments = window.localStorage.getItem('lonak-customer-payments')
    if (savedPayments) {
      try { setCustomerPayments(JSON.parse(savedPayments)) } catch { window.localStorage.removeItem('lonak-customer-payments') }
    }
    const savedCustomers = window.localStorage.getItem('lonak-customers')
    if (savedCustomers) {
      try { setCustomers(JSON.parse(savedCustomers)) } catch { window.localStorage.removeItem('lonak-customers') }
    }
    const savedExpenses = window.localStorage.getItem('lonak-expenses')
    const savedMovements = window.localStorage.getItem('lonak-stock-movements')
    const savedAudit = window.localStorage.getItem('lonak-audit-logs')
    const savedSuppliers = window.localStorage.getItem('lonak-suppliers')
    const savedPurchases = window.localStorage.getItem('lonak-purchases')
    const savedSupplierPayments = window.localStorage.getItem('lonak-supplier-payments')
    if (savedSupplierPayments) try { setSupplierPayments(JSON.parse(savedSupplierPayments)) } catch {}
    if (savedSuppliers) try { setSuppliers(JSON.parse(savedSuppliers)) } catch {}
    if (savedPurchases) try { setPurchases(JSON.parse(savedPurchases)) } catch {}
    if (savedExpenses) try { setExpenses(JSON.parse(savedExpenses)) } catch {}
    if (savedMovements) try { setStockMovements(JSON.parse(savedMovements)) } catch {}
    if (savedAudit) try { setAuditLogs(JSON.parse(savedAudit)) } catch {}
    const saved = window.localStorage.getItem('lonak-products')
    if (saved) {
      try {
        setProducts(JSON.parse(saved))
      } catch {
        window.localStorage.removeItem('lonak-products')
      }
    }
    hasLoadedProducts.current = true
  }, [])

  useEffect(() => {
    if (hasLoadedProducts.current) {
      window.localStorage.setItem('lonak-products', JSON.stringify(products))
      window.localStorage.setItem('lonak-sales', JSON.stringify(sales))
      window.localStorage.setItem('lonak-customers', JSON.stringify(customers))
      window.localStorage.setItem('lonak-customer-payments', JSON.stringify(customerPayments))
      window.localStorage.setItem('lonak-expenses', JSON.stringify(expenses))
      window.localStorage.setItem('lonak-suppliers', JSON.stringify(suppliers))
      window.localStorage.setItem('lonak-purchases', JSON.stringify(purchases))
      window.localStorage.setItem('lonak-supplier-payments', JSON.stringify(supplierPayments))
      window.localStorage.setItem('lonak-stock-movements', JSON.stringify(stockMovements))
      window.localStorage.setItem('lonak-audit-logs', JSON.stringify(auditLogs))
    }
  }, [products, sales, customers, customerPayments, expenses, suppliers, purchases, supplierPayments, stockMovements, auditLogs])

  const todaySales = sales.filter((sale) => sale.date === new Date().toLocaleDateString('ar-EG'))
  const filteredSales = sales.filter((sale) => `${sale.id} ${sale.customer} ${sale.items.map((item) => item.product).join(' ')}`.toLowerCase().includes(invoiceSearch.toLowerCase()))
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const outstandingTotal = customers.reduce((sum, customer) => sum + customer.balance, 0)
  const costOfGoodsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity * item.unitCost, 0), 0)
  const grossProfit = sales.reduce((sum, sale) => sum + sale.total, 0) - costOfGoodsSold
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = grossProfit - totalExpenses
  const stockPurchased = stockMovements.filter((movement) => movement.type === 'شراء').reduce((sum, movement) => sum + movement.quantity, 0)
  const stockSold = stockMovements.filter((movement) => movement.type === 'بيع').reduce((sum, movement) => sum + movement.quantity, 0)
  const parseStoredDate = (value: string) => {
    const digits = value.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    const parts = digits.match(/\d+/g)
    if (!parts || parts.length < 3) return null
    const [day, month, year] = parts.map(Number)
    const date = new Date(year, month - 1, day)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const isInPeriod = (value: string, period: 'week' | 'month' | 'previousMonth' | 'twoMonthsAgo') => {
    const date = parseStoredDate(value)
    if (!date) return false
    const now = new Date()
    if (period === 'week') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      return date >= start && date <= now
    }
    const offset = period === 'month' ? 0 : period === 'previousMonth' ? 1 : 2
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const end = offset === 0 ? now : new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59)
    return date >= start && date <= end
  }
  const periodReport = (period: 'week' | 'month' | 'previousMonth' | 'twoMonthsAgo') => {
    const periodSales = sales.filter((sale) => isInPeriod(sale.date, period))
    const periodExpenses = expenses.filter((expense) => isInPeriod(expense.date, period))
    const salesTotal = periodSales.reduce((sum, sale) => sum + sale.total, 0)
    const costTotal = periodSales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity * item.unitCost, 0), 0)
    const expenseTotal = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    return { sales: periodSales, expenses: periodExpenses, salesTotal, costTotal, expenseTotal, net: salesTotal - costTotal - expenseTotal }
  }
  const weeklyReport = periodReport('week')
  const monthlyReport = periodReport('month')
  const selectedMonthlyReport = periodReport(reportMonthOffset === 0 ? 'month' : reportMonthOffset === 1 ? 'previousMonth' : 'twoMonthsAgo')

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), products, sales, customers, customerPayments, expenses, suppliers, purchases, supplierPayments, stockMovements, auditLogs }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `السيد سعد-نسخة-احتياطية-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function importBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result))
        if (!Array.isArray(backup.products) || !Array.isArray(backup.sales) || !Array.isArray(backup.customers)) throw new Error('invalid backup')
        if (!window.confirm('سيتم استبدال البيانات الحالية ببيانات النسخة الاحتياطية. هل تريد المتابعة؟')) return
        setProducts(backup.products)
        setSales(backup.sales)
        setCustomers(backup.customers)
        setCustomerPayments(Array.isArray(backup.customerPayments) ? backup.customerPayments : [])
        setExpenses(Array.isArray(backup.expenses) ? backup.expenses : [])
        setSuppliers(Array.isArray(backup.suppliers) ? backup.suppliers : [])
        setPurchases(Array.isArray(backup.purchases) ? backup.purchases : [])
        setSupplierPayments(Array.isArray(backup.supplierPayments) ? backup.supplierPayments : [])
        setStockMovements(Array.isArray(backup.stockMovements) ? backup.stockMovements : [])
        setAuditLogs(Array.isArray(backup.auditLogs) ? backup.auditLogs : [])
        setNotice('تمت استعادة البيانات بنجاح')
        setTimeout(() => setNotice(''), 2500)
      } catch {
        setNotice('ملف النسخة الاحتياطية غير صالح')
        setTimeout(() => setNotice(''), 2500)
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  function registerPayment(event: React.FormEvent) {
    event.preventDefault()
    if (!paymentSale) return
    const amount = Number(paymentAmount)
    if (!amount || amount <= 0 || amount > paymentSale.remaining) return
    const remaining = paymentSale.remaining - amount
    const date = new Date().toLocaleDateString('ar-EG')
    setSales(sales.map((sale) => sale.id === paymentSale.id ? { ...sale, paid: sale.paid + amount, remaining, payment: remaining > 0 ? 'آجل' : 'نقدي' } : sale))
    setCustomers(customers.map((customer) => customer.name === paymentSale.customer ? { ...customer, balance: Math.max(0, customer.balance - amount), lastActivity: date } : customer))
    setCustomerPayments([{ id: `PAY-${Date.now()}`, customer: paymentSale.customer, amount, date, note: `دفعة على الفاتورة ${paymentSale.id}`, type: 'دفعة' }, ...customerPayments])
    setPaymentSale(null)
    setPaymentAmount('')
    setNotice('تم تسجيل الدفعة وتحديث الحساب')
    setTimeout(() => setNotice(''), 2500)
  }

  function editSale(sale: Sale) {
    setEditingSale({ ...sale, items: sale.items.map((item) => ({ ...item })) })
  }

  function saveEditedSale(event: React.FormEvent) {
    event.preventDefault()
    if (!editingSale || !editingSale.items.length) return
    const subtotal = editingSale.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const discount = Math.min(Math.max(editingSale.discount, 0), subtotal)
    const total = subtotal - discount
    if (editingSale.paid < 0 || editingSale.paid > total || editingSale.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.unitPrice <= 0)) {
      setNotice('راجع الكميات والأسعار والمبلغ المدفوع')
      setTimeout(() => setNotice(''), 2500)
      return
    }
    const previousQuantities = editingSale.items.reduce<Record<string, number>>((all, item) => ({ ...all, [item.code]: (all[item.code] || 0) + item.quantity }), {})
    const original = sales.find((sale) => sale.id === editingSale.id)
    if (!original) return
    const oldQuantities = original.items.reduce<Record<string, number>>((all, item) => ({ ...all, [item.code]: (all[item.code] || 0) + item.quantity }), {})
    const remaining = total - editingSale.paid
    const updatedSale: Sale = { ...editingSale, customer: editingSale.customer.trim() || 'عميل نقدي', subtotal, discount, total, remaining, payment: remaining > 0 ? 'آجل' : 'نقدي' }
    setProducts(products.map((product) => ({ ...product, stock: product.stock + (oldQuantities[product.code] || 0) - (previousQuantities[product.code] || 0) })))
    const customerDelta = remaining - original.remaining
    setCustomers(customers.map((entry) => entry.name === updatedSale.customer ? { ...entry, balance: Math.max(0, entry.balance + customerDelta), lastActivity: new Date().toLocaleDateString('ar-EG') } : entry))
    setSales(sales.map((entry) => entry.id === updatedSale.id ? updatedSale : entry))
    setSelectedSale(updatedSale)
    setEditingSale(null)
    setAuditLogs([{ id: `LOG-${Date.now()}`, action: 'تعديل فاتورة بيع', target: updatedSale.id, date: new Date().toLocaleDateString('ar-EG') }, ...auditLogs])
    setNotice('تم تعديل الفاتورة وتحديث المخزون والحساب')
    setTimeout(() => setNotice(''), 2500)
  }

  function deleteSale(sale: Sale) {
    if (!window.confirm('هل تريد حذف الفاتورة؟ سيتم إعادة الكميات للمخزون.')) return
    const date = new Date().toLocaleDateString('ar-EG')
    setProducts(products.map((product) => { const item = sale.items.find((line) => line.code === product.code); return item ? { ...product, stock: product.stock + item.quantity } : product }))
    setCustomers(customers.map((customer) => customer.name === sale.customer ? { ...customer, balance: Math.max(0, customer.balance - sale.remaining), lastActivity: date } : customer))
    setSales(sales.filter((item) => item.id !== sale.id))
    setAuditLogs([{ id: `LOG-${Date.now()}`, action: 'حذف فاتورة بيع', target: sale.id, date }, ...auditLogs])
    setNotice('تم حذف الفاتورة وإرجاع الكميات وتحديث رصيد العميل')
    setTimeout(() => setNotice(''), 2500)
  }


  function handleSaleItemKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.keyCode === 229) return
    event.preventDefault()
    const exactProduct = saleCategoryProducts.find((product) => `${product.name} — ${product.code}` === saleProductSearch || product.name === saleProductSearch || product.code === saleProductSearch)
    const product = products.find((item) => item.code === newSale.product) || exactProduct || (filteredSaleProducts.length === 1 ? filteredSaleProducts[0] : undefined)
    if (product) addItemToSale(product.code)
    else setNotice('اختار منتجًا من القائمة المنسدلة أولًا')
  }

  function addItemToSale(productCode = newSale.product) {
    const product = products.find((item) => item.code === productCode)
    const quantity = Number(newSale.quantity)
    if (!product || quantity < 1 || quantity > product.stock) return
    const existing = saleItems.find((item) => item.code === product.code)
    const nextQuantity = (existing?.quantity || 0) + quantity
    if (nextQuantity > product.stock) return
    setSaleItems(existing ? saleItems.map((item) => item.code === product.code ? { ...item, quantity: nextQuantity, total: nextQuantity * item.unitPrice } : item) : [...saleItems, { code: product.code, product: product.name, quantity, unitPrice: product.price, unitCost: product.cost, total: quantity * product.price }])
    setNewSale({ ...newSale, product: '', quantity: '1' })
    setSaleProductSearch('')
  }

  function addSale(event: React.FormEvent) {
    event.preventDefault()
    const paid = newSale.payment === 'نقدي' ? saleTotal : Number(newSale.paid)
    const customerName = newSale.customer.trim() || 'عميل نقدي'
    const overpayment = paid - saleTotal
    if (!saleItems.length || paid < 0 || (overpayment > 0 && customerName === 'عميل نقدي') || (newSale.payment === 'آجل' && !newSale.customer.trim())) return
    const date = new Date().toLocaleDateString('ar-EG')
    const invoiceId = `INV-${Date.now()}`
    setProducts(products.map((product) => { const sold = saleItems.find((item) => item.code === product.code); return sold ? { ...product, stock: product.stock - sold.quantity } : product }))
    setStockMovements([...saleItems.map((item) => ({ id: `MOV-${Date.now()}-${item.code}`, code: item.code, product: item.product, quantity: item.quantity, type: 'بيع' as const, reason: `الفاتورة ${invoiceId}`, date })), ...stockMovements])
    setAuditLogs([{ id: `LOG-${Date.now()}`, action: 'إضافة فاتورة', target: invoiceId, date }, ...auditLogs])
    const invoicePaid = Math.min(paid, saleTotal)
    const invoiceRemaining = saleTotal - invoicePaid
    setSales([{ id: invoiceId, customer: customerName, items: saleItems, subtotal: saleSubtotal, discount: saleDiscount, total: saleTotal, paid: invoicePaid, remaining: invoiceRemaining, payment: invoiceRemaining > 0 ? 'آجل' : 'نقدي', notes: newSale.notes, date }, ...sales])
    if (newSale.payment === 'آجل') {
      const existing = customers.find((customer) => customer.name === customerName)
      const balanceDelta = saleTotal - paid
      setCustomers(existing ? customers.map((customer) => customer.name === customerName ? { ...customer, balance: Math.max(0, customer.balance + balanceDelta), lastActivity: date } : customer) : [...customers, { name: customerName, phone: '', balance: Math.max(0, balanceDelta), lastActivity: date }])
      if (existing && overpayment > 0) {
        setCustomerPayments([{ id: `PAY-${Date.now()}`, customer: customerName, amount: overpayment, date, note: `دفعة زائدة على الفاتورة ${invoiceId} لتقليل الرصيد السابق`, type: 'دفعة' }, ...customerPayments])
      }
    }
    setNewSale({ category: '', product: '', customer: '', quantity: '1', payment: 'نقدي', paid: '', discount: '0', notes: '' })
    setSaleItems([])
    setShowSale(false)
    setNotice('تم تسجيل الفاتورة وتحديث المخزون')
    setTimeout(() => setNotice(''), 2500)
  }

  function addCustomer(event: React.FormEvent) {
    event.preventDefault()
    const name = customerForm.name.trim()
    if (!name || customers.some((customer) => customer.name === name)) return
    const date = new Date().toLocaleDateString('ar-EG')
    setCustomers([...customers, { name, phone: customerForm.phone.trim(), balance: 0, lastActivity: date, kind: customerForm.kind }])
    setCustomerForm({ name: '', phone: '', kind: 'عميل' })
    setShowCustomer(false)
    setNotice('تمت إضافة الحساب بنجاح')
    setTimeout(() => setNotice(''), 2500)
  }

  function editCustomer(customer: Customer) {
    const name = window.prompt('اسم الحساب', customer.name)?.trim()
    if (!name || name === customer.name) return
    if (customers.some((item) => item.name === name)) return
    const phone = window.prompt('رقم الهاتف', customer.phone)?.trim() ?? customer.phone
    setCustomers(customers.map((item) => item.name === customer.name ? { ...item, name, phone } : item))
    setSales(sales.map((sale) => sale.customer === customer.name ? { ...sale, customer: name } : sale))
    setCustomerPayments(customerPayments.map((payment) => payment.customer === customer.name ? { ...payment, customer: name } : payment))
    setSelectedCustomer({ ...customer, name, phone })
    setNotice('تم تعديل بيانات الحساب')
    setTimeout(() => setNotice(''), 2500)
  }

  function deleteCustomer(customer: Customer) {
    if (customer.balance > 0) { setNotice('لا يمكن حذف حساب عليه رصيد متبقي'); setTimeout(() => setNotice(''), 2500); return }
    if (!window.confirm(`هل تريد حذف حساب ${customer.name}؟`)) return
    setCustomers(customers.filter((item) => item.name !== customer.name))
    setSelectedCustomer(null)
    setNotice('تم حذف الحساب')
    setTimeout(() => setNotice(''), 2500)
  }

  function editSupplier(supplier: Supplier) {
    const name = window.prompt('اسم المورد', supplier.name)?.trim()
    if (!name || name === supplier.name) return
    if (suppliers.some((item) => item.name === name)) return
    const phone = window.prompt('رقم الهاتف', supplier.phone)?.trim() ?? supplier.phone
    setSuppliers(suppliers.map((item) => item.id === supplier.id ? { ...item, name, phone } : item))
    setPurchases(purchases.map((purchase) => purchase.supplier === supplier.name ? { ...purchase, supplier: name } : purchase))
    setSupplierPayments(supplierPayments.map((payment) => payment.supplier === supplier.name ? { ...payment, supplier: name } : payment))
    setSupplierReport({ ...supplier, name, phone })
    setNotice('تم تعديل بيانات المورد')
    setTimeout(() => setNotice(''), 2500)
  }

  function deleteSupplier(supplier: Supplier) {
    if (supplier.balance > 0) { setNotice('لا يمكن حذف مورد عليه رصيد متبقي'); setTimeout(() => setNotice(''), 2500); return }
    if (!window.confirm(`هل تريد حذف المورد ${supplier.name}؟`)) return
    setSuppliers(suppliers.filter((item) => item.id !== supplier.id))
    setSupplierReport(null)
    setNotice('تم حذف المورد')
    setTimeout(() => setNotice(''), 2500)
  }

  function addCustomerPayment(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedCustomer) return
    const amount = Number(customerPayment.amount)
    if (!amount || amount <= 0) return
    const date = new Date().toLocaleDateString('ar-EG')
    const delta = customerPayment.type === 'سُلفة' ? amount : -amount
    setCustomers(customers.map((customer) => customer.name === selectedCustomer.name ? { ...customer, balance: Math.max(0, customer.balance + delta), lastActivity: date } : customer))
    if (customerPayment.type === 'دفعة') {
      let remainingPayment = amount
      const updatedSales = sales.map((sale) => {
        if (sale.customer !== selectedCustomer.name || sale.remaining <= 0 || remainingPayment <= 0) return sale
        const applied = Math.min(sale.remaining, remainingPayment)
        remainingPayment -= applied
        return { ...sale, paid: sale.paid + applied, remaining: sale.remaining - applied, payment: sale.remaining - applied > 0 ? 'آجل' : 'نقدي' as 'آجل' | 'نقدي' }
      })
      setSales(updatedSales)
    }
    setCustomerPayments([{ id: `PAY-${Date.now()}`, customer: selectedCustomer.name, amount, date, note: customerPayment.note, type: customerPayment.type }, ...customerPayments])
    setSelectedCustomer(null)
    setCustomerPayment({ amount: '', note: '', type: 'دفعة' })
    setNotice('تم تسجيل الحركة وتحديث الحساب')
    setTimeout(() => setNotice(''), 2500)
  }

  function printCustomerStatement(customer: Customer) {
    setSelectedCustomer(customer)
    setTimeout(() => window.print(), 100)
  }

  function addExpense(event: React.FormEvent) {
    event.preventDefault()
    const amount = Number(expenseForm.amount)
    if (!expenseForm.title.trim() || amount <= 0) return
    const date = new Date().toLocaleDateString('ar-EG')
    const expense = { id: `EXP-${Date.now()}`, title: expenseForm.title.trim(), amount, date, note: expenseForm.note.trim() }
    setExpenses([expense, ...expenses])
    setAuditLogs([{ id: `LOG-${Date.now()}`, action: 'إضافة مصروف', target: expense.title, date }, ...auditLogs])
    setExpenseForm({ title: '', amount: '', note: '' })
    setNotice('تم تسجيل المصروف')
    setTimeout(() => setNotice(''), 2500)
  }

  function addSupplier(event: React.FormEvent) {
    event.preventDefault()
    if (!supplierForm.name.trim()) return
    const supplier: Supplier = { id: `SUP-${Date.now()}`, name: supplierForm.name.trim(), phone: supplierForm.phone.trim(), balance: 0 }
    setSuppliers([supplier, ...suppliers])
    setSupplierForm({ name: '', phone: '' })
    setShowSupplier(false)
    setNotice('تمت إضافة المورد')
    setTimeout(() => setNotice(''), 2500)
  }

  function addPurchaseItem() {
    const enteredProduct = purchaseForm.product.trim()
    const normalizedProductName = enteredProduct.replace(/\s+/g, ' ').toLocaleLowerCase('ar-EG')
    const product = products.find((item) => item.name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ar-EG') === normalizedProductName || item.code.trim().toLocaleLowerCase('ar-EG') === enteredProduct.toLocaleLowerCase('ar-EG'))
    const quantity = Number(purchaseForm.quantity)
    const cost = Number(purchaseForm.cost)
    const salePrice = Number(purchaseForm.salePrice)
    if (!enteredProduct || quantity <= 0 || cost <= 0 || salePrice <= 0) { setNotice('أدخل المنتج والكمية والأسعار أولاً'); setTimeout(() => setNotice(''), 2500); return }
    const item: PurchaseItem = { code: product?.code ?? `PR-${Date.now().toString().slice(-6)}`, product: product?.name ?? enteredProduct, category: purchaseForm.category || product?.category || 'الدهانات', quantity, cost, salePrice }
    const existing = purchaseItems.find((line) => line.code === item.code)
    setPurchaseItems(existing ? purchaseItems.map((line) => line.code === item.code ? { ...line, quantity: line.quantity + quantity, cost, salePrice } : line) : [...purchaseItems, item])
    setPurchaseForm({ ...purchaseForm, product: '', quantity: '1', cost: '', salePrice: '' })
  }

  function addPurchase(event: React.FormEvent) {
    event.preventDefault()
    const supplier = suppliers.find((item) => item.id === purchaseForm.supplier)
    if (!supplier) { setNotice('اختر المورد أولاً'); setTimeout(() => setNotice(''), 2500); return }
    if (!purchaseItems.length) { setNotice('أضف منتجاً واحداً على الأقل للسلة'); setTimeout(() => setNotice(''), 2500); return }
    const paid = Math.min(Math.max(Number(purchaseForm.paid) || 0, 0), purchaseTotal)
    const date = new Date().toLocaleDateString('ar-EG')
    const purchaseId = `PUR-${Date.now()}`
    setProducts(purchaseItems.reduce((nextProducts, item) => {
      const existing = nextProducts.find((product) => product.code === item.code)
      return existing ? nextProducts.map((product) => product.code === item.code ? { ...product, stock: product.stock + item.quantity, category: item.category, cost: item.cost, price: item.salePrice } : product) : [...nextProducts, { name: item.product, code: item.code, category: item.category, stock: item.quantity, price: item.salePrice, cost: item.cost, color: '#ddd6cb' }]
    }, products))
    setSuppliers(suppliers.map((item) => item.id === supplier.id ? { ...item, balance: item.balance + purchaseTotal - paid } : item))
    setPurchases([{ id: purchaseId, supplier: supplier.name, items: purchaseItems, total: purchaseTotal, paid, date }, ...purchases])
    setStockMovements([...purchaseItems.map((item) => ({ id: `MOV-${Date.now()}-${item.code}`, code: item.code, product: item.product, quantity: item.quantity, type: 'شراء' as const, reason: `فاتورة شراء ${purchaseId}${purchaseForm.note.trim() ? ` — ${purchaseForm.note.trim()}` : ''}`, date })), ...stockMovements])
    setAuditLogs([{ id: `LOG-${Date.now()}`, action: 'إضافة فاتورة شراء', target: purchaseId, date }, ...auditLogs])
    setPurchaseForm({ supplier: '', category: '', product: '', quantity: '1', cost: '', salePrice: '', paid: '', note: '' })
    setPurchaseItems([])
    setShowPurchase(false)
    setNotice('تم تسجيل فاتورة الشراء وتحديث المخزون')
    setTimeout(() => setNotice(''), 2500)
  }

  function editPurchase(purchase: Purchase) {
    setEditingPurchase({ ...purchase, items: purchase.items.map((item) => ({ ...item })) })
  }

  function saveEditedPurchase(event: React.FormEvent) {
    event.preventDefault()
    if (!editingPurchase || !editingPurchase.items.length) return
    const total = editingPurchase.items.reduce((sum, item) => sum + item.quantity * item.cost, 0)
    if (editingPurchase.paid < 0 || editingPurchase.paid > total || editingPurchase.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.cost <= 0 || item.salePrice <= 0)) {
      setNotice('راجع الكميات والأسعار والمبلغ المدفوع')
      setTimeout(() => setNotice(''), 2500)
      return
    }
    const original = purchases.find((purchase) => purchase.id === editingPurchase.id)
    if (!original) return
    const oldQuantities = original.items.reduce<Record<string, number>>((all, item) => ({ ...all, [item.code]: (all[item.code] || 0) + item.quantity }), {})
    const newQuantities = editingPurchase.items.reduce<Record<string, number>>((all, item) => ({ ...all, [item.code]: (all[item.code] || 0) + item.quantity }), {})
    setProducts(products.map((product) => ({ ...product, stock: product.stock - (oldQuantities[product.code] || 0) + (newQuantities[product.code] || 0) })))
    const originalDue = original.total - original.paid
    const newDue = total - editingPurchase.paid
    setSuppliers(suppliers.map((supplier) => supplier.name === original.supplier ? { ...supplier, balance: Math.max(0, supplier.balance - originalDue + newDue) } : supplier))
    const updatedPurchase = { ...editingPurchase, total, date: editingPurchase.date }
    setPurchases(purchases.map((purchase) => purchase.id === updatedPurchase.id ? updatedPurchase : purchase))
    setSelectedPurchase(updatedPurchase)
    setEditingPurchase(null)
    setAuditLogs([{ id: `LOG-${Date.now()}`, action: 'تعديل فاتورة شراء', target: updatedPurchase.id, date: new Date().toLocaleDateString('ar-EG') }, ...auditLogs])
    setNotice('تم تعديل فاتورة الشراء وتحديث المخزون وحساب المورد')
    setTimeout(() => setNotice(''), 2500)
  }

  function deletePurchase(purchase: Purchase) {
    if (!window.confirm('هل تريد حذف فاتورة الشراء؟ سيتم خصم الكميات وإلغاء المبلغ المستحق للمورد.')) return
    setProducts(products.map((product) => {
      const item = purchase.items.find((line) => line.code === product.code)
      return item ? { ...product, stock: Math.max(0, product.stock - item.quantity) } : product
    }))
    setSuppliers(suppliers.map((supplier) => supplier.name === purchase.supplier ? { ...supplier, balance: Math.max(0, supplier.balance - (purchase.total - purchase.paid)) } : supplier))
    setPurchases(purchases.filter((item) => item.id !== purchase.id))
    setSelectedPurchase(null)
    setNotice('تم حذف فاتورة الشراء وتحديث المخزون وحساب المورد')
    setTimeout(() => setNotice(''), 2500)
  }

  function paySupplier(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedSupplier) return
    const amount = Number(supplierPayment)
    if (amount <= 0) return
    const paid = Math.min(amount, selectedSupplier.balance)
    const date = new Date().toLocaleDateString('ar-EG')
    setSuppliers(suppliers.map((supplier) => supplier.id === selectedSupplier.id ? { ...supplier, balance: supplier.balance - paid } : supplier))
    setSupplierPayments([{ id: `SP-${Date.now()}`, supplier: selectedSupplier.name, amount: paid, date, note: 'دفعة على حساب المورد' }, ...supplierPayments])
    setAuditLogs([{ id: `LOG-${Date.now()}`, action: 'تسجيل دفعة لمورد', target: selectedSupplier.name, date }, ...auditLogs])
    setSelectedSupplier(null)
    setSupplierPayment('')
    setNotice('تم تسجيل دفعة المورد')
    setTimeout(() => setNotice(''), 2500)
  }

function updateProductPrices(event: React.FormEvent) {
    event.preventDefault()
    if (!editingProduct) return
    const name = editProductForm.name.trim().replace(/\s+/g, ' ')
    const stock = Number(editProductForm.stock)
    const cost = Number(editProductForm.cost)
    const price = Number(editProductForm.price)
    if (!name || !Number.isInteger(stock) || stock < 0 || cost < 0 || price <= 0) return
    const duplicateName = products.some((product) => product.code !== editingProduct.code && product.name.trim().toLocaleLowerCase('ar-EG') === name.toLocaleLowerCase('ar-EG'))
    if (duplicateName) {
      setNotice('اسم المنتج موجود بالفعل في المخزون')
      setTimeout(() => setNotice(''), 2500)
      return
    }
    setProducts(products.map((product) => product.code === editingProduct.code ? { ...product, name, stock, cost, price } : product))
    const date = new Date().toLocaleDateString('ar-EG')
    setAuditLogs([{ id: `LOG-${Date.now()}`, action: 'تعديل بيانات المنتج والمخزون', target: editingProduct.name, date }, ...auditLogs])
    setEditingProduct(null)
    setNotice('تم تحديث بيانات المنتج والمخزون')
    setTimeout(() => setNotice(''), 2500)
  }

  function deleteProduct(product: Product) {
    if (!window.confirm(`هل تريد حذف المنتج ${product.name}؟ سيتم حذفه من المخزون فقط مع الاحتفاظ بالفواتير السابقة.`)) return
    setProducts(products.filter((item) => item.code !== product.code))
    const date = new Date().toLocaleDateString('ar-EG')
    setAuditLogs([{ id: `LOG-${Date.now()}`, action: 'حذف منتج', target: product.name, date }, ...auditLogs])
    setNotice('تم حذف المنتج من المخزون')
    setTimeout(() => setNotice(''), 2500)
  }


  function addProduct(event: React.FormEvent) {
    event.preventDefault()
    if (!newProduct.name.trim() || !newProduct.price) return

    const name = newProduct.name.trim().replace(/\s+/g, ' ')
    const enteredCode = newProduct.code.trim()
    const normalizedName = name.toLocaleLowerCase('ar-EG')
    const normalizedCode = enteredCode.toLocaleLowerCase('ar-EG')
    const existing = products.find((product) =>
      product.name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ar-EG') === normalizedName ||
      (enteredCode && product.code.trim().toLocaleLowerCase('ar-EG') === normalizedCode)
    )
    const quantity = Number(newProduct.stock) || 0
    const price = Number(newProduct.price)
    const cost = Number(newProduct.cost) || 0

    if (existing) {
      setProducts(products.map((product) => product.code === existing.code
        ? { ...product, stock: product.stock + quantity, category: newProduct.category || product.category, price, cost }
        : product
      ))
      setNotice(`تم دمج ${quantity} من نفس المنتج مع المخزون الحالي`)
    } else {
      const code = enteredCode || `PR-${Date.now().toString().slice(-6)}`
      setProducts([...products, { name, code, category: newProduct.category, stock: quantity, price, cost, color: '#ddd6cb' }])
      setNotice('تمت إضافة المنتج بنجاح')
    }

    setNewProduct({ name: '', code: '', category: 'دهانات بلاستيك', stock: '', price: '', cost: '' })
    setShowAdd(false)
    setTimeout(() => setNotice(''), 2500)
  }

  return (
    <div dir="rtl" className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Palette size={22} /></div><div><strong>السيد سعد</strong><span>إدارة الدهانات</span></div></div>
        <div className="store-pill"><span className="status-dot" /> محل السيد سعد <ChevronDown size={15} /></div>
        <nav className="nav-list" aria-label="التنقل الرئيسي">
          {navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => setActive(label)}><Icon size={19} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-bottom"><button className="nav-item" onClick={() => setShowBackup(true)}><Settings size={19} /><span>الإعدادات والنسخ الاحتياطي</span></button><div className="user-card"><div className="avatar">س</div><div><strong>السيد سعد</strong><span>مدير المحل</span></div><ChevronDown size={16} /></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="mobile-brand"><Palette size={20} /> السيد سعد</div><button className="icon-button"><Bell size={19} /><i /></button></header><nav className="mobile-nav" aria-label="التنقل الرئيسي للهاتف">{navItems.map(({ label, icon: Icon }) => <button key={label} className={`mobile-nav-item ${active === label ? 'active' : ''}`} onClick={() => setActive(label)}><Icon size={17} /><span>{label}</span></button>)}</nav>
        <div className="page-heading"><div><p className="eyebrow">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><h1>{active === 'الرئيسية' ? 'السيد سعد' : active}</h1><p className="subheading">إليك ملخص أداء المحل اليوم.</p></div><div className="heading-actions"><button className="outline-button" onClick={() => window.print()}><FileText size={17} /> طباعة</button><button className="primary-button" onClick={() => active === 'المبيعات والفواتير' ? setShowSale(true) : active === 'العملاء' ? setShowCustomer(true) : active === 'الموردين والمشتريات' ? setShowPurchase(true) : setShowAdd(true)}><Plus size={18} /> {active === 'المبيعات والفواتير' ? 'فاتورة جديدة' : active === 'العملاء' ? 'إضافة حساب' : active === 'الموردين والمشتريات' ? 'فاتورة شراء' : 'إضافة منتج'}</button></div></div>

        {active === 'التقارير' && <section className="reports-overview">
          <div className="period-report-grid"><section className="panel period-report"><div className="panel-header"><div><h2>تقرير هذا الأسبوع</h2><p>من آخر 7 أيام حتى اليوم</p></div><button className="outline-button" onClick={() => window.print()}><FileText size={15} /> طباعة</button></div><div className="period-metrics"><div><span>المبيعات</span><strong>{weeklyReport.salesTotal.toLocaleString('ar-EG')} ج.م</strong></div><div><span>التكلفه</span><strong>{weeklyReport.costTotal.toLocaleString('ar-EG')} ج.م</strong></div><div><span>المصروفات</span><strong>{weeklyReport.expenseTotal.toLocaleString('ar-EG')} ج.م</strong></div><div><span>صافي الربح</span><strong className={weeklyReport.net >= 0 ? 'positive' : 'negative'}>{weeklyReport.net.toLocaleString('ar-EG')} ج.م</strong></div></div><p className="period-footnote">{weeklyReport.sales.length} فاتورة · {weeklyReport.expenses.length} مصروف</p></section><section className="panel period-report"><div className="panel-header"><div><h2>{reportMonthOffset === 0 ? 'تقرير هذا الشهر' : reportMonthOffset === 1 ? 'تقرير الشهر الماضي' : 'تقرير قبل شهرين'}</h2><p>{reportMonthOffset === 0 ? 'من بداية الشهر حتى اليوم' : 'ملخص كامل للشهر المحدد'}</p><select aria-label="اختيار شهر التقرير" value={reportMonthOffset} onChange={(e) => setReportMonthOffset(Number(e.target.value))}><option value={0}>هذا الشهر</option><option value={1}>الشهر الماضي</option><option value={2}>قبل شهرين</option></select></div><button className="outline-button" onClick={() => window.print()}><FileText size={15} /> طباعة</button></div><div className="period-metrics"><div><span>المبيعات</span><strong>{selectedMonthlyReport.salesTotal.toLocaleString('ar-EG')} ج.م</strong></div><div><span>التكلفة</span><strong>{selectedMonthlyReport.costTotal.toLocaleString('ar-EG')} ج.م</strong></div><div><span>المصروفات</span><strong>{selectedMonthlyReport.expenseTotal.toLocaleString('ar-EG')} ج.م</strong></div><div><span>صافي الربح</span><strong className={selectedMonthlyReport.net >= 0 ? 'positive' : 'negative'}>{selectedMonthlyReport.net.toLocaleString('ar-EG')} ج.م</strong></div></div><p className="period-footnote">{selectedMonthlyReport.sales.length} فاتورة · {selectedMonthlyReport.expenses.length} مصروف</p></section></div>
          <div className="stat-grid report-stat-grid"><StatCard title="إجمالي المبيعات" value={sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString('ar-EG')} unit="ج.م" detail={`${sales.length.toLocaleString('ar-EG')} فاتورة`} icon={<ShoppingCart />} tone="coral" /><StatCard title="تكلفة البضاعة المباعة" value={costOfGoodsSold.toLocaleString('ar-EG')} unit="ج.م" detail="حسب سعر الشراء المسجل" icon={<Boxes />} tone="amber" /><StatCard title="المصروفات" value={totalExpenses.toLocaleString('ar-EG')} unit="ج.م" detail={`${expenses.length.toLocaleString('ar-EG')} مصروف`} icon={<WalletCards />} tone="purple" /><StatCard title="صافي الربح" value={netProfit.toLocaleString('ar-EG')} unit="ج.م" detail="الربح الإجمالي ناقص المصروفات" positive={netProfit >= 0} icon={<TrendingUp />} tone="green" /></div>
          <div className="reports-grid"><section className="panel report-panel"><div className="panel-header"><div><h2>تسجيل مصروف</h2><p>أضف المصروفات لحساب صافي الربح</p></div></div><form className="expense-form" onSubmit={addExpense}><div className="form-row"><label>اسم المصروف<input required value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} placeholder="مثال: كهرباء أو نقل" /></label><label>المبلغ<input required type="number" min="0.01" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="0.00" /></label></div><label>ملاحظات<input value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} placeholder="اختياري" /></label><button className="primary-button" type="submit"><Plus size={16} /> تسجيل المصروف</button></form><div className="mini-list">{expenses.slice(0, 5).map((expense) => <div className="mini-list-row" key={expense.id}><span>{expense.title}<small>{expense.date}</small></span><strong>{expense.amount.toLocaleString('ar-EG')} ج.م</strong></div>)}{!expenses.length && <p className="muted-empty">لم تسجل مصروفات بعد.</p>}</div></section><section className="panel report-panel"><div className="panel-header"><div><h2>سجل حركة المخزون</h2><p>الكميات الداخلة والخارجة وسبب كل مخزون حركة</p></div><div className="movement-summary"><span>دخول: {stockPurchased.toLocaleString('ar-EG')}</span><span>خروج: {stockSold.toLocaleString('ar-EG')}</span></div></div>{stockMovements.length ? <div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>المنتج</th><th>الحركة</th><th>الكمية</th><th>السبب</th></tr></thead><tbody>{stockMovements.slice(0, 20).map((movement) => <tr key={movement.id}><td>{movement.date}</td><td><strong>{movement.product}</strong><small className="table-subtext">{movement.code}</small></td><td><span className={`badge ${movement.type === 'بيع' ? 'warning' : 'good'}`}>{movement.type}</span></td><td>{movement.quantity.toLocaleString('ar-EG')}</td><td>{movement.reason}</td></tr>)}</tbody></table></div> : <div className="empty-state"><Boxes size={26} /><strong>لا توجد حركات مخزون بعد</strong><p>ستظهر هنا حركات البيع والشراء والتعديل تلقائياً.</p></div>}</section></div>
        </section>}

        {active === 'الرئيسية' ? <>
          <section className="stat-grid" aria-label="ملخص اليوم"><StatCard title="مبيعات اليوم" value={todayTotal.toLocaleString('ar-EG')} unit="ج.م" detail={todaySales.length ? `${todaySales.length.toLocaleString('ar-EG')} فواتير مسجلة` : 'أضف مبيعاتك من قسم الفواتير'} icon={<ShoppingCart />} tone="coral" /><StatCard title="الربح الإجمالي" value={grossProfit.toLocaleString('ar-EG')} unit="ج.م" detail="المبيعات ناقص تكلفة الشراء" positive icon={<TrendingUp />} tone="green" /><StatCard title="إجمالي المنتجات" value={products.length.toLocaleString('ar-EG')} unit="منتج" detail={`في ${categoriesCount.toLocaleString('ar-EG')} تصنيفات`} icon={<Boxes />} tone="amber" /><StatCard title="فواتير اليوم" value={todaySales.length.toLocaleString('ar-EG')} unit="فاتورة" detail={todaySales.length ? 'تم تسجيلها اليوم' : 'لا توجد فواتير مسجلة بعد'} icon={<ClipboardList />} tone="blue" /><StatCard title="تنبيهات المخزون" value={lowStock.length.toLocaleString('ar-EG')} unit="منتجات" detail="تحتاج إعادة طلب" icon={<Bell />} tone="purple" /><StatCard title="إجمالي المديونيات" value={outstandingTotal.toLocaleString('ar-EG')} unit="ج.م" detail="على العملاء والصنايعية" icon={<CreditCard />} tone="blue" /></section>
          <section className="content-grid"><div className="panel chart-panel"><div className="panel-header"><div><h2>نظرة على المبيعات</h2><p>أداء المبيعات خلال الأسبوع</p></div><select aria-label="اختيار الفترة"><option>هذا الأسبوع</option><option>هذا الشهر</option></select></div><div className="chart"><div className="chart-y"><span>١٢k</span><span>٨k</span><span>٤k</span><span>٠</span></div><div className="bars">{['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map((day, i) => <div className="bar-col" key={day}><div className={`bar ${i === 5 ? 'highlight' : ''}`} style={{ height: `${[48, 67, 54, 79, 62, 94, 42][i]}%` }} /><span>{day}</span></div>)}</div></div></div><div className="panel alerts-panel"><div className="panel-header"><div><h2>تنبيهات المخزون</h2><p>منتجات قاربت على النفاد</p></div><button className="text-button" onClick={() => setActive('المخزون والمنتجات')}>عرض الكل</button></div><div className="alert-list">{lowStock.map((p) => <div className="alert-row" key={p.code}><div className="product-swatch" style={{ background: p.color }} /><div className="alert-info"><strong>{p.name}</strong><span>{p.code}</span></div><b>{p.stock} عبوات</b></div>)}</div></div></section>
          <section className="panel products-panel"><div className="panel-header"><div><h2>أحدث المنتجات</h2><p>آخر المنتجات المضافة للمخزون</p></div><button className="text-button" onClick={() => setActive('المخزون والمنتجات')}>عرض المخزون <span>←</span></button></div><ProductTable products={products.slice(0, 4)} emptyMessage="لم تتم إضافة منتجات بعد. ابدأ بإدخال أصناف المحل الفعلية." onEdit={(product) => { setEditingProduct(product); setEditProductForm({ name: product.name, stock: String(product.stock), cost: String(product.cost), price: String(product.price) }) }} onDelete={deleteProduct} /></section>
        </> : active === 'المبيعات والفواتير' ? <section className="panel inventory-view"><div className="panel-header"><div><h2>سجل الفواتير</h2><p>كل الفواتير التي سجلها المستخدم على هذا الجهاز</p></div><input className="table-search" value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} placeholder="ابحث برقم الفاتورة أو اسم العميل" aria-label="البحث في الفواتير" /></div>{filteredSales.length ? <div className="table-wrap"><table><thead><tr><th>رقم الفاتورة</th><th>العميل</th><th>المنتجات</th><th>عدد الأصناف</th><th>الإجمالي قبل الخصم</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>{sales.map((sale) => <tr key={sale.id}><td><strong>{sale.id}</strong></td><td>{sale.customer}</td><td>{sale.items.map((item) => item.product).join('، ')}</td><td>{sale.items.length.toLocaleString('ar-EG')} أصناف</td><td>{sale.subtotal.toLocaleString('ar-EG')} ج.م</td><td><strong>{sale.total.toLocaleString('ar-EG')} ج.م</strong></td><td>{sale.paid.toLocaleString('ar-EG')} ج.م</td><td>{sale.remaining.toLocaleString('ar-EG')} ج.م</td><td><span className={`badge ${sale.remaining > 0 ? 'warning' : 'good'}`}>{sale.remaining > 0 ? 'آجل' : 'مدفوعة بالكامل'}</span></td><td>{sale.date}</td><td><div className="row-actions"><button className="text-button" onClick={() => setSelectedSale(sale)}>عرض / طباعة</button>{sale.remaining > 0 && <button className="text-button" onClick={() => { setPaymentSale(sale); setPaymentAmount('') }}>تسجيل دفعة</button>}<button className="danger-button" onClick={() => deleteSale(sale)}>حذف</button></div></td></tr>)}</tbody></table></div> : <div className="empty-state"><ReceiptText size={28} /><strong>لا توجد فواتير بعد</strong><p>ابدأ بتسجيل أول عملية بيع فعلية.</p></div>}</section> : active === 'الموردين والمشتريات' ? <section className="supplier-page"><div className="supplier-panels"><section className="panel inventory-view"><div className="panel-header"><div><h2>الموردين</h2><p>أرصدة الموردين والمدفوعات المستحقة</p><input className="table-search" value={supplierSearch} onChange={(e) => setSupplierSearch(e.target.value)} placeholder="ابحث باسم المورد أو الهاتف" aria-label="البحث في الموردين" /></div><button className="outline-button" onClick={() => setShowSupplier(true)}><Plus size={16} /> إضافة مورد</button></div>{suppliers.length ? <div className="table-wrap"><table><thead><tr><th>المورد</th><th>الهاتف</th><th>إجمالي المشتريات</th><th>المتبقي</th><th>إجراء</th></tr></thead><tbody>{filteredSuppliers.map((supplier) => { const supplierPurchases = purchases.filter((purchase) => purchase.supplier === supplier.name); return <tr key={supplier.id}><td><strong>{supplier.name}</strong></td><td>{supplier.phone || '—'}</td><td>{supplierPurchases.reduce((sum, purchase) => sum + purchase.total, 0).toLocaleString('ar-EG')} ج.م</td><td><strong className={supplier.balance > 0 ? 'negative' : 'positive'}>{supplier.balance.toLocaleString('ar-EG')} ج.م</strong></td><td><div className="row-actions"><button className="text-button" onClick={() => { setSelectedSupplier(supplier); setSupplierPayment('') }}>تسجيل دفعة</button><button className="text-button" onClick={() => setSupplierReport(supplier)}>تقرير المورد</button></div></td></tr>})}</tbody></table></div> : <div className="empty-state"><UserRound size={28} /><strong>لا يوجد موردون بعد</strong><p>أضف أول مورد لبدء تسجيل المشتريات.</p></div>}</section><section className="panel inventory-view"><div className="panel-header"><div><h2>فواتير المشتريات</h2><p>كل فواتير شراء الدهانات المسجلة</p></div><button className="primary-button" onClick={() => setShowPurchase(true)}><Plus size={16} /> تسجيل فاتورة شراء</button></div>{purchases.length ? <div className="table-wrap"><table><thead><tr><th>رقم الفاتورة</th><th>المورد</th><th>المنتج</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>التاريخ</th></tr></thead><tbody>{purchases.map((purchase) => <tr key={purchase.id}><td><strong>{purchase.id}</strong></td><td>{purchase.supplier}</td><td>{purchase.items.map((item) => `${item.product} × ${item.quantity}`).join('، ')}</td><td>{purchase.total.toLocaleString('ar-EG')} ج.م</td><td>{purchase.paid.toLocaleString('ar-EG')} ج.م</td><td>{(purchase.total - purchase.paid).toLocaleString('ar-EG')} ج.م</td><td>{purchase.date}</td><td><button className="text-button" onClick={() => setSelectedPurchase(purchase)}>عرض / طباعة</button></td></tr>)}</tbody></table></div> : <div className="empty-state"><ReceiptText size={28} /><strong>لا توجد فواتير شراء بعد</strong><p>سجّل أول فاتورة لتحديث المخزون وحساب مديونية المورد.</p></div>}</section></div></section> : active === 'التقارير' ? <section className="panel inventory-view"><div className="panel-header"><div><h2>تقرير الأرباح والمصروفات</h2><p>صافي الربح محسوب من تكلفة الشراء والمبيعات الفعلية</p></div><form className="inline-expense-form" onSubmit={addExpense}><input aria-label="اسم المصروف" placeholder="اسم المصروف" value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} /><input aria-label="قيمة المصروف" type="number" min="1" placeholder="القيمة" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /><button className="primary-button" type="submit">إضافة مصروف</button></form></div><div className="stat-grid report-stats"><StatCard title="إجمالي المبيعات" value={sales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString('ar-EG')} unit="ج.م" detail={`${sales.length} فاتورة`} icon={<TrendingUp />} tone="coral" /><StatCard title="تكلفة البضاعة" value={sales.reduce((sum, sale) => sum + sale.items.reduce((total, item) => total + item.unitCost * item.quantity, 0), 0).toLocaleString('ar-EG')} unit="ج.م" detail="حساب سعر الشراء" icon={<Boxes />} tone="amber" /><StatCard title="المصروفات" value={expenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString('ar-EG')} unit="ج.م" detail={`${expenses.length} مصروف`} icon={<WalletCards />} tone="purple" /><StatCard title="صافي الربح" value={(sales.reduce((sum, sale) => sum + sale.total - sale.items.reduce((total, item) => total + item.unitCost * item.quantity, 0), 0) - expenses.reduce((sum, expense) => sum + expense.amount, 0)).toLocaleString('ar-EG')} unit="ج.م" detail="المبيعات - التكلفة - المصروفات" icon={<TrendingUp />} tone="blue" /></div><div className="table-wrap"><table><thead><tr><th>المصروف</th><th>القيمة</th><th>التاريخ</th><th>ملاحظات</th></tr></thead><tbody>{expenses.map((expense) => <tr key={expense.id}><td>{expense.title}</td><td>{expense.amount.toLocaleString('ar-EG')} ج.م</td><td>{expense.date}</td><td>{expense.note || '—'}</td></tr>)}</tbody></table></div><div className="panel-header audit-header"><div><h2>سجل التعديلات</h2><p>تتبع الإضافات والحذف والمصروفات</p></div></div><div className="statement-list">{auditLogs.length ? auditLogs.slice(0, 10).map((log) => <div className="statement-row" key={log.id}><span>{log.action} — {log.target}</span><strong>{log.date}</strong></div>) : <div className="empty-state">لا توجد تعديلات مسجلة بعد</div>}</div></section> : active === 'العملاء' ? <section className="panel inventory-view"><div className="panel-header"><div><h2>حسابات العملاء والصنايعية</h2><p>تابع المديونيات والأقساط المتبقية لكل حساب</p><input className="table-search" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="ابحث باسم العميل أو الهاتف" aria-label="البحث في العملاء" /></div><span className="badge warning">إجمالي المستحق: {customers.reduce((sum, customer) => sum + customer.balance, 0).toLocaleString('ar-EG')} ج.م</span></div>{customers.length ? <div className="table-wrap"><table><thead><tr><th>اسم الحساب</th><th>رقم الهاتف</th><th>الرصيد المستحق</th><th>آخر حركة</th><th>الحالة</th></tr></thead><tbody>{filteredCustomers.map((customer) => <tr key={customer.name} className="customer-row" onClick={() => setSelectedCustomer(customer)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedCustomer(customer) }} aria-label={`عرض حساب ${customer.name}`}><td><strong>{customer.name}</strong></td><td>{customer.phone || '—'}</td><td>{customer.balance.toLocaleString('ar-EG')} ج.م</td><td>{customer.lastActivity}</td><td><span className={`badge ${customer.balance > 0 ? 'warning' : 'good'}`}>{customer.balance > 0 ? 'عليه مديونية' : 'مسدد'}</span></td></tr>)}</tbody></table></div> : <div className="empty-state"><UserRound size={28} /><strong>لا توجد حسابات آجلة</strong><p>ستظهر هنا حسابات االعملاء والصنايعية عند تسجيل أول فاتورة آجل.</p></div>}</section> : <section className="panel inventory-view"><div className="panel-header"><div><h2>قائمة المنتجات</h2><p>إدارة جميع منتجات وأصناف المحل</p></div><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن منتج أو كود..." /></div></div><ProductTable products={filteredProducts} emptyMessage="لا توجد منتجات مطابقة للبحث." onEdit={(product) => { setEditingProduct(product); setEditProductForm({ name: product.name, stock: String(product.stock), cost: String(product.cost), price: String(product.price) }) }} onDelete={deleteProduct} /></section>}
      </main>
      {notice && <div className="toast">{notice} <span>✓</span></div>}
      {showBackup && <div className="modal-backdrop" onClick={() => setShowBackup(false)}><section className="modal backup-modal" onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>النسخ الاحتياطي والاستعادة</h2><p>احفظ نسخه كاملة من المنتجات والفواتير والعملاء والديون على جهازك.</p></div><button type="button" className="close-button" onClick={() => setShowBackup(false)}><X size={20} /></button></div><div className="backup-actions"><button className="primary-button full" onClick={exportBackup}><Download size={18} /> تنزيل نسخة احتياطية كاملة</button><button className="outline-button full" onClick={() => backupInputRef.current?.click()}><Download size={18} /> استعادة نسخة من الجهاز</button><input ref={backupInputRef} type="file" accept="application/json" onChange={(event) => { importBackup(event); setShowBackup(false) }} hidden /></div><div className="backup-note"><strong>مهم:</strong><span>النسخة تشمل كل بيانات المحل المحفوظة على هذا الجهاز، والاستعادة تستبدل البيانات الحالية بالكامل.</span></div></section></div>}
      {showSupplier && <div className="modal-backdrop" onClick={() => setShowSupplier(false)}><form className="modal" onSubmit={addSupplier} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>إضافة مورد</h2><p>سجّل بيانات مورد الدهانات</p></div><button type="button" className="close-button" onClick={() => setShowSupplier(false)}><X size={20} /></button></div><label>اسم المورد<input required value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} placeholder="مثال: شركة الألوان" /></label><label>رقم الهاتف<input value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} placeholder="اختياري" /></label><button className="primary-button full" type="submit"><UserRound size={18} /> حفظ المورد</button></form></div>}
      {selectedPurchase && <div className="modal-backdrop" onClick={() => setSelectedPurchase(null)}><section className="modal invoice-preview purchase-invoice" onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>فاتورة شراء</h2><p>رقم الفاتورة: {selectedPurchase.id} · التاريخ: {selectedPurchase.date}</p></div><div className="invoice-modal-actions"><button className="text-button" type="button" onClick={() => editPurchase(selectedPurchase)}>تعديل الفاتورة</button><button className="danger-button" type="button" onClick={() => deletePurchase(selectedPurchase)}>حذف الفاتورة</button><button className="outline-button" onClick={() => window.print()}><FileText size={16} /> طباعة الفاتورة</button><button type="button" className="close-button" onClick={() => setSelectedPurchase(null)}><X size={20} /></button></div></div><div className="purchase-invoice-meta"><div><span>المورد</span><strong>{selectedPurchase.supplier}</strong></div><div><span>الإجمالي</span><strong>{selectedPurchase.total.toLocaleString('ar-EG')} ج.م</strong></div><div><span>المدفوع</span><strong>{selectedPurchase.paid.toLocaleString('ar-EG')} ج.م</strong></div><div><span>المتبقي</span><strong>{(selectedPurchase.total - selectedPurchase.paid).toLocaleString('ar-EG')} ج.م</strong></div></div><div className="table-wrap"><table><thead><tr><th>المنتج</th><th>الكمية</th><th>سعر الشراء</th><th>سعر البيع</th><th>الإجمالي</th></tr></thead><tbody>{selectedPurchase.items.map((item, index) => <tr key={`${item.product}-${index}`}><td>{item.product}</td><td>{item.quantity}</td><td>{item.cost.toLocaleString('ar-EG')} ج.م</td><td>{item.salePrice ? `${item.salePrice.toLocaleString('ar-EG')} ج.م` : '—'}</td><td>{(item.quantity * item.cost).toLocaleString('ar-EG')} ج.م</td></tr>)}</tbody></table></div></section></div>}
      {showPurchase && <div className="modal-backdrop" onClick={() => setShowPurchase(false)}><form className="modal" onSubmit={addPurchase} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>تسجيل فاتورة شراء</h2><p>أضف الكمية للمخزون وسجّل المبلغ المستحق للمورد</p></div><button type="button" className="close-button" onClick={() => setShowPurchase(false)}><X size={20} /></button></div><label>المورد<select required value={purchaseForm.supplier} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}><option value="">اختر المورد</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label><div className="purchase-cart-entry"><div className="form-row"><label>الصنف<select value={purchaseForm.category} onChange={(e) => setPurchaseForm({ ...purchaseForm, category: e.target.value, product: '' })}><option value="">كل الأصناف</option>{productCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label>اسم المنتج<input required={purchaseItems.length === 0} list="purchase-product-list" value={purchaseForm.product} onChange={(e) => setPurchaseForm({ ...purchaseForm, product: e.target.value })} placeholder="اكتب اسم المنتج" /><datalist id="purchase-product-list">{purchaseCategoryProducts.map((product) => <option key={product.code} value={product.name} />)}</datalist></label></div><div className="form-row"><label>الكمية<input required={purchaseItems.length === 0} type="number" min="1" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} /></label><label>سعر الشراء للوحدة<input required={purchaseItems.length === 0} type="number" min="0.01" step="0.01" value={purchaseForm.cost} onChange={(e) => setPurchaseForm({ ...purchaseForm, cost: e.target.value })} /></label></div><label>سعر البيع للوحدة<input required={purchaseItems.length === 0} type="number" min="0.01" step="0.01" value={purchaseForm.salePrice} onChange={(e) => setPurchaseForm({ ...purchaseForm, salePrice: e.target.value })} placeholder="سعر البيع بعد الشرا��" /></label><button type="button" className="outline-button full" onClick={addPurchaseItem}><Plus size={16} /> إضافة للسلة</button></div>{purchaseItems.length > 0 && <div className="purchase-cart"><div className="cart-heading"><strong>سلة المشتريات</strong><span>{purchaseItems.length} أصناف</span></div>{purchaseItems.map((item) => <div className="purchase-cart-row" key={item.code}><div><strong>{item.product}</strong><small>{item.quantity} × {item.cost.toLocaleString('ar-EG')} ج.م</small></div><strong>{(item.quantity * item.cost).toLocaleString('ar-EG')} ج.م</strong><button type="button" className="danger-button" onClick={() => setPurchaseItems(purchaseItems.filter((line) => line.code !== item.code))}>حذف</button></div>)}<div className="cart-total"><span>إجمالي الفاتورة</span><strong>{purchaseTotal.toLocaleString('ar-EG')} ج.م</strong></div></div>}<label>المبلغ المدفوع<input type="number" min="0" step="0.01" value={purchaseForm.paid} onChange={(e) => setPurchaseForm({ ...purchaseForm, paid: e.target.value })} placeholder="اتركه صفرًا لو الشراء آجل" /></label><label>ملاحظات<input value={purchaseForm.note} onChange={(e) => setPurchaseForm({ ...purchaseForm, note: e.target.value })} placeholder="اختياري" /></label><button className="primary-button full" type="submit"><ReceiptText size={18} /> حفظ فاتورة الشراء</button></form></div>}
      {supplierReport && <div className="modal-backdrop" onClick={() => setSupplierReport(null)}><section className="modal invoice-preview supplier-report-modal" onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>تقرير المورد: {supplierReport.name}</h2><p>{supplierReport.phone || 'بدون هاتف'} · تقرير كامل بالتواريخ</p></div><div className="invoice-modal-actions"><button className="text-button" type="button" onClick={() => editSupplier(supplierReport)}>تعديل المورد</button><button className="danger-button" type="button" onClick={() => deleteSupplier(supplierReport)}>حذف المورد</button><button className="outline-button" onClick={() => window.print()}><FileText size={16} /> طباعة التقرير</button><button type="button" className="close-button" onClick={() => setSupplierReport(null)}><X size={20} /></button></div></div><div className="report-detail-block"><h3>تفاصيل المنتجات المشتراة والمدفوعات</h3><div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>المنتج</th><th>الكمية</th><th>الإجمالي</th><th>المدفوع</th></tr></thead><tbody>{purchases.filter((purchase) => purchase.supplier === supplierReport.name).flatMap((purchase) => purchase.items.map((item, index) => <tr key={`${purchase.id}-${item.code}-${index}`}><td>{purchase.date}</td><td>{item.product}</td><td>{item.quantity.toLocaleString('ar-EG')}</td><td>{(item.quantity * item.cost).toLocaleString('ar-EG')} ج.م</td><td>{(purchase.paid * ((item.quantity * item.cost) / (purchase.total || 1))).toLocaleString('ar-EG')} ج.م</td></tr>))}{supplierPayments.filter((payment) => payment.supplier === supplierReport.name).map((payment) => <tr key={payment.id}><td>{payment.date}</td><td>دفعة {payment.note && `— ${payment.note}`}</td><td>—</td><td>—</td><td>{payment.amount.toLocaleString('ar-EG')} ج.م</td></tr>)}</tbody></table></div></div><div className="invoice-summary"><div><span>إجمالي المشتريات</span><strong>{purchases.filter((purchase) => purchase.supplier === supplierReport.name).reduce((sum, purchase) => sum + purchase.total, 0).toLocaleString('ar-EG')} ج.م</strong></div><div><span>إجمالي المدفوع</span><strong>{(purchases.filter((purchase) => purchase.supplier === supplierReport.name).reduce((sum, purchase) => sum + purchase.paid, 0) + supplierPayments.filter((payment) => payment.supplier === supplierReport.name).reduce((sum, payment) => sum + payment.amount, 0)).toLocaleString('ar-EG')} ج.م</strong></div><div><span>الرصيد المتبقي</span><strong>{supplierReport.balance.toLocaleString('ar-EG')} ج.م</strong></div></div><div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>نوع العملية</th><th>البيان</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead><tbody>{[...purchases.filter((purchase) => purchase.supplier === supplierReport.name).map((purchase) => ({ date: purchase.date, type: 'فاتورة شراء', description: `${purchase.id} — ${purchase.items.map((item) => `${item.product} × ${item.quantity}`).join('، ')}`, debit: purchase.total, credit: purchase.paid })), ...supplierPayments.filter((payment) => payment.supplier === supplierReport.name).map((payment) => ({ date: payment.date, type: 'دفعة', description: payment.note, debit: 0, credit: payment.amount }))].map((entry, index) => <tr key={`${entry.type}-${index}`}><td>{entry.date}</td><td><span className={`badge ${entry.type === 'دفعة' ? 'good' : 'warning'}`}>{entry.type}</span></td><td>{entry.description}</td><td>{entry.debit ? `${entry.debit.toLocaleString('ar-EG')} ج.م` : '—'}</td><td>{entry.credit ? `${entry.credit.toLocaleString('ar-EG')} ج.م` : '—'}</td><td>—</td></tr>)}</tbody></table></div>{!purchases.some((purchase) => purchase.supplier === supplierReport.name) && !supplierPayments.some((payment) => payment.supplier === supplierReport.name) && <div className="empty-state">لا توجد تعاملات مسجلة لهذا المورد.</div>}</section></div>}
      {selectedSupplier && <div className="modal-backdrop" onClick={() => setSelectedSupplier(null)}><form className="modal" onSubmit={paySupplier} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>دفعة للمورد</h2><p>{selectedSupplier.name} — المتبقي {selectedSupplier.balance.toLocaleString('ar-EG')} ج.م</p></div><button type="button" className="close-button" onClick={() => setSelectedSupplier(null)}><X size={20} /></button></div><label>قيمة الدفعة<input required autoFocus type="number" min="0.01" step="0.01" value={supplierPayment} onChange={(e) => setSupplierPayment(e.target.value)} /></label><button className="primary-button full" type="submit"><WalletCards size={18} /> تسجيل الدفعة</button></form></div>}
      {showCustomer && <div className="modal-backdrop" onClick={() => setShowCustomer(false)}><form className="modal" onSubmit={addCustomer} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>إضافة حساب جديد</h2><p>أضف بيانات العميل أو الصنايعي</p></div><button type="button" className="close-button" onClick={() => setShowCustomer(false)}><X size={20} /></button></div><label>الاسم<input required value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} placeholder="مثال: محمد النقاش" /></label><div className="form-row"><label>رقم الهاتف<input value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="اختياري" /></label><label>نوع الحساب<select value={customerForm.kind} onChange={(e) => setCustomerForm({ ...customerForm, kind: e.target.value as 'عميل' | 'صنايعي' })}><option>عميل</option><option>صنايعي</option></select></label></div><button className="primary-button full" type="submit"><UserRound size={18} /> حفظ الحساب</button></form></div>}
      {selectedCustomer && <div className="modal-backdrop" onClick={() => setSelectedCustomer(null)}><section className="modal invoice-preview customer-statement" onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>كشف حساب: {selectedCustomer.name}</h2><p>{selectedCustomer.kind || 'عميل'} · {selectedCustomer.phone || 'بدون هاتف'}</p></div><div className="invoice-modal-actions"><button className="text-button" type="button" onClick={() => editCustomer(selectedCustomer)}>تعديل الحساب</button><button className="danger-button" type="button" onClick={() => deleteCustomer(selectedCustomer)}>حذف الحساب</button><button className="outline-button" onClick={() => printCustomerStatement(selectedCustomer)}><FileText size={16} /> طباعة الكشف</button><button type="button" className="close-button" onClick={() => setSelectedCustomer(null)}><X size={20} /></button></div></div><div className="invoice-summary"><div><span>إجمالي المشتريات</span><strong>{sales.filter((sale) => sale.customer === selectedCustomer.name).reduce((sum, sale) => sum + sale.total, 0).toLocaleString('ar-EG')} ج.م</strong></div><div><span>المدفوع</span><strong>{sales.filter((sale) => sale.customer === selectedCustomer.name).reduce((sum, sale) => sum + sale.paid, 0).toLocaleString('ar-EG')} ج.م</strong></div><div><span>المتبقي</span><strong>{selectedCustomer.balance.toLocaleString('ar-EG')} ج.م</strong></div></div><div className="report-detail-block"><h3>تفاصيل المنتجات المباعة والمدفوعات</h3><div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>المنتج</th><th>الكمية</th><th>الإجمالي</th><th>المدفوع</th></tr></thead><tbody>{sales.filter((sale) => sale.customer === selectedCustomer.name).flatMap((sale) => sale.items.map((item) => <tr key={`${sale.id}-${item.code}`}><td>{sale.date}</td><td>{item.product}</td><td>{item.quantity.toLocaleString('ar-EG')}</td><td>{item.total.toLocaleString('ar-EG')} ج.م</td><td>{(sale.paid * (item.total / (sale.subtotal || 1))).toLocaleString('ar-EG')} ج.م</td></tr>))}{customerPayments.filter((payment) => payment.customer === selectedCustomer.name).map((payment) => <tr key={payment.id}><td>{payment.date}</td><td>{payment.type} {payment.note && `— ${payment.note}`}</td><td>—</td><td>—</td><td>{payment.amount.toLocaleString('ar-EG')} ج.م</td></tr>)}</tbody></table></div></div><form className="payment-form" onSubmit={addCustomerPayment}><div className="form-row"><label>نوع الحركة<select value={customerPayment.type} onChange={(e) => setCustomerPayment({ ...customerPayment, type: e.target.value as 'دفعة' | 'سُلفة' })}><option>دفعة</option><option>سُلفة</option></select></label><label>المبلغ<input required type="number" min="1" value={customerPayment.amount} onChange={(e) => setCustomerPayment({ ...customerPayment, amount: e.target.value })} /></label></div><label>ملاحظات<input value={customerPayment.note} onChange={(e) => setCustomerPayment({ ...customerPayment, note: e.target.value })} placeholder="مثال: دفعة نقدية" /></label><button className="primary-button full" type="submit"><WalletCards size={17} /> تسجيل الحركة</button></form><div className="statement-list">{[...sales.filter((sale) => sale.customer === selectedCustomer.name).map((sale) => ({ date: sale.date, text: `فاتورة ${sale.id}`, amount: sale.total, type: 'فاتورة' })), ...customerPayments.filter((payment) => payment.customer === selectedCustomer.name).map((payment) => ({ date: payment.date, text: payment.note || payment.type, amount: payment.amount, type: payment.type }))].map((entry, index) => <div className="statement-row" key={`${entry.text}-${index}`}><span>{entry.date}</span><strong>{entry.text}</strong><b>{entry.amount.toLocaleString('ar-EG')} ج.م</b></div>)}</div></section></div>}
      {editingPurchase && <div className="modal-backdrop" onClick={() => setEditingPurchase(null)}><form className="modal invoice-edit-modal" onSubmit={saveEditedPurchase} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>تعديل فاتورة الشراء</h2><p>{editingPurchase.id} · عدّل الكميات والأسعار ثم احفظ التغييرات</p></div><button type="button" className="close-button" onClick={() => setEditingPurchase(null)}><X size={20} /></button></div><label>المبلغ المدفوع<input type="number" min="0" step="0.01" value={editingPurchase.paid} onChange={(e) => setEditingPurchase({ ...editingPurchase, paid: Number(e.target.value) })} /></label><div className="sale-cart"><div className="panel-header"><div><h3>أصناف الفاتورة</h3><p>عدّل الكمية أو الأسعار، ويمكنك حذف الصنف</p></div></div>{editingPurchase.items.map((item, index) => <div className="cart-row" key={`${item.code}-${index}`}><span>{item.product}<small>{item.code}</small></span><div className="form-row compact-fields"><label>الكمية<input type="number" min="1" value={item.quantity} onChange={(e) => setEditingPurchase({ ...editingPurchase, items: editingPurchase.items.map((line, itemIndex) => itemIndex === index ? { ...line, quantity: Number(e.target.value) } : line) })} /></label><label>سعر الشراء<input type="number" min="0.01" step="0.01" value={item.cost} onChange={(e) => setEditingPurchase({ ...editingPurchase, items: editingPurchase.items.map((line, itemIndex) => itemIndex === index ? { ...line, cost: Number(e.target.value) } : line) })} /></label><label>سعر البيع<input type="number" min="0.01" step="0.01" value={item.salePrice} onChange={(e) => setEditingPurchase({ ...editingPurchase, items: editingPurchase.items.map((line, itemIndex) => itemIndex === index ? { ...line, salePrice: Number(e.target.value) } : line) })} /></label><button type="button" className="danger-button" onClick={() => setEditingPurchase({ ...editingPurchase, items: editingPurchase.items.filter((_, itemIndex) => itemIndex !== index) })}>حذف</button></div></div>)}</div><div className="price-preview">إجمالي الفاتورة بعد التعديل: <strong>{editingPurchase.items.reduce((sum, item) => sum + item.quantity * item.cost, 0).toLocaleString('ar-EG')} ج.م</strong></div><button className="primary-button full" type="submit">حفظ تعديل الفاتورة</button></form></div>}
      {editingProduct && <div className="modal-backdrop" onClick={() => setEditingProduct(null)}><form className="modal" onSubmit={updateProductPrices} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>تعديل بيانات المنتج</h2><p>{editingProduct.name} · المخزون الحالي {editingProduct.stock} عبوة</p></div><button type="button" className="close-button" onClick={() => setEditingProduct(null)}><X size={20} /></button></div><label>اسم المنتج<input required maxLength={120} value={editProductForm.name} onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })} /></label><label>الكمية في المخزون<input required type="number" min="0" step="1" value={editProductForm.stock} onChange={(e) => setEditProductForm({ ...editProductForm, stock: e.target.value })} /></label><label>سعر الشراء<input required type="number" min="0" step="0.01" value={editProductForm.cost} onChange={(e) => setEditProductForm({ ...editProductForm, cost: e.target.value })} /></label><label>سعر البيع<input required type="number" min="0.01" step="0.01" value={editProductForm.price} onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })} /></label><div className="price-preview">ربح الوحدة بعد التعديل: <strong>{(Number(editProductForm.price || 0) - Number(editProductForm.cost || 0)).toLocaleString('ar-EG')} ج.م</strong></div><button className="primary-button full" type="submit">حفظ التعديل</button></form></div>}
      {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><form className="modal" onSubmit={addProduct} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>إضافة منتج جديد</h2><p>أضف تفاصيل المنتج للمخزون</p></div><button type="button" className="close-button" onClick={() => setShowAdd(false)}><X size={20} /></button></div><label>اسم المنتج<input required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="مثال: دهان بلاستيك أبيض" /></label><div className="form-row"><label>كود المنتج<input value={newProduct.code} onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })} placeholder="PL-0000" /></label><label>التصنيف<select required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}><option value="">اختر التصنيف</option>{productCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label></div><div className="form-row"><label>الكمية<input required type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" /></label><label>سعر الشراء<input required type="number" min="0" step="0.01" inputMode="decimal" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })} placeholder="0.00" /></label></div><label>سعر البيع<input required type="number" min="0" step="0.01" inputMode="decimal" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" /></label><button className="primary-button full" type="submit"><PackagePlus size={18} /> حفظ المنتج</button></form></div>}
      {editingSale && <div className="modal-backdrop" onClick={() => setEditingSale(null)}><form className="modal invoice-edit-modal" onSubmit={saveEditedSale} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>تعديل الفاتورة</h2><p>{editingSale.id} · عدّل البيانات ثم احفظ التغييرات</p></div><button type="button" className="close-button" onClick={() => setEditingSale(null)}><X size={20} /></button></div><div className="form-row"><label>اسم العميل<input value={editingSale.customer} onChange={(e) => setEditingSale({ ...editingSale, customer: e.target.value })} /></label><label>المبلغ المدفوع<input type="number" min="0" step="0.01" value={editingSale.paid} onChange={(e) => setEditingSale({ ...editingSale, paid: Number(e.target.value) })} /></label></div><label>الخصم<input type="number" min="0" step="0.01" value={editingSale.discount} onChange={(e) => setEditingSale({ ...editingSale, discount: Number(e.target.value) })} /></label><div className="sale-cart"><div className="panel-header"><div><h3>أصناف الفاتورة</h3><p>عدّل الكمية أو السعر، ويمكنك حذف الصنف</p></div></div>{editingSale.items.map((item, index) => <div className="cart-row" key={`${item.code}-${index}`}><span>{item.product}<small>{item.code}</small></span><div className="form-row compact-fields"><label>الكمية<input type="number" min="1" value={item.quantity} onChange={(e) => setEditingSale({ ...editingSale, items: editingSale.items.map((line, itemIndex) => itemIndex === index ? { ...line, quantity: Number(e.target.value), total: Number(e.target.value) * line.unitPrice } : line) })} /></label><label>سعر الوحدة<input type="number" min="0.01" step="0.01" value={item.unitPrice} onChange={(e) => setEditingSale({ ...editingSale, items: editingSale.items.map((line, itemIndex) => itemIndex === index ? { ...line, unitPrice: Number(e.target.value), total: line.quantity * Number(e.target.value) } : line) })} /></label><button type="button" className="danger-button" onClick={() => setEditingSale({ ...editingSale, items: editingSale.items.filter((_, itemIndex) => itemIndex !== index) })}>حذف</button></div></div>)}</div><div className="invoice-summary"><div><span>الإجمالي بعد التعديل</span><strong>{(editingSale.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) - Math.min(Math.max(editingSale.discount, 0), editingSale.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))).toLocaleString('ar-EG')} ج.م</strong></div></div><button className="primary-button full" type="submit">حفظ تعديل الفاتورة</button></form></div>}
      {showSale && <div className="modal-backdrop" onClick={() => setShowSale(false)}><form className="modal" onSubmit={addSale} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>تسجيل فاتورة جديدة</h2><p>سجّل البيع الفعلي وسيتم خصم الكمية من المخزون</p></div><button type="button" className="close-button" onClick={() => setShowSale(false)}><X size={20} /></button></div><div className="form-row"><label>الصنف<select value={newSale.category} onChange={(e) => { setNewSale({ ...newSale, category: e.target.value, product: '' }); setSaleProductSearch('') }}><option value="">اختر الصنف</option>{productCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label htmlFor="sale-product-search">ابحث عن المنتج<input id="sale-product-search" className="table-search sale-product-search" type="search" list="sale-product-options" value={saleProductSearch} onChange={(e) => { const value = e.target.value; const selectedProduct = saleCategoryProducts.find((product) => `${product.name} — ${product.code}` === value); setSaleProductSearch(value); setNewSale({ ...newSale, product: selectedProduct?.code || '' }) }} onKeyDown={handleSaleItemKeyDown} placeholder="اكتب اسم المنتج أو الكود" autoComplete="off" /></label><datalist id="sale-product-options">{filteredSaleProducts.map((product) => <option key={product.code} value={`${product.name} — ${product.code}`} label={`متاح ${product.stock}`} />)}</datalist></div><label>الكمية<input type="number" min="1" value={newSale.quantity} onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })} onKeyDown={handleSaleItemKeyDown} /></label><button type="button" className="outline-button full" onClick={() => addItemToSale()}><Plus size={16} /> إضافة للسلة</button><div className="sale-cart">{saleItems.length ? saleItems.map((item) => <div className="cart-row" key={item.code}><span>{item.product} × {item.quantity}</span><div className="cart-row-actions"><strong>{item.total.toLocaleString('ar-EG')} ج.م</strong><button type="button" className="danger-button" onClick={() => setSaleItems(saleItems.filter((line) => line.code !== item.code))}>حذف</button></div></div>) : <small>لم تتم إضافة منتجات للفاتورة</small>}</div><div className="form-row"><label>اسم العميل<input value={newSale.customer} onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })} placeholder="عميل نقدي" /></label><label>الخصم<input type="number" min="0" value={newSale.discount} onChange={(e) => setNewSale({ ...newSale, discount: e.target.value })} /></label></div><label>ملاحظات الفاتورة<input value={newSale.notes} onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })} placeholder="اختياري" /></label><div className="invoice-totals"><span>قبل الخصم: {saleSubtotal.toLocaleString('ar-EG')} ج.م</span><strong>الإجمالي: {saleTotal.toLocaleString('ar-EG')} ج.م</strong></div><label>نوع الدفع<select value={newSale.payment} onChange={(e) => setNewSale({ ...newSale, payment: e.target.value as 'نقدي' | 'آجل', paid: e.target.value === 'نقدي' ? '' : newSale.paid })}><option value="نقدي">نقدي — مدفوع بالكامل</option><option value="آجل">آجل — على حساب العميل</option></select></label>{newSale.payment === 'آجل' && <label>المبلغ المدفوع<input required type="number" min="0" value={newSale.paid} onChange={(e) => setNewSale({ ...newSale, paid: e.target.value })} placeholder="0" /></label>}<button className="primary-button full" type="submit"><ReceiptText size={18} /> حفظ الفاتورة</button></form></div>}
      {paymentSale && <div className="modal-backdrop" onClick={() => setPaymentSale(null)}><form className="modal payment-modal" onSubmit={registerPayment} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>تسجيل دفعة</h2><p>{paymentSale.customer} — المتبقي {paymentSale.remaining.toLocaleString('ar-EG')} ج.م</p></div><button type="button" className="close-button" onClick={() => setPaymentSale(null)}><X size={20} /></button></div><label>قيمة الدفعة<input autoFocus required type="number" min="1" max={paymentSale.remaining} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" /></label><button className="primary-button full" type="submit"><WalletCards size={18} /> حفظ الدفعة</button></form></div>}
      {selectedSale && <div className="modal-backdrop" onClick={() => setSelectedSale(null)}><section className="modal invoice-preview" onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>فاتورة {selectedSale.id}</h2><p>نسخة تفصيلية قابلة للطباعة</p></div><div className="invoice-modal-actions"><button type="button" className="text-button" onClick={() => editSale(selectedSale)}>تعديل الفاتورة</button><button type="button" className="outline-button invoice-print-button" onClick={() => window.print()}><FileText size={16} /> طباعة الفاتورة</button><button type="button" className="close-button" onClick={() => setSelectedSale(null)} aria-label="إغلاق"><X size={20} /></button></div></div><div className="invoice-head"><div><strong>السيد سعد </strong><span>العميل: {selectedSale.customer}</span><span>التاريخ: {selectedSale.date}</span></div><strong>{selectedSale.id}</strong></div><div className="invoice-lines"><div className="invoice-line invoice-line-header"><span>المنتج</span><span>الكمية</span><span>سعر الوحدة</span><span>الإجمالي</span></div>{selectedSale.items.map((item) => <div className="invoice-line" key={item.code}><span className="invoice-product">{item.product}<small>{item.code}</small></span><span>{item.quantity.toLocaleString('ar-EG')}</span><span>{item.unitPrice.toLocaleString('ar-EG')} ج.م</span><strong>{item.total.toLocaleString('ar-EG')} ج.م</strong></div>)}</div><div className="invoice-summary"><div><span>قبل الخصم</span><strong>{selectedSale.subtotal.toLocaleString('ar-EG')} ج.م</strong></div><div><span>الخصم</span><strong>{selectedSale.discount.toLocaleString('ar-EG')} ج.م</strong></div><div><span>الإجمالي</span><strong>{selectedSale.total.toLocaleString('ar-EG')} ج.م</strong></div><div><span>المدفوع</span><strong>{selectedSale.paid.toLocaleString('ar-EG')} ج.م</strong></div><div><span>المتبقي</span><strong>{selectedSale.remaining.toLocaleString('ar-EG')} ج.م</strong></div></div><div className="invoice-notes">{selectedSale.notes && <span>ملاحظات: {selectedSale.notes}</span>}<span>طريقة الدفع: {selectedSale.payment}</span><span className={selectedSale.remaining > 0 ? 'invoice-due' : 'invoice-paid'}>{selectedSale.remaining > 0 ? `متبقي على العميل: ${selectedSale.remaining.toLocaleString('ar-EG')} ج.م` : 'تم سداد الفاتورة بالكامل'}</span></div><button className="primary-button full" onClick={() => window.print()}><FileText size={18} /> طباعة الفاتورة</button></section></div>}
    </div>
  )
}

function StatCard({ title, value, unit, detail, positive, icon, tone }: { title: string; value: string; unit: string; detail: string; positive?: boolean; icon: React.ReactNode; tone: string }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><p>{title}</p><div className="stat-value"><strong>{value}</strong><span>{unit}</span></div><small className={positive ? 'positive' : ''}>{positive && <TrendingUp size={13} />} {detail}</small></div> }
function ProductTable({ products, emptyMessage, onEdit, onDelete }: { products: Product[]; emptyMessage: string; onEdit?: (product: Product) => void; onDelete?: (product: Product) => void }) { if (!products.length) return <div className="empty-state"><Boxes size={28} /><strong>لا توجد بيانات بعد</strong><p>{emptyMessage}</p></div>; return <div className="table-wrap"><table><thead><tr><th>المنتج</th><th>التصنيف</th><th>المخزون</th><th>سعر الشراء</th><th>سعر البيع</th><th>ربح الوحدة</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>{products.map((p) => <tr key={p.code}><td><div className="product-cell"><div className="product-swatch" style={{ background: p.color }} /><div><strong>{p.name}</strong><span>{p.code}</span></div></div></td><td>{p.category}</td><td>{p.stock} عبوة</td><td>{p.cost.toLocaleString('ar-EG')} ج.م</td><td>{p.price.toLocaleString('ar-EG')} ج.م</td><td><strong className={p.price - p.cost >= 0 ? 'positive' : 'negative'}>{(p.price - p.cost).toLocaleString('ar-EG')} ج.م</strong></td><td><span className={`badge ${p.stock <= 5 ? 'warning' : 'good'}`}>{p.stock <= 5 ? 'مخزون منخفض' : 'متوفر'}</span></td><td><div className="row-actions">{onEdit && <button className="text-button" onClick={() => onEdit(p)}>تعديل</button>}{onDelete && <button className="danger-button" onClick={() => onDelete(p)}>حذف</button>}</div></td></tr>)}</tbody></table></div>}
