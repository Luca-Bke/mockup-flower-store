'use client';

import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';

const BouquetScene = dynamic(() => import('./BouquetScene'), { ssr: false });

/* ─── config data ─────────────────────────────────────────────────── */
const FORMS = [
  { id: 'round', label: 'Kurz & rund', desc: 'gebunden', icon: '🌸' },
  { id: 'tall',  label: 'Lang & locker', desc: 'gebunden', icon: '💐' },
];

const COLORS = [
  { id: 'rot/weiß',    label: 'rot/weiß',    dot: 'linear-gradient(135deg,#e53935 50%,#fff 50%)' },
  { id: 'weiß/grün',   label: 'weiß/grün',   dot: 'linear-gradient(135deg,#fff 50%,#66bb6a 50%)' },
  { id: 'rosa/pink',   label: 'rosa/pink',   dot: 'linear-gradient(135deg,#f48fb1 50%,#e91e8c 50%)' },
  { id: 'gelb/orange', label: 'gelb/orange', dot: 'linear-gradient(135deg,#fdd835 50%,#ff7043 50%)' },
  { id: 'bunt',        label: 'bunt',        dot: 'conic-gradient(#e53935,#fdd835,#00897b,#8e24aa,#e53935)' },
];

const SIZES = [
  { id: 'S',  label: 'Klein',     desc: '~5–7 Blumen',  price: 19.90, icon: '🌱' },
  { id: 'M',  label: 'Mittel',    desc: '~10–12 Blumen', price: 34.90, icon: '🌿' },
  { id: 'L',  label: 'Groß',      desc: '~15–18 Blumen', price: 49.90, icon: '🌳' },
  { id: 'XL', label: 'Extragroß', desc: '~20+ Blumen',   price: 69.90, icon: '🎄' },
];

const DELIVERIES = [
  { id: 'pickup',   label: 'Selbst abholen',  desc: 'Wunschzeit im Laden', icon: '🏪' },
  { id: 'delivery', label: 'Lieferung',        desc: 'Direkt zu dir nach Hause', icon: '🚚' },
];

const EXTRAS = [
  { id: 'card',   label: 'Grußkarte',   price: 2.50, icon: '💌' },
  { id: 'ribbon', label: 'Schleife',    price: 1.50, icon: '🎀' },
  { id: 'wrap',   label: 'Geschenkbox', price: 4.90, icon: '🎁' },
  { id: 'vase',   label: 'Vase dazu',   price: 8.90, icon: '🏺' },
];

const STEP_LABELS = ['Form', 'Farbe', 'Größe', 'Lieferung', 'Extras'];

