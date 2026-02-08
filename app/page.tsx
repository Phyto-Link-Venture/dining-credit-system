'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

type Customer = { id: number; name: string; phone: string; balance: number; created_at: string; is_deleted: number; deleted_signature: string | null; deleted_reason: string | null; deleted_at: string | null };
type Transaction = { id: number; type: string; amount: number; bonus: number; balance_before: number; balance_after: number; description: string; signature: string | null; attachment: string | null; is_deleted: number; deleted_reason: string | null; deleted_signature: string | null; deleted_at: string | null; created_at: string };
type Promotion = { id: number; name: string; topup_amount: number; bonus_amount: number };
type Lang = 'en' | 'zh';

const t: Record<string, Record<Lang, string>> = {
  appName: { en: 'Dining Credit System', zh: '餐饮积分系统' },
  appTitle: { en: 'Meal Credit Manager', zh: '餐饮充值管理' },
  appDesc: { en: 'Prepaid meal credit for your dining experience', zh: '预付餐饮积分管理平台' },
  customers: { en: 'Customers', zh: '客户' },
  register: { en: 'Register', zh: '注册' },
  promos: { en: 'Promos', zh: '优惠' },
  searchPlaceholder: { en: 'Search by name or phone...', zh: '按姓名或电话搜索...' },
  noCustomers: { en: 'No customers found', zh: '未找到客户' },
  registerFirst: { en: 'Register a new customer to get started', zh: '注册新客户以开始使用' },
  balance: { en: 'Balance', zh: '余额' },
  availableBalance: { en: 'Available Balance', zh: '可用余额' },
  back: { en: 'Back', zh: '返回' },
  topUp: { en: 'Top Up', zh: '充值' },
  useCredit: { en: 'Use Credit', zh: '扣款' },
  deduct: { en: 'Deduct', zh: '扣除' },
  amount: { en: 'Amount', zh: '金额' },
  recentTxn: { en: 'Recent Transactions', zh: '最近交易' },
  records: { en: 'records', zh: '条记录' },
  noTxn: { en: 'No transactions yet', zh: '暂无交易记录' },
  topUpLabel: { en: 'Top Up', zh: '充值' },
  deduction: { en: 'Deduction', zh: '扣款' },
  viewSig: { en: 'View Receipt & Signature', zh: '查看收据和签名' },
  newCustomer: { en: 'New Customer', zh: '新客户注册' },
  registerDesc: { en: 'Register a new dining credit account', zh: '注册新的餐饮积分账户' },
  fullName: { en: 'Full Name', zh: '姓名' },
  namePlaceholder: { en: 'e.g. Ahmad bin Ali', zh: '例如：张三' },
  phoneNumber: { en: 'Phone Number', zh: '电话号码' },
  phonePlaceholder: { en: 'e.g. 012-345 6789', zh: '例如：012-345 6789' },
  registerBtn: { en: 'Register Customer', zh: '注册客户' },
  registered: { en: 'Customer registered!', zh: '客户注册成功！' },
  fillFields: { en: 'Please fill in all fields', zh: '请填写所有字段' },
  newPromo: { en: 'New Promotion', zh: '新建优惠' },
  promoDesc: { en: 'Create a top-up bonus deal', zh: '创建充值赠送优惠' },
  promoNamePlaceholder: { en: 'e.g. CNY Special', zh: '例如：新年特惠' },
  topUpRM: { en: 'Top up (RM)', zh: '充值金额 (RM)' },
  freeBonus: { en: 'Free bonus (RM)', zh: '赠送金额 (RM)' },
  createPromo: { en: 'Create Promotion', zh: '创建优惠' },
  promoAdded: { en: 'Promotion added!', zh: '优惠已添加！' },
  promoRemoved: { en: 'Promotion removed', zh: '优惠已移除' },
  noPromos: { en: 'No active promotions', zh: '暂无活动优惠' },
  confirmDeduct: { en: 'Confirm Deduction', zh: '确认扣款' },
  willDeduct: { en: 'will be deducted', zh: '将被扣除' },
  signAbove: { en: 'Sign above to authorize this transaction', zh: '请在上方签名以授权此交易' },
  clear: { en: 'Clear', zh: '清除' },
  cancel: { en: 'Cancel', zh: '取消' },
  confirm: { en: 'Confirm', zh: '确认' },
  close: { en: 'Close', zh: '关闭' },
  signFirst: { en: 'Please sign before confirming', zh: '请先签名再确认' },
  txnReceipt: { en: 'Transaction Receipt', zh: '交易收据' },
  amountLabel: { en: 'Amount', zh: '金额' },
  balBefore: { en: 'Balance Before', zh: '扣款前余额' },
  balAfter: { en: 'Balance After', zh: '扣款后余额' },
  description: { en: 'Description', zh: '描述' },
  custSignature: { en: 'Customer Signature', zh: '客户签名' },
  insufficient: { en: 'Insufficient balance!', zh: '余额不足！' },
  toppedUp: { en: 'Topped up', zh: '已充值' },
  free: { en: 'FREE', zh: '赠送' },
  deducted: { en: 'Deducted', zh: '已扣除' },
  remaining: { en: 'Remaining', zh: '余额' },
  free2: { en: 'FREE', zh: '免费' },
  attachReceipt: { en: '📎 Attach receipt (optional)', zh: '📎 附上收据（可选）' },
  viewAttachment: { en: 'View Attachment', zh: '查看附件' },
  uploading: { en: 'Uploading...', zh: '上传中...' },
  removeFile: { en: '✕', zh: '✕' },
  deleteCustomer: { en: 'Remove Customer', zh: '删除客户' },
  deleteTxn: { en: 'Remove', zh: '删除' },
  confirmDelete: { en: 'Confirm Removal', zh: '确认删除' },
  deleteDesc: { en: 'Sign to authorize this removal', zh: '签名以授权此删除操作' },
  reason: { en: 'Reason (optional)', zh: '原因（可选）' },
  deleted: { en: 'Record removed!', zh: '记录已删除！' },
  deleteWarning: { en: 'This will reverse the balance effect', zh: '这将撤销余额变动' },
  showDeleted: { en: 'Show removed', zh: '显示已删除' },
  hideDeleted: { en: 'Hide removed', zh: '隐藏已删除' },
  removedTag: { en: 'REMOVED', zh: '已删除' },
  attachment: { en: 'Attachment', zh: '附件' },
  fileAttached: { en: 'File attached', zh: '已附文件' },
  installApp: { en: 'Install App', zh: '安装应用' },
  installDismiss: { en: 'Maybe later', zh: '稍后再说' },
  installIosTitle: { en: 'Install on iPhone', zh: '安装到 iPhone' },
  installIosStep1: { en: '1. Tap the Share button', zh: '1. 点击分享按钮' },
  installIosStep2: { en: '2. Scroll down and tap "Add to Home Screen"', zh: '2. 向下滑动，点击「添加到主屏幕」' },
  installIosStep3: { en: '3. Tap "Add" to confirm', zh: '3. 点击「添加」确认' },
  installAndroidTitle: { en: 'Install on Android', zh: '安装到 Android' },
  installAndroidStep1: { en: '1. Tap the menu (⋮) in your browser', zh: '1. 点击浏览器菜单 (⋮)' },
  installAndroidStep2: { en: '2. Tap "Install app" or "Add to Home Screen"', zh: '2. 点击「安装应用」或「添加到主屏幕」' },
  installAndroidStep3: { en: '3. Tap "Install" to confirm', zh: '3. 点击「安装」确认' },
  installNative: { en: 'Install', zh: '安装' },
  installDesc: { en: 'Get the full app experience — works offline!', zh: '获得完整应用体验 — 支持离线使用！' },
  restore: { en: 'Restore', zh: '恢复' },
  restored: { en: 'Record restored!', zh: '记录已恢复！' },
  deletedBy: { en: 'Removed on', zh: '删除于' },
  deleteProof: { en: 'Deletion Proof', zh: '删除凭证' },
  viewDeleteProof: { en: 'View deletion proof', zh: '查看删除凭证' },
  deleteSignature: { en: 'Authorization Signature', zh: '授权签名' },
  restoreConfirm: { en: 'Restore this record?', zh: '恢复此记录？' },
};

