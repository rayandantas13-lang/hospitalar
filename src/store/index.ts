import { create } from 'zustand';
import type {
  User, Attendance, StockItem, StockMovement, RoutineConfig,
  Patient, ModuleType, CallEntry, Supplier, PurchaseOrder, Invoice
} from '../types';

// ========== SEED DATA ==========
const defaultRoutines: RoutineConfig[] = [
  {
    code: 'REC01', name: 'Cadastro de Cidadão', module: 'recepcao',
    description: 'Rotina de cadastro e admissão de pacientes na recepção',
    fields: [
      { routineCode: 'REC01', fieldName: 'name', label: 'Nome Completo', maxLength: 120, required: true, visible: true, editable: true },
      { routineCode: 'REC01', fieldName: 'socialName', label: 'Nome Social', maxLength: 120, required: false, visible: true, editable: true },
      { routineCode: 'REC01', fieldName: 'cpf', label: 'CPF', maxLength: 14, required: true, visible: true, editable: true },
      { routineCode: 'REC01', fieldName: 'birthDate', label: 'Data de Nascimento', maxLength: 10, required: true, visible: true, editable: true },
      { routineCode: 'REC01', fieldName: 'profession', label: 'Profissão', maxLength: 80, required: false, visible: true, editable: true },
      { routineCode: 'REC01', fieldName: 'phone', label: 'Telefone', maxLength: 15, required: false, visible: true, editable: true },
      { routineCode: 'REC01', fieldName: 'address', label: 'Endereço', maxLength: 200, required: false, visible: true, editable: true },
    ]
  },
  {
    code: 'TRI01', name: 'Triagem - Sinais Vitais', module: 'triagem',
    description: 'Rotina de coleta de sinais vitais na triagem',
    fields: [
      { routineCode: 'TRI01', fieldName: 'pa', label: 'Pressão Arterial', maxLength: 7, required: true, visible: true, editable: true },
      { routineCode: 'TRI01', fieldName: 'fc', label: 'Frequência Cardíaca', maxLength: 5, required: true, visible: true, editable: true },
      { routineCode: 'TRI01', fieldName: 'satO2', label: 'Saturação O2', maxLength: 5, required: true, visible: true, editable: true },
      { routineCode: 'TRI01', fieldName: 'temp', label: 'Temperatura', maxLength: 5, required: true, visible: true, editable: true },
      { routineCode: 'TRI01', fieldName: 'glicemia', label: 'Glicemia', maxLength: 5, required: false, visible: true, editable: true },
      { routineCode: 'TRI01', fieldName: 'peso', label: 'Peso (kg)', maxLength: 6, required: false, visible: true, editable: true },
      { routineCode: 'TRI01', fieldName: 'altura', label: 'Altura (cm)', maxLength: 6, required: false, visible: true, editable: true },
    ]
  },
  {
    code: 'TRI02', name: 'Triagem - Queixa e Classificação', module: 'triagem',
    description: 'Rotina de queixa principal e classificação de risco',
    fields: [
      { routineCode: 'TRI02', fieldName: 'mainComplaint', label: 'Queixa Principal', maxLength: 1000, required: true, visible: true, editable: true },
      { routineCode: 'TRI02', fieldName: 'riskClassification', label: 'Classificação de Risco', maxLength: 20, required: true, visible: true, editable: true },
    ]
  },
  {
    code: 'CONS01', name: 'Consultório - Anamnese', module: 'consultorio',
    description: 'Rotina de anamnese e história da doença',
    fields: [
      { routineCode: 'CONS01', fieldName: 'history', label: 'História da Doença', maxLength: 5000, required: true, visible: true, editable: true },
      { routineCode: 'CONS01', fieldName: 'physicalExam', label: 'Exame Físico', maxLength: 5000, required: true, visible: true, editable: true },
      { routineCode: 'CONS01', fieldName: 'diagnosis', label: 'Diagnóstico', maxLength: 500, required: true, visible: true, editable: true },
      { routineCode: 'CONS01', fieldName: 'cidCode', label: 'CID - Código', maxLength: 10, required: false, visible: true, editable: true },
    ]
  },
  {
    code: 'CONS02', name: 'Consultório - Prescrição', module: 'consultorio',
    description: 'Rotina de prescrição médica',
    fields: [
      { routineCode: 'CONS02', fieldName: 'medication', label: 'Medicamento', maxLength: 200, required: true, visible: true, editable: true },
      { routineCode: 'CONS02', fieldName: 'dosage', label: 'Dosagem', maxLength: 100, required: true, visible: true, editable: true },
      { routineCode: 'CONS02', fieldName: 'route', label: 'Via', maxLength: 50, required: true, visible: true, editable: true },
      { routineCode: 'CONS02', fieldName: 'frequency', label: 'Frequência', maxLength: 100, required: true, visible: true, editable: true },
    ]
  },
  {
    code: 'ALM01', name: 'Almoxarifado - Estoque', module: 'almoxarifado',
    description: 'Rotina de controle de estoque',
    fields: [
      { routineCode: 'ALM01', fieldName: 'itemName', label: 'Nome do Item', maxLength: 200, required: true, visible: true, editable: true },
      { routineCode: 'ALM01', fieldName: 'itemCode', label: 'Código', maxLength: 20, required: true, visible: true, editable: true },
      { routineCode: 'ALM01', fieldName: 'quantity', label: 'Quantidade', maxLength: 10, required: true, visible: true, editable: true },
    ]
  },
  {
    code: 'ALM02', name: 'Almoxarifado - Pedido de Compra', module: 'almoxarifado',
    description: 'Rotina de pedidos de compra',
    fields: [
      { routineCode: 'ALM02', fieldName: 'supplier', label: 'Fornecedor', maxLength: 200, required: true, visible: true, editable: true },
      { routineCode: 'ALM02', fieldName: 'notes', label: 'Observações', maxLength: 1000, required: false, visible: true, editable: true },
    ]
  },
  {
    code: 'ALM03', name: 'Almoxarifado - Nota Fiscal', module: 'almoxarifado',
    description: 'Rotina de entrada de mercadoria por nota fiscal',
    fields: [
      { routineCode: 'ALM03', fieldName: 'invoiceNumber', label: 'Número da NF', maxLength: 50, required: true, visible: true, editable: true },
      { routineCode: 'ALM03', fieldName: 'series', label: 'Série', maxLength: 10, required: true, visible: true, editable: true },
    ]
  },
  {
    code: 'SV01', name: 'Sala Vermelha - Emergência', module: 'sala_vermelha',
    description: 'Rotina de atendimento emergencial na sala vermelha',
    fields: [
      { routineCode: 'SV01', fieldName: 'pa', label: 'Pressão Arterial', maxLength: 7, required: true, visible: true, editable: true },
      { routineCode: 'SV01', fieldName: 'fc', label: 'Frequência Cardíaca', maxLength: 5, required: true, visible: true, editable: true },
      { routineCode: 'SV01', fieldName: 'satO2', label: 'Saturação O2', maxLength: 5, required: true, visible: true, editable: true },
      { routineCode: 'SV01', fieldName: 'glasgow', label: 'Escala Glasgow', maxLength: 3, required: true, visible: true, editable: true },
      { routineCode: 'SV01', fieldName: 'procedures', label: 'Procedimentos', maxLength: 5000, required: true, visible: true, editable: true },
    ]
  },
];

