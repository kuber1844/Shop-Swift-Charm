import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, X, Plus, Minus, Trash2, Settings, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier — Shop & Inventory" },
      { name: "description", content: "A sleek storefront with an integrated inventory admin panel." },
      { property: "og:title", content: "Atelier — Shop & Inventory" },
      { property: "og:description", content: "A sleek storefront with an integrated inventory admin panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Product = { id: string; title: string; category: string; price: number; stock: number; image: string };

const SEED: Product[] = [
  { id: "1", title: "Ceramic Pour-Over Set", category: "Kitchen", price: 48, stock: 12, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=70" },
  { id: "2", title: "Linen Throw Blanket", category: "Home", price: 89, stock: 6, image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=70" },
  { id: "3", title: "Brass Desk Lamp", category: "Lighting", price: 129, stock: 3, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=70" },
];

const KEY = "atelier-products";

function Index() {
  const [products, setProducts] = useState<Product[]>(SEED);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem(KEY);
    if (s) setProducts(JSON.parse(s));
  }, []);
  const save = (p: Product[]) => {
    setProducts(p);
    localStorage.setItem(KEY, JSON.stringify(p));
  };

  const inCart = (id: string) => cart[id] ?? 0;
  const add = (id: string, d = 1) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const n = Math.max(0, Math.min(p.stock, inCart(id) + d));
    setCart((c) => {
      const nc = { ...c, [id]: n };
      if (!n) delete nc[id];
      return nc;
    });
  };
  const lines = Object.entries(cart)
    .map(([id, q]) => ({ p: products.find((x) => x.id === id)!, q }))
    .filter((l) => l.p);
  const count = lines.reduce((s, l) => s + l.q, 0);
  const total = lines.reduce((s, l) => s + l.q * l.p.price, 0);

  const checkout = () => {
    save(products.map((p) => ({ ...p, stock: p.stock - inCart(p.id) })));
    setCart({});
    setCartOpen(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <h1 className="font-display text-2xl tracking-tight">Atelier</h1>
          <div className="flex gap-2">
            <button onClick={() => setAdmin((a) => !a)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition hover:bg-secondary">
              <Settings className="h-4 w-4" /> {admin ? "Close Admin" : "Admin Panel"}
            </button>
            <button onClick={() => setCartOpen(true)} className="relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:opacity-90">
              <ShoppingBag className="h-4 w-4" /> Cart
              {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-accent text-xs text-accent-foreground">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12">
        <section className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">The Collection</p>
          <h2 className="font-display mt-2 text-4xl md:text-5xl">Objects for slow living.</h2>
        </section>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const left = p.stock - inCart(p.id);
            return (
              <article key={p.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.category}</p>
                      <h3 className="mt-1 font-medium">{p.title}</h3>
                    </div>
                    <p className="font-display text-xl">${p.price.toFixed(2)}</p>
                  </div>
                  <p className={`text-sm ${p.stock === 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}
                  </p>
                  <button disabled={left <= 0} onClick={() => add(p.id)} className="w-full rounded-full bg-primary py-2.5 text-sm text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                    {left <= 0 ? (p.stock === 0 ? "Sold out" : "Max in cart") : "Add to Cart"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className={`grid transition-all duration-500 ${admin ? "mt-16 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <AdminPanel products={products} save={save} />
          </div>
        </div>
      </main>

      {/* Cart drawer */}
      <div onClick={() => setCartOpen(false)} className={`fixed inset-0 z-40 bg-foreground/40 transition-opacity ${cartOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-2xl">Your Cart</h2>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {lines.length === 0 && <p className="text-muted-foreground">Your cart is empty.</p>}
          {lines.map(({ p, q }) => (
            <div key={p.id} className="flex gap-4">
              <img src={p.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-muted-foreground">${p.price.toFixed(2)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => add(p.id, -1)} className="rounded-full border border-border p-1"><Minus className="h-3 w-3" /></button>
                  <span className="w-6 text-center text-sm">{q}</span>
                  <button onClick={() => add(p.id, 1)} className="rounded-full border border-border p-1"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <p className="font-medium">${(q * p.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4 border-t border-border p-5">
          <div className="flex justify-between text-lg"><span>Total</span><span className="font-display">${total.toFixed(2)}</span></div>
          <button disabled={!count} onClick={checkout} className="w-full rounded-full bg-primary py-3 text-primary-foreground transition hover:opacity-90 disabled:opacity-40">Checkout</button>
        </div>
      </aside>

      {success && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/50 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-background p-8 text-center shadow-2xl animate-in zoom-in-95">
            <CheckCircle2 className="mx-auto h-14 w-14 text-accent" />
            <h3 className="font-display mt-4 text-2xl">Order placed!</h3>
            <p className="mt-2 text-muted-foreground">Thank you for your purchase. Stock has been updated.</p>
            <button onClick={() => setSuccess(false)} className="mt-6 w-full rounded-full bg-primary py-2.5 text-primary-foreground">Continue shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPanel({ products, save }: { products: Product[]; save: (p: Product[]) => void }) {
  const empty = { title: "", category: "", price: "", stock: "", image: "" };
  const [f, setF] = useState(empty);
  const input = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title || !f.category || !f.price) return;
    save([...products, { id: crypto.randomUUID(), title: f.title, category: f.category, price: Math.max(0, +f.price), stock: Math.max(0, Math.floor(+f.stock || 0)), image: f.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=70" }]);
    setF(empty);
  };
  const setStock = (id: string, stock: number) => save(products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, Math.floor(stock || 0)) } : p)));

  return (
    <section className="rounded-3xl border border-border bg-secondary/50 p-6 md:p-8">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
      <h2 className="font-display mt-1 text-3xl">Inventory Management</h2>

      <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-6">
        <input className={`${input} md:col-span-2`} placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
        <input className={input} placeholder="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} required />
        <input className={input} type="number" min="0" step="0.01" placeholder="Price" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} required />
        <input className={input} type="number" min="0" placeholder="Initial stock" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
        <input className={input} placeholder="Image URL" value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} />
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground md:col-span-6 md:w-fit"><Plus className="h-4 w-4" /> Add product</button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3"><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />{p.title}</div></td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">${p.price.toFixed(2)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setStock(p.id, p.stock - 1)} className="rounded border border-border p-1"><Minus className="h-3 w-3" /></button>
                    <input type="number" min="0" value={p.stock} onChange={(e) => setStock(p.id, +e.target.value)} className="w-16 rounded border border-input bg-background px-2 py-1 text-center" />
                    <button onClick={() => setStock(p.id, p.stock + 1)} className="rounded border border-border p-1"><Plus className="h-3 w-3" /></button>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => confirm(`Delete "${p.title}"?`) && save(products.filter((x) => x.id !== p.id))} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No products.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