// ---- Signature Pad Component ----
function SigPad({ canvasRef, containerRef, color = '#1e293b' }: { canvasRef: React.RefObject<HTMLCanvasElement | null>; containerRef: React.RefObject<HTMLDivElement | null>; color?: string }) {
  const drawing = useRef(false);

  useEffect(() => {
    const resize = () => { const c = canvasRef.current!; c.width = containerRef.current!.getBoundingClientRect().width; c.height = 160; };
    resize(); window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef, containerRef]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const c = canvasRef.current!, r = c.getBoundingClientRect(), sx = c.width / r.width, sy = c.height / r.height;
    if ('touches' in e) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    return { x: ((e as React.MouseEvent).clientX - r.left) * sx, y: ((e as React.MouseEvent).clientY - r.top) * sy };
  };
  const start = (e: React.TouchEvent | React.MouseEvent) => { e.preventDefault(); drawing.current = true; (canvasRef.current as any)._hasDrawn = true; const ctx = canvasRef.current!.getContext('2d')!; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const move = (e: React.TouchEvent | React.MouseEvent) => { if (!drawing.current) return; e.preventDefault(); const ctx = canvasRef.current!.getContext('2d')!; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
  const end = () => { drawing.current = false; };

  return (
    <canvas ref={canvasRef} height={160} style={{ width: '100%', height: '160px' }}
      className="border border-gray-200 dark:border-gray-600 rounded-2xl touch-none bg-gray-50 dark:bg-gray-700"
      onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
      onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
  );
}

// ---- File Attachment Component ----
function AttachmentInput({ attachment, uploading, lang, onUpload, onRemove }: {
  attachment: string | null; uploading: boolean; lang: Lang;
  onUpload: (file: File) => void; onRemove: () => void;
}) {
  if (attachment) {
    const isImage = attachment.match(/\.(jpg|jpeg|png|gif|webp)/i);
    return (
      <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        {isImage ? (
          <div className="relative">
            <img src={attachment} alt="Receipt" className="w-full h-20 object-cover rounded-lg" />
            <button onClick={onRemove} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">✕</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs">📄</span>
            <span className="text-[11px] text-blue-700 dark:text-blue-400 flex-1">{t.fileAttached[lang]}</span>
            <button onClick={onRemove} className="text-[10px] text-red-500 hover:text-red-700">{t.removeFile[lang]}</button>
          </div>
        )}
      </div>
    );
  }
  return (
    <label className="flex items-center gap-1 mb-2 cursor-pointer text-[11px] text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition py-1">
      {uploading ? t.uploading[lang] : t.attachReceipt[lang]}
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); e.target.value = ''; }} disabled={uploading} />
    </label>
  );
}