const defaultUsers: User[] = [
  {
    id: '1', name: 'Administrador Geral', username: 'admin', password: 'admin123',
    role: 'admin', unit: 'UPA Central', avatar: 'AG',
    permissions: [
      { module: 'admin', routines: ['*'] },
      { module: 'recepcao', routines: ['*'] },
      { module: 'triagem', routines: ['*'] },
      { module: 'consultorio', routines: ['*'] },
      { module: 'almoxarifado', routines: ['*'] },
      { module: 'sala_vermelha', routines: ['*'] },
      { module: 'painel_chamada', routines: ['*'] },
    ]
  },
  {
    id: '2', name: 'Dr. Carlos Silva', username: 'carlos', password: '123456',
    role: 'medico', unit: 'UPA Central', avatar: 'CS',
    permissions: [
      { module: 'consultorio', routines: ['CONS01', 'CONS02'] },
      { module: 'sala_vermelha', routines: ['SV01'] },
      { module: 'painel_chamada', routines: ['*'] },
    ]
  },
  {
    id: '3', name: 'Enf. Maria Santos', username: 'maria', password: '123456',
    role: 'enfermeiro', unit: 'UPA Central', avatar: 'MS',
    permissions: [
      { module: 'triagem', routines: ['TRI01', 'TRI02'] },
      { module: 'sala_vermelha', routines: ['SV01'] },
      { module: 'painel_chamada', routines: ['*'] },
    ]
  },
  {
    id: '4', name: 'Ana Oliveira', username: 'ana', password: '123456',
    role: 'recepcionista', unit: 'UPA Central', avatar: 'AO',
    permissions: [
      { module: 'recepcao', routines: ['REC01'] },
      { module: 'painel_chamada', routines: ['*'] },
    ]
  },
  {
    id: '5', name: 'João Farmacêutico', username: 'joao', password: '123456',
    role: 'farmaceutico', unit: 'UPA Central', avatar: 'JF',
    permissions: [
      { module: 'almoxarifado', routines: ['ALM01', 'ALM02', 'ALM03'] },
    ]
  },
];

