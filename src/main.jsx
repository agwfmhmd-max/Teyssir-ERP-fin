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
  const bridgeCleanup = useRef(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('teyssir-shell-theme') === 'dark')
  const [lang, setLang] = useState(() => localStorage.getItem('teyssir-shell-lang') || 'ar')
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [permissions, setPermissions] = useState([])
  const [active, setActive] = useState('home')

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
    return () => bridgeCleanup.current?.()
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

  const syncLegacyState = () => {
    const doc = frame.current?.contentDocument
    const win = frame.current?.contentWindow
    if (!doc || !win) return

    const appScreen = doc.getElementById('appScreen')
    const authScreen = doc.getElementById('authScreen')
    const blockScreen = doc.getElementById('blockScreen')
    const app = win.app
    const session = (() => {
      try { return JSON.parse(win.localStorage.getItem('mda_session') || 'null') } catch (_) { return null }
    })()

    const appVisible = !!appScreen && getComputedStyle(appScreen).display !== 'none'
    const authVisible = !!authScreen && getComputedStyle(authScreen).display !== 'none'
    const blockVisible = !!blockScreen && getComputedStyle(blockScreen).display !== 'none'
    const loggedIn = appVisible && !authVisible && !blockVisible

    setAuthenticated(loggedIn)

    const admin = !!(app?.state?.admin || session?.admin)
    setIsAdmin(loggedIn && admin)
    setPermissions(app?.state?.permissions || session?.permissions || [])

    const currentView = app?.state?.currentView
    if (loggedIn && currentView) setActive(currentView)
    if (!loggedIn) {
      setActive('home')
      setMobileOpen(false)
    }
  }

  const navigateLegacy = (key) => {
    if (!authenticated) return
    if (key === 'admin' && !isAdmin) return

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
      const win = frame.current.contentWindow
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

      // Keep the React shell synchronized with the legacy ERP authentication state.
      // This prevents the new navigation from appearing before login and also exposes
      // the Admin page immediately after a successful administrator login.
      syncLegacyState()
      const observed = [doc.getElementById('authScreen'), doc.getElementById('appScreen'), doc.getElementById('blockScreen')].filter(Boolean)
      const observer = new MutationObserver(syncLegacyState)
      observed.forEach(el => observer.observe(el, { attributes: true, attributeFilter: ['style', 'class'] }))

      const timer = window.setInterval(syncLegacyState, 400)
      bridgeCleanup.current = () => {
        observer.disconnect()
        window.clearInterval(timer)
      }

      // A logout clears the legacy session. Sync immediately when storage changes in the iframe.
      try {
        win.addEventListener('storage', syncLegacyState)
      } catch (_) {}
    } catch (_) {
      setAuthenticated(false)
    }
  }

  const t = (m) => lang === 'ar' ? m.ar : m.fr
  const canOpen = (key) => isAdmin || key === 'home' || permissions.includes(key)

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''} ${authenticated ? 'authenticated' : 'unauthenticated'}`}>
      {authenticated && (
        <aside className="shell-sidebar">
          <div className="brand">
            <img src="/erp/logo.png" alt="Teyssir ERP" />
            {!collapsed && <div><strong>Teyssir ERP</strong><span>{lang === 'ar' ? 'رفيقك في التسيير' : 'Votre gestion simplifiée'}</span></div>}
          </div>
          <div className="sidebar-section-title">{lang === 'ar' ? 'إدارة المؤسسة' : 'Gestion'}</div>
          <nav>
            {modules.map(({ key, icon: Icon, ...m }) => (
              <button
                key={key}
                className={`nav-link ${active === key ? 'active' : ''} ${canOpen(key) ? '' : 'permission-hidden'}`}
                onClick={() => navigateLegacy(key)}
                title={t(m)}
              >
                <Icon size={19} strokeWidth={2.1}/><span>{t(m)}</span>
              </button>
            ))}
          </nav>
          {isAdmin && (
            <div className="sidebar-bottom">
              <button className={`nav-link ${active === 'admin' ? 'active' : ''}`} onClick={() => navigateLegacy('admin')}>
                <Settings size={19}/><span>{lang === 'ar' ? 'لوحة المشرف' : 'Administration'}</span>
              </button>
              <button className="collapse" onClick={() => setCollapsed(v => !v)}>{collapsed ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}<span>{lang === 'ar' ? 'تصغير القائمة' : 'Réduire'}</span></button>
            </div>
          )}
        </aside>
      )}

      {authenticated && mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} />}
      <main className="shell-main">
        {authenticated && (
          <header className="shell-header">
            <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(v => !v)}>{mobileOpen ? <X/> : <Menu/>}</button>
            <div className="breadcrumb"><span>Teyssir ERP</span><ChevronLeft size={15}/><strong>{active === 'admin' ? (lang === 'ar' ? 'لوحة المشرف' : 'Administration') : t(modules.find(x => x.key === active) || modules[0])}</strong></div>
            <div className="header-actions">
              <button className="icon-btn" onClick={() => setLang(v => v === 'ar' ? 'fr' : 'ar')} title="Language"><Languages size={18}/><span>{lang === 'ar' ? 'FR' : 'AR'}</span></button>
              <button className="icon-btn" onClick={() => setDark(v => !v)} title="Theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
            </div>
          </header>
        )}
        <section className="workspace-frame">
          {!ready && <div className="frame-loader"><div className="loader-logo"><img src="/erp/logo.png" alt=""/></div><div className="spinner"/><strong>{lang === 'ar' ? 'جاري تشغيل Teyssir ERP…' : 'Lancement de Teyssir ERP…'}</strong></div>}
          <iframe ref={frame} title="Teyssir ERP workspace" src="/erp/index.html" onLoad={onFrameLoad}/>
        </section>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
