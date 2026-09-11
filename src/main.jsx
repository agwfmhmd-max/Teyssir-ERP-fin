import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3, Boxes, Building2, ChevronLeft, CreditCard, FileText, Home,
  Languages, Menu, Moon, Package, PanelLeftClose, PanelLeftOpen, Receipt,
  Settings, ShoppingCart, Sun, Truck, Users, Wallet, X
} from 'lucide-react'
import './styles.css'

const modules = [
  { key: 'home', ar: 'الرئيسية', fr: 'Accueil', icon: Home },
  { key: 'pos', ar: 'نقطة البيع', fr: 'Point de vente', icon: ShoppingCart },
  { key: 'customers', ar: 'الزبناء', fr: 'Clients', icon: Users },
  { key: 'inventory', ar: 'المخزون', fr: 'Stock', icon: Boxes },
  { key: 'suppliers', ar: 'الموردون', fr: 'Fournisseurs', icon: Truck },
  { key: 'treasury', ar: 'الخزينة', fr: 'Caisse', icon: Wallet },
  { key: 'banks', ar: 'البنوك', fr: 'Banques', icon: Building2 },
  { key: 'expenses', ar: 'المصروفات', fr: 'Dépenses', icon: CreditCard },
  { key: 'revenues', ar: 'الإيرادات', fr: 'Revenus', icon: BarChart3 },
  { key: 'invoices', ar: 'الفواتير', fr: 'Factures', icon: Receipt },
  { key: 'salaries', ar: 'الرواتب', fr: 'Salaires', icon: Users },
  { key: 'reports', ar: 'التقارير', fr: 'Rapports', icon: FileText },
]

function App() {
  const frame = useRef(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('teyssir-shell-theme') === 'dark')
  const [lang, setLang] = useState(() => localStorage.getItem('teyssir-shell-lang') || 'ar')
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('teyssir-shell-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    localStorage.setItem('teyssir-shell-lang', lang)
  }, [lang])

  const navigateLegacy = (key) => {
    setActive(key)
    setMobileOpen(false)
    try {
      const win = frame.current?.contentWindow
      if (win?.app?.nav) win.app.nav(key)
    } catch (_) {}
  }

  const onFrameLoad = () => {
    setReady(true)
    try {
      const doc = frame.current.contentDocument
      if (!doc) return
      const style = doc.createElement('style')
      style.id = 'teyssir-react-shell-overrides'
      style.textContent = `
        body { padding-top: 0 !important; }
        .top-header, .sidebar, .sidebar-overlay, #homeBtn, .theme-toggle, .lang-btn-style { display:none !important; }
        .app-container { display:block !important; height:100vh !important; min-height:100vh !important; }
        #workspace { margin:0 !important; width:100% !important; min-height:100vh !important; padding:24px !important; }
        #loginScreen, #blockScreen { min-height:100vh !important; }
        @media(max-width:700px){ #workspace{padding:14px !important;} }
      `
      doc.head.appendChild(style)
    } catch (_) {}
  }

  const t = (m) => lang === 'ar' ? m.ar : m.fr

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <aside className="shell-sidebar">
        <div className="brand">
          <img src="/erp/logo.png" alt="Teyssir ERP" />
          {!collapsed && <div><strong>Teyssir ERP</strong><span>{lang === 'ar' ? 'رفيقك في التسيير' : 'Votre gestion simplifiée'}</span></div>}
        </div>
        <div className="sidebar-section-title">{lang === 'ar' ? 'إدارة المؤسسة' : 'Gestion'}</div>
        <nav>
          {modules.map(({ key, icon: Icon, ...m }) => (
            <button key={key} className={`nav-link ${active === key ? 'active' : ''}`} onClick={() => navigateLegacy(key)} title={t(m)}>
              <Icon size={19} strokeWidth={2.1} /><span>{t(m)}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-link" onClick={() => navigateLegacy('admin')}><Settings size={19}/><span>{lang === 'ar' ? 'الإعدادات' : 'Paramètres'}</span></button>
          <button className="collapse" onClick={() => setCollapsed(v => !v)}>{collapsed ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}<span>{lang === 'ar' ? 'تصغير القائمة' : 'Réduire'}</span></button>
        </div>
      </aside>

      {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} />}
      <main className="shell-main">
        <header className="shell-header">
          <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(v => !v)}>{mobileOpen ? <X/> : <Menu/>}</button>
          <div className="breadcrumb"><span>Teyssir ERP</span><ChevronLeft size={15}/><strong>{t(modules.find(x => x.key === active) || modules[0])}</strong></div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setLang(v => v === 'ar' ? 'fr' : 'ar')} title="Language"><Languages size={18}/><span>{lang === 'ar' ? 'FR' : 'AR'}</span></button>
            <button className="icon-btn" onClick={() => setDark(v => !v)} title="Theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
          </div>
        </header>
        <section className="workspace-frame">
          {!ready && <div className="frame-loader"><div className="loader-logo"><img src="/erp/logo.png" alt=""/></div><div className="spinner"/><strong>{lang === 'ar' ? 'جاري تشغيل Teyssir ERP…' : 'Lancement de Teyssir ERP…'}</strong></div>}
          <iframe ref={frame} title="Teyssir ERP workspace" src="/erp/index.html" onLoad={onFrameLoad} />
        </section>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