const samplePatients: Patient[] = [
  { id: 'p1', name: 'José Antônio Pereira', socialName: 'José', cpf: '123.456.789-00', birthDate: '1985-03-15', age: 41, profession: 'Motorista', isTourist: false, hasCompanion: true, companionName: 'Maria Pereira', phone: '(11) 99999-0001', address: 'Rua das Flores, 123' },
  { id: 'p2', name: 'Fernanda Costa Lima', socialName: 'Fernanda', cpf: '987.654.321-00', birthDate: '1992-07-22', age: 33, profession: 'Professora', isTourist: true, hasCompanion: false, companionName: '', phone: '(21) 98888-0002', address: 'Av. Brasil, 456' },
  { id: 'p3', name: 'Ricardo Mendes Silva', socialName: 'Ricardo', cpf: '456.789.123-00', birthDate: '1978-11-08', age: 47, profession: 'Engenheiro', isTourist: false, hasCompanion: true, companionName: 'Ana Silva', phone: '(31) 97777-0003', address: 'Rua do Sol, 789' },
  { id: 'p4', name: 'Clara Maria dos Santos', socialName: 'Clara', cpf: '321.654.987-00', birthDate: '2000-01-30', age: 26, profession: 'Estudante', isTourist: false, hasCompanion: false, companionName: '', phone: '(41) 96666-0004', address: 'Rua Nova, 321' },
  { id: 'p5', name: 'Pedro Henrique Alves', socialName: 'Pedro', cpf: '111.222.333-44', birthDate: '1965-09-12', age: 60, profession: 'Aposentado', isTourist: false, hasCompanion: true, companionName: 'Lúcia Alves', phone: '(11) 95555-0005', address: 'Rua Velha, 50' },
];