// ---- Receipt Viewer Modal ----
function SigViewer({ txn, lang, onClose }: { txn: Transaction; lang: Lang; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 sm:hidden" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{t.txnReceipt[lang]}</h3>
          <span className="text-xs text-gray-400">{new Date(txn.created_at + 'Z').toLocaleString()}</span>
        </div>
        <div className="space-y-2 mb-4">
          {[
            [t.amountLabel[lang], `${txn.type === 'topup' ? '+' : '-'} RM${txn.amount.toFixed(2)}`, txn.type === 'topup' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'],
            [t.balBefore[lang], `RM${txn.balance_before.toFixed(2)}`, 'text-gray-700 dark:text-gray-300'],
            [t.balAfter[lang], `RM${txn.balance_after.toFixed(2)}`, 'font-medium text-gray-900 dark:text-white'],
          ].map(([label, val, cls], i) => (
            <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400 text-sm">{label}</span>
              <span className={cls as string}>{val}</span>
            </div>
          ))}
          {txn.bonus > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Bonus</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+RM{txn.bonus.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">{t.description[lang]}</span>
            <span className="text-gray-700 dark:text-gray-300 text-sm text-right max-w-[60%]">{txn.description}</span>
          </div>
        </div>
        {txn.signature && (
          <>
            <p className="text-xs text-gray-400 mb-2">{t.custSignature[lang]}</p>
            <div className="border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 p-2 mb-3">
              <img src={txn.signature} alt="Signature" className="w-full rounded-lg" />
            </div>
          </>
        )}
        {txn.attachment && (
          <>
            <p className="text-xs text-gray-400 mb-2">📎 {t.attachment[lang]}</p>
            {txn.attachment.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
              <img src={txn.attachment} alt="Receipt" className="w-full rounded-2xl border border-gray-200 dark:border-gray-600 mb-3" />
            ) : (
              <a href={txn.attachment} target="_blank" rel="noopener noreferrer" className="block text-center py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-100 transition mb-3">
                📄 {t.viewAttachment[lang]}
              </a>
            )}
          </>
        )}
        <button onClick={onClose} className="w-full py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">{t.close[lang]}</button>
      </div>
    </div>
  );
}

// ---- Delete Modal ----
function DeleteModal({ lang, reason, setReason, onSave, onCancel }: { lang: Lang; reason: string; setReason: (r: string) => void; onSave: (sig: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleSave = () => { if (!(canvasRef.current as any)?._hasDrawn) { alert(t.signFirst[lang]); return; } onSave(canvasRef.current!.toDataURL()); };
  const clear = () => { const c = canvasRef.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); (c as any)._hasDrawn = false; };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 sm:hidden" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><span className="text-xl">🗑️</span></div>
          <div>
            <h3 className="font-semibold text-red-600 dark:text-red-400">{t.confirmDelete[lang]}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.deleteWarning[lang]}</p>
          </div>
        </div>
        <input type="text" placeholder={t.reason[lang]} value={reason} onChange={e => setReason(e.target.value)}
          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 focus:outline-none mb-3 placeholder:text-gray-400" />
        <p className="text-xs text-gray-400 mb-2">{t.deleteDesc[lang]}</p>
        <div ref={containerRef}><SigPad canvasRef={canvasRef} containerRef={containerRef} color="#dc2626" /></div>
        <div className="flex gap-3 mt-4">
          <button onClick={clear} className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">{t.clear[lang]}</button>
          <button onClick={onCancel} className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">{t.cancel[lang]}</button>
          <button onClick={handleSave} className="flex-[1.5] py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">{t.confirm[lang]}</button>
        </div>
      </div>
    </div>
  );
}

// ---- Deduct Signature Modal ----
function DeductSignModal({ amount, lang, onSave, onCancel }: { amount: number; lang: Lang; onSave: (sig: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleSave = () => { if (!(canvasRef.current as any)?._hasDrawn) { alert(t.signFirst[lang]); return; } onSave(canvasRef.current!.toDataURL()); };
  const clear = () => { const c = canvasRef.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); (c as any)._hasDrawn = false; };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 sm:hidden" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><span className="text-xl">✍️</span></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t.confirmDeduct[lang]}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">RM{amount.toFixed(2)} {t.willDeduct[lang]}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-2">{t.signAbove[lang]}</p>
        <div ref={containerRef}><SigPad canvasRef={canvasRef} containerRef={containerRef} /></div>
        <div className="flex gap-3 mt-4">
          <button onClick={clear} className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">{t.clear[lang]}</button>
          <button onClick={onCancel} className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">{t.cancel[lang]}</button>
          <button onClick={handleSave} className="flex-[1.5] py-3 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition">{t.confirm[lang]}</button>
        </div>
      </div>
    </div>
  );
}

// ================ MAIN ================
export default function Home() {
  const [tab, setTab] = useState<'search' | 'register' | 'promotions'>('search');
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showSignature, setShowSignature] = useState(false);
  const [pendingDeduct, setPendingDeduct] = useState(0);
  const [topupAmount, setTopupAmount] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [selectedPromo, setSelectedPromo] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPromoName, setNewPromoName] = useState('');
  const [newPromoTopup, setNewPromoTopup] = useState('');
  const [newPromoBonus, setNewPromoBonus] = useState('');
  const [viewingSig, setViewingSig] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [dark, setDark] = useState(false);
  const [topupAttachment, setTopupAttachment] = useState<string | null>(null);
  const [deductAttachment, setDeductAttachment] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'customer' | 'transaction'; id: number } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [actionTab, setActionTab] = useState<'topup' | 'deduct'>('topup');
  const [viewDeleteProof, setViewDeleteProof] = useState<{ type: string; signature: string; reason: string; date: string } | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('dining-lang'); if (s === 'zh' || s === 'en') setLang(s);
    if (localStorage.getItem('dining-dark') === 'true') setDark(true);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('dining-dark', String(dark)); }, [dark]);
  useEffect(() => { localStorage.setItem('dining-lang', lang); }, [lang]);

  // Offline detection
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const goOffline = () => { setIsOffline(true); showToast(lang === 'zh' ? '⚠️ 网络已断开 — 部分功能不可用' : '⚠️ You are offline — some features unavailable', 'error'); };
    const goOnline = () => { setIsOffline(false); showToast(lang === 'zh' ? '✅ 网络已恢复' : '✅ Back online', 'success'); fetchCustomers(); };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline); };
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // PWA install detection
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(!!standalone);
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios');
    else if (/android/.test(ua)) setPlatform('android');
    else setPlatform('other');
    // Show install banner if not already installed and not dismissed recently
    const dismissed = localStorage.getItem('dining-install-dismissed');
    if (!standalone && (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000)) {
      setTimeout(() => setShowInstall(true), 3000); // Show after 3s
    }
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const compressImage = (file: File, maxW = 1600, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) { resolve(file); return; }
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (blob) {
            const ext = file.type === 'image/png' ? '.png' : '.jpg';
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ext), { type: blob.type }));
          } else resolve(file);
        }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      console.log('Uploading:', compressed.name, compressed.type, (compressed.size / 1024).toFixed(0) + 'KB');
      const fd = new FormData(); fd.append('file', compressed);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) { const data = await res.json(); return data.path; }
      const err = await res.text();
      showToast('Upload failed: ' + err, 'error');
      return null;
    } catch (e: any) {
      showToast('Upload error: ' + e.message, 'error');
      return null;
    } finally { setUploading(false); }
  };

  const fetchCustomers = useCallback(async () => {
    const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}&showDeleted=${showDeleted ? '1' : '0'}`);
    setCustomers(await res.json());
  }, [search, showDeleted]);

  const fetchPromotions = async () => { setPromotions(await (await fetch('/api/promotions')).json()); };

  const selectCustomer = async (c: Customer) => {
    const res = await fetch(`/api/customers/${c.id}?showDeleted=${showDeleted ? '1' : '0'}`);
    const data = await res.json();
    setSelected(data.customer); setTransactions(data.transactions);
  };

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { fetchPromotions(); }, []);
  // Re-fetch selected customer when showDeleted changes
  useEffect(() => { if (selected) selectCustomer(selected); }, [showDeleted]); // eslint-disable-line react-hooks/exhaustive-deps

  const offlineMsg = lang === 'zh' ? '⚠️ 无网络连接，无法执行此操作' : '⚠️ No internet — cannot perform this action';
  const checkOnline = () => { if (!navigator.onLine) { showToast(offlineMsg, 'error'); return false; } return true; };

  const registerCustomer = async () => {
    if (!checkOnline()) return;
    if (!newName || !newPhone) { showToast(t.fillFields[lang], 'error'); return; }
    const res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, phone: newPhone }) });
    if (res.ok) { showToast(t.registered[lang]); setNewName(''); setNewPhone(''); fetchCustomers(); }
    else { showToast((await res.json()).error, 'error'); }
  };

  const doTopup = async () => {
    if (!checkOnline()) return;
    const amount = parseFloat(topupAmount);
    if (!amount || !selected) return;
    const res = await fetch('/api/topup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_id: selected.id, amount, promotion_id: selectedPromo, attachment: topupAttachment }) });
    if (res.ok) {
      const data = await res.json();
      showToast(`${t.toppedUp[lang]} RM${amount.toFixed(2)}${data.bonus > 0 ? ` + ${t.free[lang]} RM${data.bonus.toFixed(2)}` : ''}!`);
      setTopupAmount(''); setSelectedPromo(null); setTopupAttachment(null); selectCustomer(selected); fetchCustomers();
    } else { showToast((await res.json()).error, 'error'); }
  };

  const initiateDeduct = () => {
    if (!checkOnline()) return;
    const amount = parseFloat(deductAmount);
    if (!amount || !selected) return;
    if (amount > selected.balance) { showToast(t.insufficient[lang], 'error'); return; }
    setPendingDeduct(amount); setShowSignature(true);
  };

  const doDeduct = async (signature: string) => {
    setShowSignature(false);
    if (!selected) return;
    const res = await fetch('/api/deduct', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_id: selected.id, amount: pendingDeduct, signature, attachment: deductAttachment }) });
    if (res.ok) {
      const data = await res.json();
      showToast(`${t.deducted[lang]} RM${pendingDeduct.toFixed(2)}. ${t.remaining[lang]}: RM${data.balance_after.toFixed(2)}`);
      setDeductAmount(''); setDeductAttachment(null); selectCustomer(selected); fetchCustomers();
    } else { showToast((await res.json()).error, 'error'); }
  };

  const doDelete = async (signature: string) => {
    if (!checkOnline()) return;
    if (!deleteTarget) return;
    const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...deleteTarget, signature, reason: deleteReason }) });
    setDeleteTarget(null); setDeleteReason('');
    if (res.ok) {
      showToast(t.deleted[lang]);
      if (deleteTarget.type === 'customer') { setSelected(null); fetchCustomers(); }
      else if (selected) { selectCustomer(selected); fetchCustomers(); }
    } else { showToast((await res.json()).error, 'error'); }
  };

  const doRestore = async (type: 'customer' | 'transaction', id: number) => {
    if (!checkOnline()) return;
    const res = await fetch('/api/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id }) });
    if (res.ok) {
      showToast(t.restored[lang]);
      if (type === 'customer') { fetchCustomers(); if (selected?.id === id) selectCustomer({ ...selected, is_deleted: 0 } as Customer); }
      else if (selected) { selectCustomer(selected); fetchCustomers(); }
    } else { showToast((await res.json()).error, 'error'); }
  };

  const addPromo = async () => {
    if (!checkOnline()) return;
    if (!newPromoName || !newPromoTopup || !newPromoBonus) { showToast(t.fillFields[lang], 'error'); return; }
    const res = await fetch('/api/promotions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newPromoName, topup_amount: parseFloat(newPromoTopup), bonus_amount: parseFloat(newPromoBonus) }) });
    if (res.ok) { showToast(t.promoAdded[lang]); setNewPromoName(''); setNewPromoTopup(''); setNewPromoBonus(''); fetchPromotions(); }
    else { showToast((await res.json()).error, 'error'); }
  };

  const deletePromo = async (id: number) => {
    await fetch('/api/promotions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchPromotions(); showToast(t.promoRemoved[lang]);
  };

  const tabs = [
    { id: 'search' as const, label: t.customers[lang], icon: '👥' },
    { id: 'register' as const, label: t.register[lang], icon: '➕' },
    { id: 'promotions' as const, label: t.promos[lang], icon: '🎁' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium text-white animate-fade-in ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      {/* Install Banner */}
      {showInstall && !isStandalone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={() => { setShowInstall(false); localStorage.setItem('dining-install-dismissed', String(Date.now())); }}>
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-200 dark:shadow-none">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t.installApp[lang]}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.installDesc[lang]}</p>
            </div>

            {installPrompt ? (
              <button onClick={async () => { installPrompt.prompt(); const r = await installPrompt.userChoice; if (r.outcome === 'accepted') setShowInstall(false); setInstallPrompt(null); }}
                className="w-full py-3.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-200 dark:shadow-none mb-3">
                📲 {t.installNative[lang]}
              </button>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-4">
                {platform === 'ios' ? (
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white mb-3">{t.installIosTitle[lang]}</p>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">⬆️</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t.installIosStep1[lang]} <span className="inline-block border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-xs">⬆️</span></p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-lg">➕</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t.installIosStep2[lang]}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-lg">✅</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t.installIosStep3[lang]}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white mb-3">{t.installAndroidTitle[lang]}</p>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">⋮</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t.installAndroidStep1[lang]}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-lg">📲</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t.installAndroidStep2[lang]}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-lg">✅</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t.installAndroidStep3[lang]}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => { setShowInstall(false); localStorage.setItem('dining-install-dismissed', String(Date.now())); }}
              className="w-full py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
              {t.installDismiss[lang]}
            </button>
          </div>
        </div>
      )}

      {showSignature && <DeductSignModal amount={pendingDeduct} lang={lang} onSave={doDeduct} onCancel={() => setShowSignature(false)} />}
      {viewingSig && <SigViewer txn={viewingSig} lang={lang} onClose={() => setViewingSig(null)} />}
      {deleteTarget && <DeleteModal lang={lang} reason={deleteReason} setReason={setDeleteReason} onSave={doDelete} onCancel={() => { setDeleteTarget(null); setDeleteReason(''); }} />}
      {viewDeleteProof && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setViewDeleteProof(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><span className="text-xl">🔒</span></div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t.deleteProof[lang]}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.deletedBy[lang]} {new Date(viewDeleteProof.date + 'Z').toLocaleString()}</p>
              </div>
            </div>
            {viewDeleteProof.reason && (
              <div className="mb-3 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-xs text-gray-400">{t.reason[lang]}:</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">{viewDeleteProof.reason}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mb-2">{t.deleteSignature[lang]}</p>
            <div className="border border-red-200 dark:border-red-800 rounded-2xl bg-red-50/50 dark:bg-red-900/10 p-2 mb-4">
              <img src={viewDeleteProof.signature} alt="Delete signature" className="w-full rounded-lg" />
            </div>
            <button onClick={() => setViewDeleteProof(null)} className="w-full py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">{t.close[lang]}</button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pb-24 pt-6">
        {/* Offline Banner */}
        {isOffline && (
          <div className="mb-4 bg-red-500 text-white rounded-2xl p-3 flex items-center gap-3 shadow-lg animate-fade-in">
            <span className="text-xl">📡</span>
            <div>
              <p className="text-sm font-semibold">{lang === 'zh' ? '无网络连接' : 'No Internet Connection'}</p>
              <p className="text-xs text-white/80">{lang === 'zh' ? '充值、扣款等操作需要网络。请使用 APK 版本实现完全离线使用。' : 'Top up, deduct and other operations need internet. Use the APK version for full offline use.'}</p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium px-3 py-1 rounded-full mb-2">
              <span>🍽️</span> {t.appName[lang]}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t.appTitle[lang]}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{t.appDesc[lang]}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {!isStandalone && (
              <button onClick={() => setShowInstall(true)} className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm" title={t.installApp[lang]}>
                📲
              </button>
            )}
            <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
              {lang === 'en' ? '中' : 'EN'}
            </button>
            <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* ====== SEARCH TAB ====== */}
        {tab === 'search' && !selected && (
          <div>
            <div className="relative mb-3">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder={t.searchPlaceholder[lang]} value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30 focus:outline-none text-sm text-gray-900 dark:text-white transition shadow-sm placeholder:text-gray-400" />
            </div>
            {/* Show deleted toggle */}
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowDeleted(!showDeleted)} className={`text-[11px] px-3 py-1.5 rounded-full border transition ${showDeleted ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'}`}>
                {showDeleted ? t.hideDeleted[lang] : t.showDeleted[lang]}
              </button>
            </div>
            <div className="space-y-2">
              {customers.map(c => (
                <div key={c.id} onClick={() => selectCustomer(c)}
                  className={`bg-white dark:bg-gray-800 p-4 rounded-2xl border flex justify-between items-center transition-all cursor-pointer group ${c.is_deleted ? 'opacity-60 border-red-200 dark:border-red-900 hover:opacity-80' : 'border-gray-100 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-md'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ${c.is_deleted ? 'bg-gray-400' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                        {c.name}
                        {c.is_deleted === 1 && <span className="ml-2 text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full uppercase">{t.removedTag[lang]}</span>}
                      </div>
                      <div className="text-xs text-gray-400">{c.phone}</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className={`text-lg font-bold ${c.is_deleted ? 'text-gray-400' : c.balance > 50 ? 'text-emerald-600 dark:text-emerald-400' : c.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                      RM{c.balance.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">{t.balance[lang]}</div>
                    {c.is_deleted === 1 && (
                      <button onClick={(e) => { e.stopPropagation(); doRestore('customer', c.id); }}
                        className="text-[10px] text-emerald-500 hover:text-emerald-600 font-medium mt-1">↩️ {t.restore[lang]}</button>
                    )}
                  </div>
                </div>
              ))}
              {customers.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-gray-400 text-sm">{t.noCustomers[lang]}</p>
                  <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">{t.registerFirst[lang]}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====== CUSTOMER DETAIL ====== */}
        {tab === 'search' && selected && (
          <div>
            <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {t.back[lang]}
            </button>

            {/* Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white rounded-3xl p-6 mb-6 shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-lg font-bold">{selected.name.charAt(0).toUpperCase()}</div>
                  <div><div className="font-medium text-white/90">{selected.name}</div><div className="text-sm text-white/50">{selected.phone}</div></div>
                </div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">{t.availableBalance[lang]}</div>
                <div className="text-4xl font-bold tracking-tight">RM{selected.balance.toFixed(2)}</div>
                {!selected.is_deleted && (
                  <button onClick={() => setDeleteTarget({ type: 'customer', id: selected.id })}
                    className="mt-4 text-xs text-white/30 hover:text-red-300 transition flex items-center gap-1">🗑️ {t.deleteCustomer[lang]}</button>
                )}
                {selected.is_deleted === 1 && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs text-red-300/60">🗑️ {t.removedTag[lang]}</span>
                    {selected.deleted_signature && (
                      <button onClick={() => setViewDeleteProof({ type: 'customer', signature: selected.deleted_signature!, reason: selected.deleted_reason || '', date: selected.deleted_at || '' })}
                        className="text-xs text-red-300/80 hover:text-red-200 underline transition">🔒 {t.viewDeleteProof[lang]}</button>
                    )}
                    <button onClick={() => doRestore('customer', selected.id)}
                      className="text-xs text-emerald-400/80 hover:text-emerald-300 underline transition ml-auto">↩️ {t.restore[lang]}</button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Tabs - hide for deleted customers */}
            {!selected.is_deleted && (() => {
              const [action, setAction] = [actionTab, setActionTab];
              return (
                <div className="mb-6">
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-4">
                    <button onClick={() => setAction('topup')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition ${action === 'topup' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      <span>💰</span> {t.topUp[lang]}
                    </button>
                    <button onClick={() => setAction('deduct')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition ${action === 'deduct' ? 'bg-white dark:bg-gray-700 text-red-500 dark:text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      <span>🍽️</span> {t.useCredit[lang]}
                    </button>
                  </div>

                  {action === 'topup' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                      <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">RM</span>
                        <input type="number" placeholder="0.00" value={topupAmount} onChange={e => setTopupAmount(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-emerald-400 dark:focus:border-emerald-500 focus:outline-none text-2xl font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 transition" />
                      </div>
                      {promotions.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">🎁 {t.promos[lang]}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {promotions.map(p => (
                              <button key={p.id} onClick={() => { setSelectedPromo(selectedPromo === p.id ? null : p.id); if (selectedPromo !== p.id) setTopupAmount(p.topup_amount.toString()); else setTopupAmount(''); }}
                                className={`p-3 rounded-xl border-2 text-left transition ${selectedPromo === p.id ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800'}`}>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">RM{p.topup_amount}</div>
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+RM{p.bonus_amount} {t.free2[lang]}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">{p.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <AttachmentInput attachment={topupAttachment} uploading={uploading} lang={lang}
                        onUpload={async (f) => { const p = await uploadFile(f); if (p) setTopupAttachment(p); }}
                        onRemove={() => setTopupAttachment(null)} />
                      <button onClick={doTopup} disabled={uploading || !topupAmount}
                        className="w-full py-3.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-40 disabled:shadow-none">
                        {uploading ? t.uploading[lang] : `${t.topUp[lang]} ${topupAmount ? `RM${parseFloat(topupAmount || '0').toFixed(2)}` : ''}`}
                      </button>
                    </div>
                  )}

                  {action === 'deduct' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                      <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">RM</span>
                        <input type="number" placeholder="0.00" value={deductAmount} onChange={e => setDeductAmount(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-red-400 dark:focus:border-red-500 focus:outline-none text-2xl font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 transition" />
                      </div>
                      {/* Quick amount buttons */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[5, 10, 15, 20].map(amt => (
                          <button key={amt} onClick={() => setDeductAmount(amt.toString())}
                            className={`py-2.5 rounded-xl text-sm font-medium border-2 transition ${parseFloat(deductAmount) === amt ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-200'}`}>
                            RM{amt}
                          </button>
                        ))}
                      </div>
                      <AttachmentInput attachment={deductAttachment} uploading={uploading} lang={lang}
                        onUpload={async (f) => { const p = await uploadFile(f); if (p) setDeductAttachment(p); }}
                        onRemove={() => setDeductAttachment(null)} />
                      <button onClick={initiateDeduct} disabled={uploading || !deductAmount}
                        className="w-full py-3.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-40 disabled:shadow-none">
                        {uploading ? t.uploading[lang] : `${t.deduct[lang]} ${deductAmount ? `RM${parseFloat(deductAmount || '0').toFixed(2)}` : ''}`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Transactions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t.recentTxn[lang]}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowDeleted(!showDeleted)} className={`text-[10px] px-2 py-1 rounded-full border transition ${showDeleted ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'}`}>
                    {showDeleted ? t.hideDeleted[lang] : t.showDeleted[lang]}
                  </button>
                  <span className="text-xs text-gray-400">{transactions.length} {t.records[lang]}</span>
                </div>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="text-3xl mb-2">📋</div><p className="text-gray-400 text-sm">{t.noTxn[lang]}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map(txn => (
                    <div key={txn.id} className={`bg-white dark:bg-gray-800 rounded-2xl border p-4 transition ${txn.is_deleted ? 'opacity-50 border-red-200 dark:border-red-900' : 'border-gray-100 dark:border-gray-700 hover:shadow-sm'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${txn.is_deleted ? 'bg-gray-200 dark:bg-gray-700' : txn.type === 'topup' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            <span className="text-sm">{txn.is_deleted ? '🗑️' : txn.type === 'topup' ? '↑' : '↓'}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {txn.type === 'topup' ? t.topUpLabel[lang] : t.deduction[lang]}
                              {txn.bonus > 0 && <span className="ml-1 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">+RM{txn.bonus}</span>}
                              {txn.is_deleted === 1 && <span className="ml-1 text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full uppercase">{t.removedTag[lang]}</span>}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{new Date(txn.created_at + 'Z').toLocaleString()}</div>
                            {txn.is_deleted === 1 && txn.deleted_reason && <div className="text-[10px] text-red-400 mt-0.5">📝 {txn.deleted_reason}</div>}
                            {txn.is_deleted === 1 && txn.deleted_at && <div className="text-[10px] text-red-400/60">{t.deletedBy[lang]} {new Date(txn.deleted_at + 'Z').toLocaleString()}</div>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold text-sm ${txn.is_deleted ? 'text-gray-400 line-through' : txn.type === 'topup' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {txn.type === 'topup' ? '+' : '-'}RM{txn.amount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-gray-400">{t.balance[lang]}: RM{txn.balance_after.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        {txn.signature && (
                          <button onClick={() => setViewingSig(txn)} className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium flex items-center gap-1">✍️ {t.viewSig[lang]}</button>
                        )}
                        {txn.attachment && (
                          <button onClick={() => setViewingSig(txn)} className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1">📎 {t.viewAttachment[lang]}</button>
                        )}
                        {!txn.is_deleted && (
                          <button onClick={() => setDeleteTarget({ type: 'transaction', id: txn.id })}
                            className="text-[11px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-medium flex items-center gap-1 ml-auto transition">🗑️ {t.deleteTxn[lang]}</button>
                        )}
                        {txn.is_deleted === 1 && txn.deleted_signature && (
                          <button onClick={() => setViewDeleteProof({ type: 'transaction', signature: txn.deleted_signature!, reason: txn.deleted_reason || '', date: txn.deleted_at || '' })}
                            className="text-[11px] text-red-400 hover:text-red-500 font-medium flex items-center gap-1 transition">🔒 {t.viewDeleteProof[lang]}</button>
                        )}
                        {txn.is_deleted === 1 && (
                          <button onClick={() => doRestore('transaction', txn.id)}
                            className="text-[11px] text-emerald-500 hover:text-emerald-600 font-medium flex items-center gap-1 ml-auto transition">↩️ {t.restore[lang]}</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====== REGISTER TAB ====== */}
        {tab === 'register' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3"><span className="text-2xl">👤</span></div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.newCustomer[lang]}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.registerDesc[lang]}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">{t.fullName[lang]}</label>
                <input type="text" placeholder={t.namePlaceholder[lang]} value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-200 focus:outline-none placeholder:text-gray-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">{t.phoneNumber[lang]}</label>
                <input type="tel" placeholder={t.phonePlaceholder[lang]} value={newPhone} onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-200 focus:outline-none placeholder:text-gray-400" />
              </div>
              <button onClick={registerCustomer} className="w-full py-3.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none mt-2">{t.registerBtn[lang]}</button>
            </div>
          </div>
        )}

        {/* ====== PROMOTIONS TAB ====== */}
        {tab === 'promotions' && (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm mb-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3"><span className="text-2xl">🎁</span></div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t.newPromo[lang]}</h3>
                <p className="text-xs text-gray-400 mt-1">{t.promoDesc[lang]}</p>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder={t.promoNamePlaceholder[lang]} value={newPromoName} onChange={e => setNewPromoName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-200 focus:outline-none placeholder:text-gray-400" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1 block">{t.topUpRM[lang]}</label>
                    <input type="number" placeholder="300" value={newPromoTopup} onChange={e => setNewPromoTopup(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-200 focus:outline-none placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1 block">{t.freeBonus[lang]}</label>
                    <input type="number" placeholder="50" value={newPromoBonus} onChange={e => setNewPromoBonus(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-200 focus:outline-none placeholder:text-gray-400" />
                  </div>
                </div>
                <button onClick={addPromo} className="w-full py-3.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200 dark:shadow-none">{t.createPromo[lang]}</button>
              </div>
            </div>
            <div className="space-y-2">
              {promotions.map(p => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm shadow-sm">🎁</div>
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{p.name}</div>
                      <div className="text-xs text-gray-400">{t.topUp[lang]} RM{p.topup_amount} → <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t.free2[lang]} RM{p.bonus_amount}</span></div>
                    </div>
                  </div>
                  <button onClick={() => deletePromo(p.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              {promotions.length === 0 && <div className="text-center py-12"><div className="text-3xl mb-2">🎁</div><p className="text-gray-400 text-sm">{t.noPromos[lang]}</p></div>}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => { setTab(tb.id); setSelected(null); }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition ${tab === tb.id ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}>
              <span className="text-lg">{tb.icon}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide">{tb.label}</span>
              {tab === tb.id && <div className="w-1 h-1 rounded-full bg-amber-500" />}
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
