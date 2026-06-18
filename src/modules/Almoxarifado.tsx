import { useState } from 'react';
import { useStore } from '../store';
import SmartInput from '../components/SmartInput';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Building2, 
  Search, Plus, ArrowUpCircle, ArrowDownCircle, AlertTriangle, 
  Calendar, Eye, X, ChevronRight, Home, TrendingUp, AlertCircle, Clock
} from 'lucide-react';
import type { StockItem, StockMovement, PurchaseOrder, PurchaseOrderItem, Invoice, InvoiceItem } from '../types';

type AlmTab = 'dashboard' | 'estoque' | 'pedidos' | 'notas' | 'fornecedores';

export default function Almoxarifado() {
  const store = useStore();
  const { 
    stockItems, stockMovements, addStockItem, addStockMovement, currentUser,
    purchaseOrders, addPurchaseOrder, updatePurchaseOrder,
    invoices, addInvoice, suppliers, addSupplier 
  } = store;

  const [tab, setTab] = useState<AlmTab>('dashboard');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'expiring'>('all');

  // Modals
  const [showAddItem, setShowAddItem] = useState(false);
  const [showMovement, setShowMovement] = useState<StockItem | null>(null);
  const [showNewPO, setShowNewPO] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showPODetail, setShowPODetail] = useState<PurchaseOrder | null>(null);
  const [showNewSupplier, setShowNewSupplier] = useState(false);

  // Form states
  const [iName, setIName] = useState(''); const [iCode, setICode] = useState('');
  const [iCat, setICat] = useState('Medicamentos'); const [iQty, setIQty] = useState('');
  const [iMin, setIMin] = useState(''); const [iUnit, setIUnit] = useState('');
  const [iLoc, setILoc] = useState(''); const [iExp, setIExp] = useState('');
  const [iCost, setICost] = useState(''); const [iSup, setISup] = useState('');

  const [movType, setMovType] = useState<'entrada' | 'saida'>('entrada');
  const [movQty, setMovQty] = useState(''); const [movReason, setMovReason] = useState('');

  const [poSup, setPoSup] = useState(''); const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([]);
  const [poItemId, setPoItemId] = useState(''); const [poItemQty, setPoItemQty] = useState('');
  const [poItemCost, setPoItemCost] = useState('');

  const [invNum, setInvNum] = useState(''); const [invSeries, setInvSeries] = useState('');
  const [invPO, setInvPO] = useState(''); const [invDate, setInvDate] = useState('');
  const [invNotes, setInvNotes] = useState('');
  const [invItems, setInvItems] = useState<InvoiceItem[]>([]);
  const [invItemIdx, setInvItemIdx] = useState(''); const [invItemQty, setInvItemQty] = useState('');
  const [invItemBatch, setInvItemBatch] = useState(''); const [invItemExp, setInvItemExp] = useState('');

  const [supName, setSupName] = useState(''); const [supCnpj, setSupCnpj] = useState('');
  const [supPhone, setSupPhone] = useState(''); const [supEmail, setSupEmail] = useState('');
  const [supAddr, setSupAddr] = useState('');

  const filtered = stockItems.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'low') return i.quantity <= i.minQuantity;
    if (filter === 'expiring') return new Date(i.expiryDate).getTime() - Date.now() < 90 * 86400000;
    return true;
  });

  // Business Logic Handlers
  const handleAddItem = () => {
    if (!iName || !iCode) return;
    const item: StockItem = { id: `s${Date.now()}`, name: iName, code: iCode, category: iCat, quantity: parseInt(iQty) || 0, minQuantity: parseInt(iMin) || 0, unit: iUnit, location: iLoc, expiryDate: iExp, unitCost: parseFloat(iCost) || 0, supplierId: iSup, lastEntryDate: new Date().toISOString().split('T')[0] };
    addStockItem(item);
    setShowAddItem(false); setIName(''); setICode(''); setIQty(''); setIMin(''); setIUnit(''); setILoc(''); setIExp(''); setICost(''); setISup('');
  };

  const handleMovement = () => {
    if (!showMovement || !movQty) return;
    const mov: StockMovement = { id: `m${Date.now()}`, itemId: showMovement.id, type: movType, quantity: parseInt(movQty) || 0, reason: movReason, timestamp: new Date().toISOString(), userId: currentUser?.id || '', userName: currentUser?.name || '' };
    addStockMovement(mov);
    setShowMovement(null); setMovQty(''); setMovReason('');
  };

  const addPOItem = () => {
    const item = stockItems.find(i => i.id === poItemId);
    if (!item || !poItemQty) return;
    setPoItems([...poItems, { id: `poi${Date.now()}`, stockItemId: item.id, stockItemName: item.name, stockItemCode: item.code, quantity: parseInt(poItemQty) || 0, unitCost: parseFloat(poItemCost) || item.unitCost, receivedQuantity: 0 }]);
    setPoItemId(''); setPoItemQty(''); setPoItemCost('');
  };

  const createPO = () => {
    if (!poSup || poItems.length === 0) return;
    const sup = suppliers.find(s => s.id === poSup);
    const total = poItems.reduce((s, i) => s + i.quantity * i.unitCost, 0);
    const po: PurchaseOrder = { id: `po${Date.now()}`, number: `PC-2026-${String(purchaseOrders.length + 1).padStart(4, '0')}`, supplierId: poSup, supplierName: sup?.name || '', status: 'AGUARDANDO_APROVACAO', items: poItems, requestedBy: currentUser?.id || '', requestedByName: currentUser?.name || '', approvedBy: null, approvedByName: null, createdAt: new Date().toISOString(), approvedAt: null, notes: poNotes, totalValue: total };
    addPurchaseOrder(po);
    setShowNewPO(false); setPoSup(''); setPoNotes(''); setPoItems([]);
  };

  const approvePO = (po: PurchaseOrder) => {
    updatePurchaseOrder({ ...po, status: 'APROVADO', approvedBy: currentUser?.id || '', approvedByName: currentUser?.name || '', approvedAt: new Date().toISOString() });
    setShowPODetail(null);
  };

  const createInvoice = () => {
    if (!invNum || !invPO) return;
    const selectedPO = purchaseOrders.find(p => p.id === invPO);
    if (!selectedPO || invItems.length === 0) return;
    const total = invItems.reduce((s, i) => s + i.totalCost, 0);
    const inv: Invoice = { id: `inv${Date.now()}`, number: invNum, series: invSeries, supplierId: selectedPO.supplierId, supplierName: selectedPO.supplierName, purchaseOrderId: selectedPO.id, purchaseOrderNumber: selectedPO.number, issueDate: invDate, entryDate: new Date().toISOString().split('T')[0], items: invItems, totalValue: total, status: 'ENTRADA_REALIZADA', receivedBy: currentUser?.id || '', receivedByName: currentUser?.name || '', notes: invNotes };
    addInvoice(inv);
    invItems.forEach(ii => {
      addStockMovement({ id: `m${Date.now()}${ii.id}`, itemId: ii.stockItemId, type: 'entrada', quantity: ii.quantity, reason: `NF ${invNum} - PC ${selectedPO.number}`, timestamp: new Date().toISOString(), userId: currentUser?.id || '', userName: currentUser?.name || '', invoiceId: inv.id, purchaseOrderId: selectedPO.id, batch: ii.batch });
    });
    const updatedItems = selectedPO.items.map(poi => {
      const received = invItems.filter(ii => ii.stockItemId === poi.stockItemId).reduce((s, ii) => s + ii.quantity, 0);
      return { ...poi, receivedQuantity: poi.receivedQuantity + received };
    });
    const allReceived = updatedItems.every(i => i.receivedQuantity >= i.quantity);
    updatePurchaseOrder({ ...selectedPO, items: updatedItems, status: allReceived ? 'RECEBIDO_TOTAL' : 'RECEBIDO_PARCIAL' });
    setShowNewInvoice(false); setInvNum(''); setInvSeries(''); setInvPO(''); setInvDate(''); setInvNotes(''); setInvItems([]);
  };

  const handleAddSupplier = () => {
    if (!supName || !supCnpj) return;
    addSupplier({ id: `sup${Date.now()}`, name: supName, cnpj: supCnpj, phone: supPhone, email: supEmail, address: supAddr });
    setShowNewSupplier(false); setSupName(''); setSupCnpj(''); setSupPhone(''); setSupEmail(''); setSupAddr('');
  };

  const Modal = ({ title, icon, color, onClose, children }: { title: string; icon: React.ReactNode; color: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between p-5 ${color} text-white rounded-t-2xl`}>
          <div className="flex items-center gap-3">{icon}<h3 className="font-bold text-sm">{title}</h3></div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      {/* Sidebar Interna do Módulo */}
      <aside className="w-64 bg-[#0f172a] text-slate-400 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800/50">
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <Package className="text-cyan-500 w-5 h-5" /> 
            <span>ALMOX<span className="text-cyan-500">PRO</span></span>
          </h1>
          <p className="text-[10px] mt-1 text-slate-500 uppercase tracking-wider font-semibold">Módulo Hospitalar</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[10px] px-3 py-2 text-slate-600 uppercase font-bold tracking-widest">Principal</div>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'estoque', label: 'Estoque', icon: Package },
            { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
            { id: 'notas', label: 'Recebimento', icon: FileText },
            { id: 'fornecedores', label: 'Fornecedores', icon: Building2 },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as AlmTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === item.id 
                ? 'bg-cyan-500/10 text-white border-l-2 border-cyan-500' 
                : 'hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-4 h-4 ${tab === item.id ? 'text-cyan-500' : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800/50">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Status do Estoque</p>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span>Itens Críticos</span>
                <span className="text-red-400 font-bold">{stockItems.filter(i => i.quantity <= i.minQuantity).length}</span>
              </div>
              <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Área de Conteúdo */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800 capitalize">{tab}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Home className="w-3 h-3" /> <ChevronRight className="w-2 h-2" /> <span>Almoxarifado</span> <ChevronRight className="w-2 h-2" /> <span className="text-cyan-600 font-medium">{tab}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{currentUser?.role}</p>
            </div>
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold border-2 border-white shadow-sm">
              {currentUser?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Package className="w-6 h-6" /></div>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium">Total de Itens</h3>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stockItems.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600"><AlertCircle className="w-6 h-6" /></div>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium">Estoque Baixo</h3>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stockItems.filter(i => i.quantity <= i.minQuantity).length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Clock className="w-6 h-6" /></div>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium">Pedidos em Aberto</h3>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{purchaseOrders.filter(p => p.status === 'AGUARDANDO_APROVACAO').length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium">Movimentações</h3>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stockMovements.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Movimentações Recentes</h3>
                    <button onClick={() => setTab('estoque')} className="text-cyan-600 text-xs font-bold hover:underline">Ver Tudo</button>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[400px] overflow-auto">
                    {stockMovements.slice(-8).reverse().map(m => {
                      const item = stockItems.find(i => i.id === m.itemId);
                      return (
                        <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${m.type === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {m.type === 'entrada' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">{item?.name || 'Item Removido'}</p>
                              <p className="text-[10px] text-slate-400">{new Date(m.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${m.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="font-bold text-slate-800 mb-6">Itens com Estoque Baixo</h3>
                  <div className="space-y-4">
                    {stockItems.filter(i => i.quantity <= i.minQuantity).slice(0, 6).map(item => (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-800">{item.quantity} / {item.minQuantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'estoque' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar produtos..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setFilter('all')} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-500'}`}>Todos</button>
                  <button onClick={() => setFilter('low')} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${filter === 'low' ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-500'}`}>Baixo</button>
                  <button onClick={() => setShowAddItem(true)} className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Novo Produto
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produto</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qtd</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-slate-700">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{item.code}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{item.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${item.quantity <= item.minQuantity ? 'text-red-500' : 'text-slate-700'}`}>{item.quantity} {item.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setShowMovement(item); setMovType('entrada'); }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><ArrowUpCircle className="w-4 h-4" /></button>
                            <button onClick={() => { setShowMovement(item); setMovType('saida'); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><ArrowDownCircle className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'pedidos' && (
            <div className="bg-white p-12 rounded-2xl text-center border border-slate-100">
              <ShoppingCart className="w-12 h-12 text-cyan-100 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Pedidos de Compra</h3>
              <p className="text-slate-500 text-sm mt-1">Gerencie suas solicitações de compra aqui.</p>
              <button onClick={() => setShowNewPO(true)} className="mt-6 bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold">Novo Pedido</button>
            </div>
          )}

          {tab === 'notas' && (
            <div className="bg-white p-12 rounded-2xl text-center border border-slate-100">
              <FileText className="w-12 h-12 text-blue-100 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Entrada de Notas</h3>
              <p className="text-slate-500 text-sm mt-1">Registre as notas fiscais recebidas.</p>
              <button onClick={() => setShowNewInvoice(true)} className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold">Lançar Nota</button>
            </div>
          )}

          {tab === 'fornecedores' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suppliers.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <Building2 className="w-8 h-8 text-slate-200 mb-4" />
                  <h4 className="font-bold text-slate-800">{s.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{s.cnpj}</p>
                </div>
              ))}
              <button onClick={() => setShowNewSupplier(true)} className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-slate-400 hover:border-cyan-500 hover:text-cyan-500 transition-all font-bold text-sm flex flex-col items-center justify-center">
                <Plus className="w-6 h-6 mb-2" /> Novo Fornecedor
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddItem && (
        <Modal title="Novo Item" icon={<Package className="w-5 h-5" />} color="bg-[#0f172a]" onClose={() => setShowAddItem(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <SmartInput routineCode="ALM01" fieldName="itemName" value={iName} onChange={setIName} label="Nome" placeholder="Ex: Gaze Estéril" />
              <SmartInput routineCode="ALM01" fieldName="itemCode" value={iCode} onChange={setICode} label="Código" placeholder="Ex: MAT-001" />
            </div>
            <button onClick={handleAddItem} className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold">Salvar Item</button>
          </div>
        </Modal>
      )}

      {showMovement && (
        <Modal title={`${movType === 'entrada' ? 'Entrada' : 'Saída'} - ${showMovement.name}`} icon={<ArrowUpCircle className="w-5 h-5" />} color={movType === 'entrada' ? 'bg-emerald-600' : 'bg-red-600'} onClose={() => setShowMovement(null)}>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl text-center">
              <p className="text-xs text-slate-500 uppercase font-bold">Estoque Atual</p>
              <p className="text-3xl font-bold text-slate-900">{showMovement.quantity}</p>
            </div>
            <SmartInput routineCode="ALM01" fieldName="quantity" value={movQty} onChange={setMovQty} label="Quantidade" type="number" />
            <button onClick={handleMovement} className={`w-full py-3 rounded-xl text-white font-bold ${movType === 'entrada' ? 'bg-emerald-600' : 'bg-red-600'}`}>Confirmar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