const sampleAttendances: Attendance[] = [
  {
    id: 'a1', patient: samplePatients[0], entryTime: new Date(Date.now() - 3600000).toISOString(),
    status: 'AGUARDANDO_TRIAGEM', riskClassification: null, mainComplaint: '',
    vitalSigns: null, medicalRecord: null, assignedDoctor: null, assignedNurse: null,
    isRedRoom: false, printLog: []
  },
  {
    id: 'a2', patient: samplePatients[1], entryTime: new Date(Date.now() - 7200000).toISOString(),
    status: 'AGUARDANDO_MEDICO', riskClassification: 'amarelo',
    mainComplaint: 'Paciente relata dor intensa em região abdominal há 2 dias',
    vitalSigns: { pa: '130/85', fc: '88', satO2: '97', temp: '37.2', glicemia: '110', peso: '65', altura: '165', timestamp: new Date(Date.now() - 5400000).toISOString() },
    medicalRecord: null, assignedDoctor: null, assignedNurse: '3',
    isRedRoom: false, printLog: []
  },
  {
    id: 'a3', patient: samplePatients[2], entryTime: new Date(Date.now() - 1800000).toISOString(),
    status: 'AGUARDANDO_TRIAGEM', riskClassification: null, mainComplaint: '',
    vitalSigns: null, medicalRecord: null, assignedDoctor: null, assignedNurse: null,
    isRedRoom: false, printLog: []
  },
  {
    id: 'a4', patient: samplePatients[3], entryTime: new Date(Date.now() - 900000).toISOString(),
    status: 'EM_ATENDIMENTO', riskClassification: 'vermelho',
    mainComplaint: 'Dor torácica aguda, dispneia',
    vitalSigns: { pa: '180/110', fc: '120', satO2: '91', temp: '36.8', glicemia: '95', peso: '58', altura: '160', timestamp: new Date(Date.now() - 600000).toISOString() },
    medicalRecord: null, assignedDoctor: '2', assignedNurse: '3',
    isRedRoom: true, printLog: []
  },
  {
    id: 'a5', patient: samplePatients[4], entryTime: new Date(Date.now() - 4500000).toISOString(),
    status: 'AGUARDANDO_MEDICO', riskClassification: 'verde',
    mainComplaint: 'Dor lombar crônica, piora há 3 dias',
    vitalSigns: { pa: '140/90', fc: '72', satO2: '98', temp: '36.5', glicemia: '130', peso: '82', altura: '175', timestamp: new Date(Date.now() - 3600000).toISOString() },
    medicalRecord: null, assignedDoctor: null, assignedNurse: '3',
    isRedRoom: false, printLog: []
  },
];

const sampleSuppliers: Supplier[] = [
  { id: 'sup1', name: 'MedFarma Distribuidora', cnpj: '12.345.678/0001-90', phone: '(11) 3333-1111', email: 'contato@medfarma.com', address: 'Rua Industrial, 500, SP' },
  { id: 'sup2', name: 'HospSupply Ltda', cnpj: '98.765.432/0001-10', phone: '(21) 4444-2222', email: 'vendas@hospsupply.com', address: 'Av. Comercial, 800, RJ' },
  { id: 'sup3', name: 'BioMed Equipamentos', cnpj: '55.666.777/0001-33', phone: '(31) 5555-3333', email: 'compras@biomed.com', address: 'Rod. Fernão Dias, Km 10, MG' },
];

const sampleStock: StockItem[] = [
  { id: 's1', name: 'Dipirona Sódica 500mg', code: 'MED-0001', category: 'Medicamentos', quantity: 500, minQuantity: 100, unit: 'comprimidos', location: 'Estante A-01', expiryDate: '2027-06-15', unitCost: 0.35, supplierId: 'sup1', lastEntryDate: '2025-12-01' },
  { id: 's2', name: 'Soro Fisiológico 0,9% 500ml', code: 'SOL-0001', category: 'Soluções', quantity: 200, minQuantity: 50, unit: 'frascos', location: 'Estante B-02', expiryDate: '2027-12-01', unitCost: 4.50, supplierId: 'sup1', lastEntryDate: '2025-11-15' },
  { id: 's3', name: 'Luvas Procedimento Látex M', code: 'MAT-0001', category: 'Materiais', quantity: 1000, minQuantity: 200, unit: 'pares', location: 'Estante C-03', expiryDate: '2028-03-20', unitCost: 0.80, supplierId: 'sup2', lastEntryDate: '2025-10-20' },
  { id: 's4', name: 'Amoxicilina 500mg', code: 'MED-0002', category: 'Medicamentos', quantity: 30, minQuantity: 50, unit: 'cápsulas', location: 'Estante A-02', expiryDate: '2026-09-10', unitCost: 1.20, supplierId: 'sup1', lastEntryDate: '2025-08-05' },
  { id: 's5', name: 'Agulha Descartável 25x7', code: 'MAT-0002', category: 'Materiais', quantity: 800, minQuantity: 300, unit: 'unidades', location: 'Estante C-01', expiryDate: '2028-01-15', unitCost: 0.15, supplierId: 'sup2', lastEntryDate: '2025-09-12' },
  { id: 's6', name: 'Paracetamol 750mg', code: 'MED-0003', category: 'Medicamentos', quantity: 750, minQuantity: 150, unit: 'comprimidos', location: 'Estante A-01', expiryDate: '2027-08-20', unitCost: 0.28, supplierId: 'sup1', lastEntryDate: '2025-11-01' },
  { id: 's7', name: 'Cateter Intravenoso 20G', code: 'MAT-0003', category: 'Materiais', quantity: 45, minQuantity: 100, unit: 'unidades', location: 'Estante C-02', expiryDate: '2027-05-10', unitCost: 3.50, supplierId: 'sup3', lastEntryDate: '2025-07-18' },
  { id: 's8', name: 'Omeprazol 20mg', code: 'MED-0004', category: 'Medicamentos', quantity: 320, minQuantity: 80, unit: 'cápsulas', location: 'Estante A-03', expiryDate: '2027-04-15', unitCost: 0.95, supplierId: 'sup1', lastEntryDate: '2025-10-10' },
];

const samplePurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po1', number: 'PC-2026-0001', supplierId: 'sup1', supplierName: 'MedFarma Distribuidora',
    status: 'APROVADO', requestedBy: '5', requestedByName: 'João Farmacêutico',
    approvedBy: '1', approvedByName: 'Administrador Geral',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Reposição urgente de estoque',
    totalValue: 540.00,
    items: [
      { id: 'poi1', stockItemId: 's4', stockItemName: 'Amoxicilina 500mg', stockItemCode: 'MED-0002', quantity: 200, unitCost: 1.20, receivedQuantity: 0 },
      { id: 'poi2', stockItemId: 's7', stockItemName: 'Cateter Intravenoso 20G', stockItemCode: 'MAT-0003', quantity: 100, unitCost: 3.00, receivedQuantity: 0 },
    ]
  },
  {
    id: 'po2', number: 'PC-2026-0002', supplierId: 'sup2', supplierName: 'HospSupply Ltda',
    status: 'AGUARDANDO_APROVACAO', requestedBy: '5', requestedByName: 'João Farmacêutico',
    approvedBy: null, approvedByName: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    approvedAt: null,
    notes: 'Materiais para próximo mês',
    totalValue: 1350.00,
    items: [
      { id: 'poi3', stockItemId: 's3', stockItemName: 'Luvas Procedimento Látex M', stockItemCode: 'MAT-0001', quantity: 500, unitCost: 0.80, receivedQuantity: 0 },
      { id: 'poi4', stockItemId: 's5', stockItemName: 'Agulha Descartável 25x7', stockItemCode: 'MAT-0002', quantity: 1000, unitCost: 0.15, receivedQuantity: 0 },
      { id: 'poi5', stockItemId: 's6', stockItemName: 'Paracetamol 750mg', stockItemCode: 'MED-0003', quantity: 3000, unitCost: 0.28, receivedQuantity: 0 },
    ]
  },
];

// ========== STORE ==========
interface AppState {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  currentModule: ModuleType | 'login' | 'dashboard';
  currentView: string;
  setModule: (m: ModuleType | 'login' | 'dashboard') => void;
  setView: (v: string) => void;

  routines: RoutineConfig[];
  updateRoutine: (routine: RoutineConfig) => void;
  getFieldConfig: (routineCode: string, fieldName: string) => import('../types').FieldConfig | undefined;

  attendances: Attendance[];
  addAttendance: (attendance: Attendance) => void;
  updateAttendance: (id: string, data: Partial<Attendance>) => void;

  callQueue: CallEntry[];
  addCall: (entry: CallEntry) => void;
  removeCall: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (s: Supplier) => void;
  updateSupplier: (s: Supplier) => void;

  stockItems: StockItem[];
  stockMovements: StockMovement[];
  addStockItem: (item: StockItem) => void;
  updateStockItem: (item: StockItem) => void;
  addStockMovement: (movement: StockMovement) => void;

  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrder: (po: PurchaseOrder) => void;

  invoices: Invoice[];
  addInvoice: (inv: Invoice) => void;
  updateInvoice: (inv: Invoice) => void;

  showFieldInfo: { routineCode: string; fieldName: string } | null;
  setShowFieldInfo: (info: { routineCode: string; fieldName: string } | null) => void;