/* ─── helpers ─────────────────────────────────────────────────────── */
function fmtPrice(val) {
  return val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

/* ─── sub-components ──────────────────────────────────────────────── */
function StepNav({ current }) {
  return (
    <nav className="steps" aria-label="Konfigurationsschritte">
      {STEP_LABELS.map((label, i) => {
        const num   = i + 1;
        const state = num < current ? 'done' : num === current ? 'active' : '';
        return (
          <div key={label} className={`step-item ${state}`}>
            <div className="step-circle">
              {num < current ? '✓' : num}
            </div>
            <span className="step-label">{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

/* ── Step 1 – Form ── */
function StepForm({ value, onChange }) {
  return (
    <div className="config-card">
      <h2>1. Straußform</h2>
      <p className="subtitle">Wähle die Grundform deines Straußes</p>
      <div className="form-grid">
        {FORMS.map(f => (
          <button
            key={f.id}
            className={`form-option ${value === f.id ? 'selected' : ''}`}
            onClick={() => onChange(f.id)}
            aria-pressed={value === f.id}
          >
            {value === f.id && <span className="check">✓</span>}
            <span className="icon">{f.icon}</span>
            <span className="name">{f.label}</span>
            <span className="desc">{f.desc}</span>
          </button>
        ))}
      </div>
      <div className="info-banner">
        <span>ℹ️</span>
        <span>Unsere Vorlage dient zur Orientierung, jegliche Änderungen sind natürlich möglich!</span>
      </div>
    </div>
  );
}

/* ── Step 2 – Farbe ── */
function StepFarbe({ value, onChange }) {
  return (
    <div className="config-card">
      <h2>2. Farbe</h2>
      <p className="subtitle">Wähle die Farbwelt deines Straußes</p>
      <div className="color-list">
        {COLORS.map(c => (
          <button
            key={c.id}
            className={`color-option ${value === c.id ? 'selected' : ''}`}
            onClick={() => onChange(c.id)}
            aria-pressed={value === c.id}
          >
            <span className="color-dot" style={{ background: c.dot }} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 3 – Größe ── */
function StepGroesse({ value, onChange }) {
  return (
    <div className="config-card">
      <h2>3. Größe</h2>
      <p className="subtitle">Wie groß soll dein Strauß sein?</p>
      <div className="size-list">
        {SIZES.map(s => (
          <button
            key={s.id}
            className={`size-option ${value === s.id ? 'selected' : ''}`}
            onClick={() => onChange(s.id)}
            aria-pressed={value === s.id}
          >
            <div className="size-left">
              <span className="size-icon">{s.icon}</span>
              <div>
                <div className="size-name">{s.label}</div>
                <div className="size-desc">{s.desc}</div>
              </div>
            </div>
            <span className="size-price">{fmtPrice(s.price)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 4 – Lieferung ── */
function StepLieferung({ value, onChange }) {
  return (
    <div className="config-card">
      <h2>4. Abholen / Lieferung</h2>
      <p className="subtitle">Wie möchtest du deinen Strauß erhalten?</p>
      <div className="delivery-list">
        {DELIVERIES.map(d => (
          <button
            key={d.id}
            className={`delivery-option ${value === d.id ? 'selected' : ''}`}
            onClick={() => onChange(d.id)}
            aria-pressed={value === d.id}
          >
            <span className="delivery-icon">{d.icon}</span>
            <div>
              <div className="delivery-name">{d.label}</div>
              <div className="delivery-desc">{d.desc}</div>
            </div>
            <div className={`radio-circle ${value === d.id ? 'checked' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 5 – Extras ── */
function StepExtras({ value, onChange }) {
  const toggle = (id) => {
    onChange(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  return (
    <div className="config-card">
      <h2>5. Extras</h2>
      <p className="subtitle">Mach deinen Strauß noch besonderer</p>
      <div className="extras-list">
        {EXTRAS.map(e => (
          <button
            key={e.id}
            className={`extra-option ${value.includes(e.id) ? 'selected' : ''}`}
            onClick={() => toggle(e.id)}
            aria-pressed={value.includes(e.id)}
          >
            <span className="extra-icon">{e.icon}</span>
            <span className="extra-name">{e.label}</span>
            <span className="extra-price">+{fmtPrice(e.price)}</span>
            <div className={`checkbox-sq ${value.includes(e.id) ? 'checked' : ''}`}>
              {value.includes(e.id) && '✓'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── main configurator ──────────────────────────────────────────── */
export default function Configurator() {
  const [form,     setForm]     = useState('round');
  const [color,    setColor]    = useState('rosa/pink');
  const [size,     setSize]     = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [extras,   setExtras]   = useState([]);
  const [step,     setStep]     = useState(1);

  /* compute current price */
  const price = useMemo(() => {
    const base   = SIZES.find(s => s.id === size)?.price ?? 0;
    const xtra   = extras.reduce((sum, id) => sum + (EXTRAS.find(e => e.id === id)?.price ?? 0), 0);
    return base + xtra;
  }, [size, extras]);

  /* build selection summary */
  const selectionText = useMemo(() => {
    const parts = [];
    if (form)     parts.push(FORMS.find(f => f.id === form)?.label);
    if (color)    parts.push(color);
    if (size)     parts.push(SIZES.find(s => s.id === size)?.label);
    return parts.length ? parts.join(' · ') : 'Noch keine Auswahl';
  }, [form, color, size]);

  const currentStep = useMemo(() => {
    if (!form)     return 1;
    if (!color)    return 2;
    if (!size)     return 3;
    if (!delivery) return 4;
    return 5;
  }, [form, color, size, delivery]);

  return (
    <>
      {/* header */}
      <header className="header">
        <button className="header-menu" aria-label="Menü">☰</button>
        <div className="header-logo">Blumen<span>Nolte</span></div>
        <button className="cart-btn" aria-label="Warenkorb">
          🛍
          <span className="cart-count">0</span>
        </button>
      </header>

      {/* 3D preview */}
      <div className="preview-wrapper">
        <Suspense fallback={
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#aaa',fontSize:'0.9rem' }}>
            Lade 3D-Vorschau…
          </div>
        }>
          <BouquetScene
            shape={form}
            palette={color}
            size={size ?? 'M'}
          />
        </Suspense>
        <div className="badge-360">↻ 360°</div>
      </div>

      {/* step nav */}
      <StepNav current={currentStep} />

      {/* config sections */}
      <div className="config-body">
        <StepForm     value={form}     onChange={setForm} />
        <StepFarbe    value={color}    onChange={setColor} />
        <StepGroesse  value={size}     onChange={setSize} />
        <StepLieferung value={delivery} onChange={setDelivery} />
        <StepExtras   value={extras}   onChange={setExtras} />
      </div>

      {/* bottom bar */}
      <div className="bottom-bar">
        <div className="price-block">
          <div className="price-label">Aktueller Preis</div>
          <div className="price-value">{fmtPrice(price)}</div>
        </div>
        <div className="selection-block">
          <div className="selection-label">Deine Auswahl</div>
          <div className="selection-value">{selectionText}</div>
        </div>
        <button className="next-btn">
          Weiter →
        </button>
      </div>
    </>
  );
}
