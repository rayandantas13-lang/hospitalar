// ========== ROUTINE & FIELD CONFIG ==========
export interface FieldConfig {
  routineCode: string;
  fieldName: string;
  label: string;
  maxLength: number;
  required: boolean;
  visible: boolean;
  editable: boolean;
}

export interface RoutineConfig {
  code: string;
  name: string;
  module: ModuleType;
  description: string;
  fields: FieldConfig[];
}

// ========== USER & AUTH ==========
export type ModuleType = 'recepcao' | 'triagem' | 'consultorio' | 'almoxarifado' | 'sala_vermelha' | 'painel_chamada' | 'admin';

export interface UserPermission {
  module: ModuleType;
  routines: string[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'medico' | 'enfermeiro' | 'recepcionista' | 'farmaceutico';
  unit: string;
  permissions: UserPermission[];
  avatar?: string;
}

// ========== PATIENT & ATTENDANCE ==========
export type RiskClassification = 'verde' | 'amarelo' | 'vermelho' | 'laranja' | 'azul';

export type AttendanceStatus =
  | 'AGUARDANDO_TRIAGEM'
  | 'EM_TRIAGEM'
  | 'AGUARDANDO_MEDICO'
  | 'EM_ATENDIMENTO'
  | 'AGUARDANDO_MEDICACAO'
  | 'EM_MEDICACAO'
  | 'EM_REAVALIACAO'
  | 'ENCERRADO';

export interface VitalSigns {
  pa: string;
  fc: string;
  satO2: string;
  temp: string;
  glicemia: string;
  peso: string;
  altura: string;
  timestamp: string;
}

export interface Prescription {
  id: string;
  type: 'local' | 'domiciliar';
  medication: string;
  dosage: string;
  route: string;
  frequency: string;
  notes: string;
}

export interface ExamRequest {
  id: string;
  type: 'interno' | 'externo';
  examName: string;
  notes: string;
  status: 'solicitado' | 'em_andamento' | 'concluido';
}

export interface MedicalRecord {
  history: string;
  physicalExam: string;
  diagnosis: string;
  cidCode: string;
  cidName: string;
  prescriptions: Prescription[];
  exams: ExamRequest[];
  certificates: string[];
  referrals: string[];
}

export interface Patient {
  id: string;
  name: string;
  socialName: string;
  cpf: string;
  birthDate: string;
  age: number;
  profession: string;
  isTourist: boolean;
  hasCompanion: boolean;
  companionName: string;
  phone: string;
  address: string;
}

export interface Attendance {
  id: string;
  patient: Patient;
  entryTime: string;
  status: AttendanceStatus;
  riskClassification: RiskClassification | null;
  mainComplaint: string;
  vitalSigns: VitalSigns | null;
  medicalRecord: MedicalRecord | null;
  assignedDoctor: string | null;
  assignedDoctorName?: string;
  assignedNurse: string | null;
  assignedRoom?: string;
  attendanceOrder?: number;
  isRedRoom: boolean;
  printLog: PrintLog[];
}

export interface PrintLog {
  documentType: string;
  timestamp: string;
  userId: string;
}

// ========== CALL PANEL ==========
export interface CallEntry {
  id: string;
  patientName: string;
  sector: string;
  room: string;
  timestamp: string;
  attendanceId: string;
}

// ========== ALMOXARIFADO ==========
export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
}

export interface StockItem {
  id: string;
  name: string;
  code: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  expiryDate: string;
  unitCost: number;
  supplierId: string;
  lastEntryDate: string;
}

export type PurchaseOrderStatus = 'RASCUNHO' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'RECEBIDO_PARCIAL' | 'RECEBIDO_TOTAL' | 'CANCELADO';

export interface PurchaseOrderItem {
  id: string;
  stockItemId: string;
  stockItemName: string;
  stockItemCode: string;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  requestedBy: string;
  requestedByName: string;
  approvedBy: string | null;
  approvedByName: string | null;
  createdAt: string;
  approvedAt: string | null;
  notes: string;
  totalValue: number;
}

export interface InvoiceItem {
  id: string;
  stockItemId: string;
  stockItemName: string;
  stockItemCode: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  batch: string;
  expiryDate: string;
}

export type InvoiceStatus = 'PENDENTE' | 'CONFERIDA' | 'ENTRADA_REALIZADA' | 'DEVOLVIDA';

export interface Invoice {
  id: string;
  number: string;
  series: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  issueDate: string;
  entryDate: string;
  items: InvoiceItem[];
  totalValue: number;
  status: InvoiceStatus;
  receivedBy: string;
  receivedByName: string;
  notes: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason: string;
  timestamp: string;
  userId: string;
  userName: string;
  invoiceId?: string;
  purchaseOrderId?: string;
  batch?: string;
}