  hasPermission: (module: ModuleType, routine?: string) => boolean;

  // Selectedattendance for triagem/consultorio flow
  selectedAttendanceId: string | null;
  setSelectedAttendanceId: (id: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: defaultUsers,

  login: (username, password) => {
    const user = get().users.find(u => u.username === username && u.password === password);
    if (user) {
      set({ currentUser: user, currentModule: 'dashboard', currentView: 'list' });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null, currentModule: 'login', currentView: 'list' }),

  addUser: (user) => set(s => ({ users: [...s.users, user] })),
  updateUser: (user) => set(s => ({ users: s.users.map(u => u.id === user.id ? user : u) })),
  deleteUser: (id) => set(s => ({ users: s.users.filter(u => u.id !== id) })),

  currentModule: 'login',
  currentView: 'list',
  setModule: (m) => set({ currentModule: m, currentView: 'list' }),
  setView: (v) => set({ currentView: v }),

  routines: defaultRoutines,
  updateRoutine: (routine) => set(s => ({
    routines: s.routines.map(r => r.code === routine.code ? routine : r)
  })),
  getFieldConfig: (routineCode, fieldName) => {
    const routine = get().routines.find(r => r.code === routineCode);
    return routine?.fields.find(f => f.fieldName === fieldName);
  },

  attendances: sampleAttendances,
  addAttendance: (attendance) => set(s => ({ attendances: [...s.attendances, attendance] })),
  updateAttendance: (id, data) => set(s => ({
    attendances: s.attendances.map(a => a.id === id ? { ...a, ...data } : a)
  })),

  callQueue: [],
  addCall: (entry) => set(s => ({ callQueue: [entry, ...s.callQueue].slice(0, 20) })),
  removeCall: (id) => set(s => ({ callQueue: s.callQueue.filter(c => c.id !== id) })),

  suppliers: sampleSuppliers,
  addSupplier: (s) => set(st => ({ suppliers: [...st.suppliers, s] })),
  updateSupplier: (s) => set(st => ({ suppliers: st.suppliers.map(x => x.id === s.id ? s : x) })),

  stockItems: sampleStock,
  stockMovements: [],
  addStockItem: (item) => set(s => ({ stockItems: [...s.stockItems, item] })),
  updateStockItem: (item) => set(s => ({
    stockItems: s.stockItems.map(i => i.id === item.id ? item : i)
  })),
  addStockMovement: (movement) => set(s => {
    const item = s.stockItems.find(i => i.id === movement.itemId);
    if (item) {
      const newQty = movement.type === 'entrada'
        ? item.quantity + movement.quantity
        : movement.type === 'saida'
          ? item.quantity - movement.quantity
          : movement.quantity; // ajuste sets directly
      return {
        stockMovements: [...s.stockMovements, movement],
        stockItems: s.stockItems.map(i => i.id === movement.itemId ? { ...i, quantity: Math.max(0, newQty) } : i)
      };
    }
    return { stockMovements: [...s.stockMovements, movement] };
  }),

  purchaseOrders: samplePurchaseOrders,
  addPurchaseOrder: (po) => set(s => ({ purchaseOrders: [...s.purchaseOrders, po] })),
  updatePurchaseOrder: (po) => set(s => ({
    purchaseOrders: s.purchaseOrders.map(p => p.id === po.id ? po : p)
  })),

  invoices: [],
  addInvoice: (inv) => set(s => ({ invoices: [...s.invoices, inv] })),
  updateInvoice: (inv) => set(s => ({
    invoices: s.invoices.map(i => i.id === inv.id ? inv : i)
  })),

  showFieldInfo: null,
  setShowFieldInfo: (info) => set({ showFieldInfo: info }),

  hasPermission: (module, routine) => {
    const user = get().currentUser;
    if (!user) return false;
    if (user.role === 'admin') return true;
    const perm = user.permissions.find(p => p.module === module);
    if (!perm) return false;
    if (perm.routines.includes('*')) return true;
    if (routine) return perm.routines.includes(routine);
    return true;
  },

  selectedAttendanceId: null,
  setSelectedAttendanceId: (id) => set({ selectedAttendanceId: id }),
}));
