import { useState, useEffect, useCallback } from "react";

const BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");
const API_TARGET_LABEL = BASE || "via Vite proxy -> localhost:9090";

class ApiError extends Error {
  constructor(status, message, payload) {
    super(message || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

const request = async (path, options) => {
  const response = await fetch(`${BASE}${path}`, options);
  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof payload === "string" && payload.trim()
        ? payload
        : `Request failed (${response.status})`;
    throw new ApiError(response.status, message, payload);
  }

  return payload;
};

const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }),
  postText: (path, body) => request(path, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body,
  }),
  put: (path, body) => request(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }),
  delete: (path) => request(path, { method: "DELETE" }),
};

const getErrorMessage = (error) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong.";
};

const getCartItems = (cart) => (
  cart?.itemsList ||
  cart?.items ||
  cart?.cartItems ||
  (Array.isArray(cart) ? cart : [])
);

const getProductName = (item) => item?.product?.name || item?.productName || item?.name || "—";
const getProductPrice = (item) => item?.product?.price ?? item?.price ?? 0;
const getProductQuantity = (item) => item?.quantity || item?.qty || 1;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Epilogue:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0e0e0e; --surface: #161616; --surface2: #1f1f1f;
    --border: #2a2a2a; --text: #f0ede8; --muted: #666;
    --accent: #e8d5a3; --accent2: #c8491a; --user: #4a9eff;
    --display: 'Syne', sans-serif; --body: 'Epilogue', sans-serif;
    --r: 4px;
  }
  body { background: var(--bg); font-family: var(--body); color: var(--text); min-height: 100vh; }

  /* Role Screen */
  .role-screen {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 56px; padding: 40px;
  }
  .role-heading h1 {
    font-family: var(--display); font-size: clamp(40px,7vw,80px);
    font-weight: 800; letter-spacing: -0.04em; color: var(--text);
    text-align: center; line-height: 1;
  }
  .role-heading h1 em { color: var(--accent); font-style: normal; }
  .role-heading p { text-align: center; color: var(--muted); font-size: 13px; margin-top: 10px; letter-spacing: 0.04em; }
  .role-cards { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
  .role-card {
    width: 220px; padding: 32px 24px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 8px; cursor: pointer;
    transition: all 0.18s; display: flex; flex-direction: column; gap: 14px;
  }
  .role-card:hover { transform: translateY(-4px); }
  .role-card.admin:hover { border-color: var(--accent); }
  .role-card.user:hover { border-color: var(--user); }
  .role-icon { font-size: 26px; }
  .role-label { font-family: var(--display); font-size: 17px; font-weight: 700; }
  .role-card.admin .role-label { color: var(--accent); }
  .role-card.user .role-label { color: var(--user); }
  .role-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }

  /* Login */
  .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px; }
  .login-box {
    width: 100%; max-width: 340px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 8px; padding: 36px;
    display: flex; flex-direction: column; gap: 20px;
  }
  .login-back { font-size: 12px; color: var(--muted); cursor: pointer; transition: color 0.15s; width: fit-content; }
  .login-back:hover { color: var(--text); }
  .login-title { font-family: var(--display); font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
  .login-title .ac { color: var(--accent); }
  .login-title .uc { color: var(--user); }
  .login-field { display: flex; flex-direction: column; gap: 7px; }
  .login-field label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .login-field input {
    font-family: var(--body); font-size: 14px; padding: 10px 13px;
    background: var(--bg); border: 1px solid var(--border); border-radius: var(--r);
    color: var(--text); outline: none; width: 100%; transition: border-color 0.15s;
  }
  .login-field input:focus { border-color: #555; }
  .login-btn {
    font-family: var(--display); font-size: 12px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; padding: 12px;
    border: none; border-radius: var(--r); cursor: pointer; width: 100%; transition: all 0.15s;
  }
  .login-btn.admin { background: var(--accent); color: #0e0e0e; }
  .login-btn.admin:hover { background: #f5e8c0; }
  .login-btn.user { background: var(--user); color: #fff; }
  .login-btn.user:hover { background: #70b8ff; }
  .login-hint { font-size: 11px; color: var(--muted); text-align: center; line-height: 1.5; }

  /* App Shell */
  .app { display: flex; min-height: 100vh; }
  .sidebar {
    width: 208px; min-width: 208px; background: var(--surface);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .sidebar-top { padding: 22px 18px 16px; border-bottom: 1px solid var(--border); }
  .sidebar-logo { font-family: var(--display); font-size: 15px; font-weight: 800; letter-spacing: -0.02em; }
  .sidebar-logo .dot { color: var(--accent); }
  .sidebar-role { margin-top: 5px; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; }
  .sidebar-role.admin { color: var(--accent); }
  .sidebar-role.user { color: var(--user); }
  .sidebar-username { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .sidebar-nav { padding: 10px 0; flex: 1; }
  .nav-section { padding: 12px 18px 4px; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: #3a3a3a; }
  .nav-item {
    display: flex; align-items: center; gap: 9px; padding: 9px 18px;
    font-size: 13px; color: var(--muted); cursor: pointer;
    transition: all 0.15s; border-left: 2px solid transparent;
  }
  .nav-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }
  .nav-item.active.admin { color: var(--accent); border-left-color: var(--accent); background: rgba(232,213,163,0.05); }
  .nav-item.active.user  { color: var(--user);  border-left-color: var(--user);  background: rgba(74,158,255,0.05); }
  .nav-icon { font-size: 14px; width: 16px; text-align: center; }
  .sidebar-bottom { padding: 14px 18px; border-top: 1px solid var(--border); }
  .logout-btn {
    font-family: var(--body); font-size: 12px; color: var(--muted);
    background: none; border: 1px solid var(--border); border-radius: var(--r);
    padding: 7px 14px; cursor: pointer; width: 100%; transition: all 0.15s;
  }
  .logout-btn:hover { color: var(--text); border-color: #555; }

  /* Main */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 13px 26px; display: flex; align-items: center; justify-content: space-between;
  }
  .topbar-title { font-family: var(--display); font-size: 13px; font-weight: 600; letter-spacing: -0.01em; }
  .topbar-meta { font-size: 11px; color: var(--muted); letter-spacing: 0.04em; }
  .content { flex: 1; padding: 26px; overflow-y: auto; max-width: 980px; }

  /* Cards */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 20px 22px; margin-bottom: 14px; }
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .card-title { font-family: var(--display); font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }

  /* Form */
  .row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-family: var(--display); font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
  input, select {
    font-family: var(--body); font-size: 13px; padding: 8px 12px;
    border: 1px solid var(--border); border-radius: var(--r);
    background: var(--bg); color: var(--text); outline: none;
    min-width: 140px; transition: border-color 0.15s;
  }
  input:focus, select:focus { border-color: #555; }
  input[type="number"] { width: 86px; min-width: 86px; }

  /* Buttons */
  .btn {
    font-family: var(--display); font-size: 11px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 9px 18px; border: none; border-radius: var(--r);
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .btn-admin { background: var(--accent); color: #0e0e0e; }
  .btn-admin:hover { background: #f5e8c0; }
  .btn-user  { background: var(--user); color: #fff; }
  .btn-user:hover  { background: #70b8ff; }
  .btn-danger { background: var(--accent2); color: #fff; }
  .btn-danger:hover { background: #a63a14; }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: #555; }
  .btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-sm { padding: 5px 12px; font-size: 10px; }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    font-family: var(--display); font-size: 9px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);
    padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.015); }

  /* Product Grid */
  .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(196px,1fr)); gap: 12px; }
  .product-card {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 6px;
    padding: 16px; display: flex; flex-direction: column; gap: 6px;
    transition: border-color 0.15s, transform 0.15s;
  }
  .product-card:hover { border-color: #3a3a3a; transform: translateY(-2px); }
  .product-cat { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .product-name { font-family: var(--display); font-size: 14px; font-weight: 600; letter-spacing: -0.01em; }
  .product-price { font-family: var(--display); font-size: 20px; font-weight: 700; color: var(--user); margin-top: 4px; }
  .product-stock { font-size: 11px; color: var(--muted); }
  .product-actions { margin-top: 8px; display: flex; gap: 6px; align-items: center; }
  .qty-input { width: 52px !important; min-width: 52px !important; padding: 6px 8px !important; font-size: 12px !important; text-align: center; }

  /* Search bar */
  .search-bar {
    display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;
    margin-bottom: 18px; padding: 14px 18px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 6px;
  }

  /* Badges */
  .badge { font-size: 10px; padding: 2px 8px; border-radius: 20px; border: 1px solid var(--border); color: var(--muted); letter-spacing: 0.04em; white-space: nowrap; }
  .badge-green { border-color: #2d5a2d; color: #5cb85c; background: rgba(92,184,92,0.08); }
  .badge-blue  { border-color: #1a3a6b; color: var(--user);  background: rgba(74,158,255,0.08); }

  /* Cart */
  .cart-total { font-family: var(--display); font-size: 20px; font-weight: 700; color: var(--user); }
  .cart-empty { text-align: center; padding: 48px; color: var(--muted); font-size: 13px; }
  .cart-empty .ce-icon { font-size: 36px; margin-bottom: 12px; }
  .cart-empty .ce-sub { margin-top: 6px; font-size: 11px; }

  /* Orders */
  .order-list { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
  .order-row { display: grid; grid-template-columns: minmax(0, 1.6fr) repeat(4, minmax(96px, 0.7fr)); gap: 16px; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--border); }
  .order-row:last-child { border-bottom: none; }
  .order-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .order-name { font-family: var(--display); font-size: 14px; font-weight: 600; letter-spacing: -0.01em; }
  .order-meta-line { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .order-cell { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .order-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
  .order-value { font-size: 13px; color: var(--text); }
  .order-value.accent { color: var(--user); font-family: var(--display); font-weight: 700; }
  @media (max-width: 720px) {
    .order-row { grid-template-columns: 1fr 1fr; gap: 12px; }
    .order-main { grid-column: 1 / -1; }
  }

  /* Divider */
  .divider { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
  .empty { font-size: 12px; color: var(--muted); padding: 20px 0; text-align: center; letter-spacing: 0.04em; }

  /* Toast */
  .toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    font-size: 12px; padding: 10px 16px; border-radius: var(--r);
    background: var(--surface2); border: 1px solid var(--border); color: var(--text);
    box-shadow: 0 8px 24px rgba(0,0,0,0.5); animation: toastIn 0.2s ease; max-width: 300px;
  }
  .toast.error   { border-color: var(--accent2); color: #e87a5a; }
  .toast.success { border-color: #2d5a2d; color: #5cb85c; }
  @keyframes toastIn { from { transform: translateY(10px); opacity:0 } to { transform: translateY(0); opacity:1 } }
`;

/* ── Toast ──────────────────────────────────────────────────────────────── */
let _tid = 0;
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "info") => {
    const id = ++_tid;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, show };
}

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN VIEWS
══════════════════════════════════════════════════════════════════════════ */

function AdminProducts({ toast }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name:"", category:"", price:"", quantity:"" });
  const [stock, setStock] = useState({ name:"", qty:"" });
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await api.get("/products/all");
      setProducts(Array.isArray(d) ? d : []);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const doSearch = async () => {
    if (!search.trim()) return load();
    try {
      const d = await api.get(`/products/search/${encodeURIComponent(search)}`);
      setProducts(Array.isArray(d) ? d : []);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };
  const doCat = async () => {
    if (!cat.trim()) return load();
    try {
      const d = await api.get(`/products/category/${encodeURIComponent(cat)}`);
      setProducts(Array.isArray(d) ? d : []);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };

  const handleAdd = async () => {
    if (!form.name) return;
    try {
      const res = await api.post("/admin/products/add", { name:form.name, category:form.category, price:parseFloat(form.price)||0, quantity:parseInt(form.quantity)||0 });
      toast(res,"success");
      load();
      setForm({name:"",category:"",price:"",quantity:""});
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };
  const handleStock = async () => {
    if (!stock.name||!stock.qty) return;
    try {
      const res = await api.post(`/admin/products/${encodeURIComponent(stock.name)}/add-stock`, parseInt(stock.qty));
      toast(res,"success");
      load();
      setStock({name:"",qty:""});
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };

  return (<>
    <div className="card">
      <div className="card-title" style={{marginBottom:14}}>Add Product</div>
      <div className="row">
        {[["name","Name","text"],["category","Category","text"],["price","Price","number"],["quantity","Stock","number"]].map(([k,l,t])=>(
          <div className="field" key={k}><label>{l}</label><input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={l} /></div>
        ))}
        <button className="btn btn-admin" onClick={handleAdd}>Add</button>
      </div>
    </div>

    <div className="card">
      <div className="card-title" style={{marginBottom:14}}>Restock</div>
      <div className="row">
        <div className="field"><label>Product Name</label><input value={stock.name} onChange={e=>setStock(s=>({...s,name:e.target.value}))} placeholder="exact name" /></div>
        <div className="field"><label>Add Qty</label><input type="number" value={stock.qty} onChange={e=>setStock(s=>({...s,qty:e.target.value}))} /></div>
        <button className="btn btn-ghost" onClick={handleStock}>Add Stock</button>
      </div>
    </div>

    <div className="card">
      <div className="card-header">
        <div className="card-title">All Products</div>
        <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
      </div>
      <div className="row" style={{marginBottom:14}}>
        <div className="field"><label>Search</label><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="keyword…" /></div>
        <button className="btn btn-ghost btn-sm" onClick={doSearch}>Go</button>
        <div className="field"><label>Category</label><input value={cat} onChange={e=>setCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doCat()} placeholder="category…" /></div>
        <button className="btn btn-ghost btn-sm" onClick={doCat}>Filter</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>{setSearch("");setCat("");load();}}>Reset</button>
      </div>
      <div className="table-wrap">
        {products.length===0 ? <div className="empty">No products</div> : (
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
            <tbody>{products.map((p,i)=>(
              <tr key={i}>
                <td style={{fontWeight:500}}>{p.name||p.productName||"—"}</td>
                <td><span className="badge">{p.category||"—"}</span></td>
                <td style={{color:"var(--user)",fontFamily:"var(--display)",fontWeight:600}}>₹{p.price??"—"}</td>
                <td>{p.quantity??p.stock??"—"}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  </>);
}

function AdminCustomers({ toast }) {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [lookup, setLookup] = useState("");
  const [found, setFound] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await api.get("/admin/customer/all");
      setCustomers(Array.isArray(d) ? d : []);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  }, [toast]);
  useEffect(()=>{ load(); },[load]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      const res = await api.postText("/admin/customer/add", name.trim());
      toast(res,"success");
      setName("");
      load();
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };
  const handleLookup = async () => {
    if (!lookup.trim()) return;
    try {
      const d = await api.get(`/admin/customer/${encodeURIComponent(lookup)}`);
      setFound(d);
    } catch (error) {
      setFound(null);
      toast(getErrorMessage(error), "error");
    }
  };

  return (<>
    <div className="card">
      <div className="card-title" style={{marginBottom:14}}>Add Customer</div>
      <div className="row">
        <div className="field"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd()} placeholder="Customer name" /></div>
        <button className="btn btn-admin" onClick={handleAdd}>Add</button>
      </div>
    </div>
    <div className="card">
      <div className="card-title" style={{marginBottom:14}}>Lookup</div>
      <div className="row">
        <div className="field"><label>Name</label><input value={lookup} onChange={e=>setLookup(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLookup()} placeholder="Customer name" /></div>
        <button className="btn btn-ghost" onClick={handleLookup}>Search</button>
      </div>
      {found && <div style={{marginTop:12,padding:"10px 14px",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:"var(--r)",fontSize:13}}><b>{found.name||found.customerName||JSON.stringify(found)}</b></div>}
    </div>
    <div className="card">
      <div className="card-header">
        <div className="card-title">All Customers ({customers.length})</div>
        <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
      </div>
      {customers.length===0 ? <div className="empty">No customers</div> : (
        <table><thead><tr><th>#</th><th>Name</th></tr></thead>
        <tbody>{customers.map((c,i)=>(
          <tr key={i}><td style={{color:"var(--muted)",fontSize:12}}>{i+1}</td><td>{c.name||c.customerName||JSON.stringify(c)}</td></tr>
        ))}</tbody></table>
      )}
    </div>
  </>);
}

function AdminOrders({ toast }) {
  const [orders, setOrders] = useState([]);
  const load = useCallback(async () => {
    try {
      const d = await api.get("/admin/orders/all");
      setOrders(Array.isArray(d) ? d : []);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  },[toast]);
  useEffect(()=>{ load(); },[load]);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">All Orders ({orders.length})</div>
        <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
      </div>
      {orders.length===0 ? <div className="empty">No orders yet</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Customer</th><th>Product</th><th>Qty</th><th>Price</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>{orders.map((o,i)=>(
              <tr key={i}>
                <td style={{fontFamily:"var(--display)",fontWeight:600,fontSize:12}}>#{i+1}</td>
                <td>{o.customerName||o.customer||"—"}</td>
                <td>{o.name||o.productName||"—"}</td>
                <td>{o.quantity??"—"}</td>
                <td style={{color:"var(--user)",fontWeight:600}}>₹{o.price??"—"}</td>
                <td>{o.dateOfPurchase||"—"}</td>
                <td><span className="badge badge-green">{o.status||"placed"}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   USER VIEWS
══════════════════════════════════════════════════════════════════════════ */

function UserCatalog({ customerName, toast }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [qtys, setQtys] = useState({});

  const load = useCallback(async () => {
    try {
      const d = await api.get("/products/all");
      setProducts(Array.isArray(d) ? d : []);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  },[toast]);
  useEffect(()=>{ load(); },[load]);

  const doSearch = async () => {
    if (!search.trim()) return load();
    try {
      const d = await api.get(`/products/search/${encodeURIComponent(search)}`);
      setProducts(Array.isArray(d) ? d : []);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };
  const doCat = async () => {
    if (!cat.trim()) return load();
    try {
      const d = await api.get(`/products/category/${encodeURIComponent(cat)}`);
      setProducts(Array.isArray(d) ? d : []);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };

  const addToCart = async (p) => {
    const name = p.name || p.productName;
    const qty  = qtys[name] || 1;
    try {
      const res  = await api.post(`/customer/${encodeURIComponent(customerName)}/cart/add`, { productName: name, quantity: qty });
      toast(res, "success");
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };

  return (<>
    <div className="search-bar">
      <div className="field"><label>Search</label>
        <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="Search products…" />
      </div>
      <button className="btn btn-ghost btn-sm" onClick={doSearch}>Search</button>
      <div className="field"><label>Category</label>
        <input value={cat} onChange={e=>setCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doCat()} placeholder="e.g. Electronics" />
      </div>
      <button className="btn btn-ghost btn-sm" onClick={doCat}>Filter</button>
      <button className="btn btn-ghost btn-sm" onClick={()=>{setSearch("");setCat("");load();}}>Reset</button>
    </div>

    {products.length===0 ? <div className="empty">No products found</div> : (
      <div className="product-grid">
        {products.map((p,i) => {
          const name = p.name||p.productName||"Unknown";
          return (
            <div className="product-card" key={i}>
              <div className="product-cat">{p.category||"Uncategorized"}</div>
              <div className="product-name">{name}</div>
              <div className="product-price">₹{p.price??"—"}</div>
              <div className="product-stock">{p.quantity??p.stock??"—"} in stock</div>
              <div className="product-actions">
                <input type="number" min="1" className="qty-input"
                  value={qtys[name]||1}
                  onChange={e=>setQtys(q=>({...q,[name]:parseInt(e.target.value)||1}))}
                />
                <button className="btn btn-user btn-sm" onClick={()=>addToCart(p)}>Add to Cart</button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </>);
}

function UserCart({ customerName, toast }) {
  const [cart, setCart] = useState(null);
  const [qtyEdits, setQtyEdits] = useState({});

  const loadCart = useCallback(async () => {
    try {
      const d = await api.get(`/customer/${encodeURIComponent(customerName)}/cart`);
      setCart(d);
    } catch (error) {
      setCart(null);
      toast(getErrorMessage(error), "error");
    }
  },[customerName, toast]);
  useEffect(()=>{ loadCart(); },[loadCart]);

  const handleUpdate = async (productName) => {
    const quantity = parseInt(qtyEdits[productName] ?? "", 10);
    if (!productName || quantity < 1 || Number.isNaN(quantity)) return;
    try {
      const res = await api.put(`/customer/${encodeURIComponent(customerName)}/cart/update-qty/${encodeURIComponent(productName)}`, { quantity });
      toast(res,"success");
      loadCart();
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };
  const handleRemove = async (n) => {
    try {
      const res = await api.delete(`/customer/${encodeURIComponent(customerName)}/cart/remove/${encodeURIComponent(n)}`);
      toast(res);
      loadCart();
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };
  const handleClear = async () => {
    try {
      await api.delete(`/customer/${encodeURIComponent(customerName)}/cart/clear-cart`);
      toast("Cart cleared", "success");
      setCart(null);
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };
  const handleOrder = async () => {
    try {
      const res = await api.post(`/customer/${encodeURIComponent(customerName)}/place-order`);
      toast(res,"success");
      loadCart();
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  };

  const items = getCartItems(cart);
  const total = items.reduce((s,item)=>s+(getProductPrice(item)*getProductQuantity(item)),0);

  return (<>
    {items.length===0 ? (
      <div className="card"><div className="cart-empty">
        <div className="ce-icon">◻</div>
        <div>Your cart is empty</div>
        <div className="ce-sub">Browse the catalog to add products</div>
      </div></div>
    ) : (
      <div className="card">
        <div className="card-header">
          <div className="card-title">Cart · {items.length} item{items.length!==1?"s":""}</div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <span className="cart-total">₹{total.toFixed(2)}</span>
            <button className="btn btn-user" onClick={handleOrder}>Place Order</button>
            <button className="btn btn-danger btn-sm" onClick={handleClear}>Clear</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th>Actions</th></tr></thead>
            <tbody>{items.map((item,i)=>{
              const n=getProductName(item);
              const q=getProductQuantity(item);
              const pr=getProductPrice(item);
              return (<tr key={i}>
                <td style={{fontWeight:500}}>{n}</td>
                <td style={{color:"var(--muted)"}}>₹{pr}</td>
                <td>
                  <div className="product-actions">
                    <input
                      type="number"
                      min="1"
                      className="qty-input"
                      value={qtyEdits[n] ?? q}
                      onChange={e=>setQtyEdits(v=>({...v,[n]:e.target.value}))}
                    />
                    <button className="btn btn-ghost btn-sm" onClick={()=>handleUpdate(n)}>Update</button>
                  </div>
                </td>
                <td style={{color:"var(--user)",fontWeight:600}}>₹{(pr*q).toFixed(2)}</td>
                <td><button className="btn btn-danger btn-sm" onClick={()=>handleRemove(n)}>Remove</button></td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </div>
    )}
  </>);
}

function UserOrders({ customerName, toast }) {
  const [orders, setOrders] = useState([]);
  const load = useCallback(async () => {
    try {
      const d = await api.get(`/customer/${encodeURIComponent(customerName)}/orders`);
      setOrders(Array.isArray(d) ? d : []);
    } catch (error) {
      setOrders([]);
      toast(getErrorMessage(error), "error");
    }
  },[customerName, toast]);
  useEffect(()=>{ load(); },[load]);

  if (orders.length===0) return (
    <div className="card"><div className="cart-empty">
      <div className="ce-icon">◈</div>
      <div>No orders yet</div>
      <div className="ce-sub">Place an order from your cart</div>
    </div></div>
  );

  return (<>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <span style={{fontSize:13,color:"var(--muted)"}}>{orders.length} order{orders.length!==1?"s":""}</span>
      <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
    </div>
    <div className="order-list">
      {orders.map((o,i)=>{
        const price = Number(o.price ?? 0);
        const quantity = Number(o.quantity ?? 1);
        const subtotal = price * quantity;

        return (
          <div className="order-row" key={i}>
            <div className="order-main">
              <div className="order-name">{o.name||o.productName||"—"}</div>
              <div className="order-meta-line">
                Order #{i + 1} · {o.category||"General"} · {o.dateOfPurchase||"—"}
              </div>
            </div>
            <div className="order-cell">
              <span className="order-label">Qty</span>
              <span className="order-value">{quantity}</span>
            </div>
            <div className="order-cell">
              <span className="order-label">Price</span>
              <span className="order-value">₹{price}</span>
            </div>
            <div className="order-cell">
              <span className="order-label">Subtotal</span>
              <span className="order-value accent">₹{subtotal}</span>
            </div>
            <div className="order-cell">
              <span className="order-label">Status</span>
              <span className="order-value">{o.status||"Placed"}</span>
            </div>
          </div>
        );
      })}
    </div>
  </>);
}

/* ══════════════════════════════════════════════════════════════════════════
   ROLE SELECT + LOGIN
══════════════════════════════════════════════════════════════════════════ */

function RoleSelect({ onSelect }) {
  return (
    <div className="role-screen">
      <div className="role-heading">
        <h1>ecom<em>.</em></h1>
        <p>Select how you'd like to continue</p>
      </div>
      <div className="role-cards">
        <div className="role-card admin" onClick={()=>onSelect("admin")}>
          <div className="role-icon">⬡</div>
          <div className="role-label">Admin</div>
          <div className="role-desc">Manage products, inventory, customers and view all orders.</div>
        </div>
        <div className="role-card user" onClick={()=>onSelect("user")}>
          <div className="role-icon">◎</div>
          <div className="role-label">Customer</div>
          <div className="role-desc">Browse catalog, manage your cart, and track order history.</div>
        </div>
      </div>
    </div>
  );
}

function Login({ role, onLogin, onBack }) {
  const [name, setName] = useState("");
  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-back" onClick={onBack}>← Back</div>
        <div className="login-title">
          Continue as <span className={role==="admin"?"ac":"uc"}>{role==="admin"?"Admin":"Customer"}</span>
        </div>
        <div className="login-field">
          <label>{role==="admin"?"Admin name":"Your name"}</label>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&name.trim()&&onLogin(name.trim())} placeholder={role==="admin"?"Enter admin name":"Enter your name"} autoFocus />
        </div>
        <button className={`login-btn ${role}`} onClick={()=>name.trim()&&onLogin(name.trim())}>Continue →</button>
        {role==="user"&&<div className="login-hint">A new account will be created automatically if this name doesn't exist yet.</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════════════════ */

const ADMIN_NAV = [
  { key:"products",  icon:"▦", label:"Products",  section:"Catalog" },
  { key:"customers", icon:"◎", label:"Customers", section:"Management" },
  { key:"orders",    icon:"◈", label:"Orders",    section:"Management" },
];
const USER_NAV = [
  { key:"catalog", icon:"▦", label:"Catalog",       section:"Shop" },
  { key:"cart",    icon:"◻", label:"Cart",          section:"Shop" },
  { key:"orders",  icon:"◈", label:"Order History", section:"Account" },
];

export default function App() {
  const [stage, setStage]     = useState("role");
  const [role, setRole]       = useState(null);
  const [userName, setUser]   = useState("");
  const [view, setView]       = useState(null);
  const { toasts, show }      = useToast();

  const selectRole  = (r) => { setRole(r); setStage("login"); };
  const handleLogin = async (name) => {
    if (role==="user") {
      try {
        await api.postText("/admin/customer/add", name);
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 409)) {
        show("Could not create or load this customer account.", "error");
        return;
        }
      }
    }
    setUser(name);
    setView(role==="admin" ? "products" : "catalog");
    setStage("app");
  };
  const logout = () => { setStage("role"); setRole(null); setUser(""); setView(null); };

  const nav = role==="admin" ? ADMIN_NAV : USER_NAV;
  const sections = [...new Set(nav.map(n=>n.section))];
  const current = nav.find(n=>n.key===view);

  const renderView = () => {
    if (role==="admin") {
      if (view==="products")  return <AdminProducts toast={show} />;
      if (view==="customers") return <AdminCustomers toast={show} />;
      if (view==="orders")    return <AdminOrders toast={show} />;
    } else {
      if (view==="catalog") return <UserCatalog customerName={userName} toast={show} />;
      if (view==="cart")    return <UserCart    customerName={userName} toast={show} />;
      if (view==="orders")  return <UserOrders  customerName={userName} toast={show} />;
    }
  };

  return (<>
    <style>{styles}</style>

    {stage==="role"  && <RoleSelect onSelect={selectRole} />}
    {stage==="login" && <Login role={role} onLogin={handleLogin} onBack={()=>setStage("role")} />}
    {stage==="app"   && (
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-logo">ecom<span className="dot">.</span></div>
            <div className={`sidebar-role ${role}`}>{role==="admin"?"Admin Panel":"Customer Portal"}</div>
            <div className="sidebar-username">{userName}</div>
          </div>
          <div className="sidebar-nav">
            {sections.map(sec=>(
              <div key={sec}>
                <div className="nav-section">{sec}</div>
                {nav.filter(n=>n.section===sec).map(n=>(
                  <div key={n.key} className={`nav-item${view===n.key?` active ${role}`:""}`} onClick={()=>setView(n.key)}>
                    <span className="nav-icon">{n.icon}</span>{n.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sidebar-bottom">
            <button className="logout-btn" onClick={logout}>Sign out</button>
          </div>
        </nav>
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">{current?.label}</div>
            <div className="topbar-meta">{API_TARGET_LABEL}</div>
          </div>
          <div className="content">{renderView()}</div>
        </div>
      </div>
    )}

    <div className="toast-wrap">
      {toasts.map(t=>(
        <div key={t.id} className={`toast${t.type==="error"?" error":t.type==="success"?" success":""}`}>{t.msg}</div>
      ))}
    </div>
  </>);
}
