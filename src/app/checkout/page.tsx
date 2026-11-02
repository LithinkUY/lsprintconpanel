"use client";
import { useState, useEffect, useRef } from "react";
import {
    ShoppingCart, CreditCard, Building2, Banknote, ArrowLeft,
    Check, Loader2, AlertCircle, Printer, Send, Home,
} from "lucide-react";
import Link from "next/link";

interface CartItem {
    service: string;
    product: string;
    productId: string;
    serviceSlug: string;
    quantity: number;
    width?: number;
    height?: number;
    m2?: number;
    variants: string[];
    notes?: string;
    basePrice: number;
    total: number;
    currency: string;
    uyu_rate?: number;
}

interface Gateway {
    id: number;
    name: string;
    type: string;
    description: string;
    config: Record<string, string>;
    active: boolean;
    test_mode: boolean;
    sort_order: number;
}

interface OrderResult {
    order_id: number;
    order_number: string;
    client_id: number;
    client_code: string;
    pin_code: string;
    client_name: string;
    is_new_client: boolean;
}

const GATEWAY_ICONS: Record<string, React.ReactNode> = {
    mercadopago: <CreditCard size={20} className="text-sky-400" />,
    bank_transfer: <Building2 size={20} className="text-emerald-400" />,
    cash: <Banknote size={20} className="text-amber-400" />,
};
const GATEWAY_COLORS: Record<string, string> = {
    mercadopago: "border-sky-500/30 hover:border-sky-400/50",
    bank_transfer: "border-emerald-500/30 hover:border-emerald-400/50",
    cash: "border-amber-500/30 hover:border-amber-400/50",
};
const GATEWAY_BADGE: Record<string, string> = {
    mercadopago: "bg-sky-400/10 text-sky-400",
    bank_transfer: "bg-emerald-400/10 text-emerald-400",
    cash: "bg-amber-400/10 text-amber-400",
};

function formatAmount(total: number, currency: string) {
    if (currency === "UYU") {
        return `$${total.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `US$ ${Number(total).toFixed(2)}`;
}

export default function CheckoutPage() {
    const [cart, setCart] = useState<CartItem | null>(null);
    const [gateways, setGateways] = useState<Gateway[]>([]);
    const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem("checkout_cart");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed.variants)) parsed.variants = [];
            setCart(parsed);
        }
        fetch("/api/payment-gateways")
            .then(r => r.json())
            .then((rows: Gateway[]) => {
                const active = rows.filter(g => g.active).sort((a, b) => a.sort_order - b.sort_order);
                setGateways(active);
                if (active.length === 1) setSelectedGateway(active[0]);
            })
            .catch(() => {});
    }, []);

    const handlePay = async () => {
        if (!cart || !selectedGateway) return;
        setLoading(true);
        setError("");
        try {
            const completeRes = await fetch("/api/checkout/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name, email, phone, cart,
                    gateway_id: selectedGateway.id,
                    gateway_type: selectedGateway.type,
                }),
            });
            const completeData = await completeRes.json();
            if (!completeRes.ok) throw new Error(completeData.error ?? "Error creando el pedido");

            if (selectedGateway.type === "mercadopago") {
                const unitPrice = cart.currency === "USD"
                    ? (cart.total * (cart.uyu_rate || 43)) / cart.quantity
                    : cart.total / cart.quantity;

                const mpRes = await fetch("/api/payment-gateways/mercadopago/preference", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        items: [{
                            id: cart.productId,
                            title: `${cart.service} - ${cart.product}`,
                            quantity: cart.quantity,
                            unit_price: Number(unitPrice.toFixed(2)),
                            currency_id: "UYU",
                        }],
                        payer: { name, email },
                        external_reference: completeData.order_number,
                    }),
                });
                const mpData = await mpRes.json();
                if (mpRes.ok && mpData.init_point) {
                    sessionStorage.removeItem("checkout_cart");
                    window.location.href = mpData.is_test ? mpData.sandbox_init_point : mpData.init_point;
                    return;
                } else {
                    throw new Error(`Error de MercadoPago: ${mpData.detail || mpData.error || "No se pudo generar el link de pago"}`);
                }
            }

            setOrderResult(completeData);
            sessionStorage.removeItem("checkout_cart");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al procesar");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    const buildWhatsappMsg = (order: OrderResult) => {
        const lines = [
            `🧾 *COMPROBANTE DE PEDIDO*`,
            `Orden: *${order.order_number}*`,
            `Cliente: ${order.client_name}`,
            `Email: ${email}`,
            `Producto: ${cart?.product}`,
            `Total: ${cart ? formatAmount(cart.total, cart.currency) : ""}`,
            `Método de pago: ${selectedGateway?.name}`,
            ``,
            `_Enviado desde lsprint.uy_`,
        ];
        return encodeURIComponent(lines.join("\n"));
    };

    if (!cart) {
        return (
            <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <ShoppingCart size={48} className="mx-auto text-slate-600" />
                    <p className="text-slate-400">No hay productos seleccionados en el pedido.</p>
                    <Link href="/pedido" className="inline-block px-6 py-3 rounded-xl bg-[#00CFFF] text-[#05080f] font-black text-sm hover:bg-[#33d9ff] transition-colors">
                        Ir al catálogo
                    </Link>
                </div>
            </div>
        );
    }

    if (orderResult) {
        const isBank = selectedGateway?.type === "bank_transfer";
        const isCash = selectedGateway?.type === "cash";
        const bankCfg = selectedGateway?.config ?? {};
        const amtStr = formatAmount(cart.total, cart.currency);

        return (
            <>
                <style>{`@media print { .no-print { display:none!important; } body { background:#fff!important; color:#000!important; } .print-card { background:#fff!important; border:1px solid #ccc!important; color:#000!important; } }`}</style>

                <div className="min-h-screen bg-[#07090f] py-12 px-4">
                    <div className="max-w-lg mx-auto space-y-5" ref={printRef}>
                        <div className="print-card bg-[#0d121c] border border-emerald-500/25 rounded-3xl p-6 text-center space-y-2">
                            <div className="w-14 h-14 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-3">
                                <Check size={28} className="text-emerald-400" />
                            </div>
                            <h1 className="text-xl font-black text-white">¡Pedido recibido!</h1>
                            <p className="text-sm text-slate-400">Tu solicitud quedó registrada y nos pondremos en contacto a la brevedad.</p>
                        </div>

                        <div className="print-card bg-[#0d121c] border border-white/10 rounded-3xl p-5 space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalle del pedido</p>
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-400">N° de orden</span>
                                <span className="text-sm font-black text-[#00CFFF] font-mono">{orderResult.order_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Producto</span>
                                <span className="text-sm text-white font-semibold">{cart.product}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Servicio</span>
                                <span className="text-xs text-slate-300">{cart.service}</span>
                            </div>
                            {(cart.variants?.length ?? 0) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-xs text-slate-400">Variantes</span>
                                    <span className="text-xs text-slate-300">{cart.variants.join(", ")}</span>
                                </div>
                            )}
                            {cart.m2 && (
                                <div className="flex justify-between">
                                    <span className="text-xs text-slate-400">Medidas</span>
                                    <span className="text-xs text-slate-300">{cart.width}m × {cart.height}m = {Number(cart.m2).toFixed(2)}m²</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Cantidad</span>
                                <span className="text-xs text-slate-300">×{cart.quantity}</span>
                            </div>
                            <div className="border-t border-white/10 pt-2.5 flex justify-between">
                                <span className="text-sm font-bold text-white">Total</span>
                                <span className="text-xl font-black text-[#00CFFF]">{amtStr}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Método de pago</span>
                                <span className="text-xs text-slate-300">{selectedGateway?.name}</span>
                            </div>
                        </div>

                        {isBank && (
                            <div className="print-card bg-[#0d121c] border border-emerald-500/25 rounded-3xl p-5 space-y-2">
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Datos para la transferencia</p>
                                {bankCfg.bank_name && <div className="flex justify-between"><span className="text-xs text-slate-400">Banco</span><span className="text-xs text-white">{bankCfg.bank_name}</span></div>}
                                {bankCfg.account_holder && <div className="flex justify-between"><span className="text-xs text-slate-400">Titular</span><span className="text-xs text-white">{bankCfg.account_holder}</span></div>}
                                {bankCfg.account_number && <div className="flex justify-between"><span className="text-xs text-slate-400">Cuenta / Alias</span><span className="text-xs text-white font-mono">{bankCfg.account_number}</span></div>}
                                {bankCfg.instructions && <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-white/10">{bankCfg.instructions}</p>}
                                <div className="mt-3 bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-3 text-center">
                                    <p className="text-xs text-emerald-400/80">Monto a transferir: <strong className="text-emerald-400">{amtStr}</strong></p>
                                </div>
                            </div>
                        )}

                        {isCash && (
                            <div className="print-card bg-amber-400/5 border border-amber-400/20 rounded-3xl p-5">
                                <p className="text-sm text-amber-400/80">{selectedGateway?.config?.instructions ?? "Pagá en efectivo al retirar tu pedido."}</p>
                            </div>
                        )}

                        <div className="no-print space-y-3">
                            {isBank && <UploadReceipt orderId={orderResult.order_id} />}

                            <a
                                href={`https://wa.me/?text=${buildWhatsappMsg(orderResult)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-bold text-sm hover:bg-[#25D366]/20 transition-colors"
                            >
                                <Send size={16} /> Enviar comprobante por WhatsApp
                            </a>

                            <button
                                onClick={handlePrint}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0d121c] border border-white/10 text-slate-300 font-semibold text-sm hover:text-white transition-colors"
                            >
                                <Printer size={16} /> Imprimir / Guardar PDF
                            </button>

                            <Link
                                href="/"
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#00CFFF] text-[#05080f] font-black text-sm hover:bg-[#33d9ff] transition-colors"
                            >
                                <Home size={17} /> Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-[#07090f] py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
                >
                    <ArrowLeft size={16} /> Volver
                </button>

                <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                    Confirmar <span className="text-[#00CFFF]">Pedido</span>
                </h1>

                {/* Order summary */}
                <div className="bg-[#0d121c] border border-white/10 rounded-3xl p-6 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumen del pedido</p>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-base font-bold text-white">{cart.product}</p>
                            <p className="text-xs text-slate-400">{cart.service}</p>
                            {(cart.variants?.length ?? 0) > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {(cart.variants ?? []).map((v, i) => (
                                        <span key={i} className="text-[10px] bg-white/5 border border-white/10 text-slate-300 px-2.5 py-0.5 rounded-full">{v}</span>
                                    ))}
                                </div>
                            )}
                            {cart.m2 && <p className="text-xs text-slate-400 mt-1.5">{cart.width}m × {cart.height}m = {Number(cart.m2).toFixed(2)}m²</p>}
                            {cart.notes && <p className="text-xs text-slate-400 mt-1">&quot;{cart.notes}&quot;</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-xs text-slate-500">×{cart.quantity}</p>
                            <p className="text-xl font-black text-[#00CFFF]">
                                {formatAmount(cart.total, cart.currency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact info */}
                <div className="bg-[#0d121c] border border-white/10 rounded-3xl p-6 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Datos de contacto</p>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre completo *</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-[#141c2b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00CFFF]/50"
                            placeholder="Tu nombre completo"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-[#141c2b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00CFFF]/50"
                                placeholder="tu@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Teléfono / WhatsApp</label>
                            <input
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full bg-[#141c2b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00CFFF]/50"
                                placeholder="099 ..."
                            />
                        </div>
                    </div>
                </div>

                {/* Payment methods */}
                {gateways.length > 0 && (
                    <div className="bg-[#0d121c] border border-white/10 rounded-3xl p-6 space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Método de pago</p>
                        <div className="space-y-2.5">
                            {gateways.map(gw => {
                                const isSel = selectedGateway?.id === gw.id;
                                return (
                                    <button
                                        key={gw.id}
                                        onClick={() => setSelectedGateway(gw)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                                            isSel
                                                ? "border-[#00CFFF]/50 bg-[#00CFFF]/10"
                                                : `border-white/10 bg-[#141c2b] ${GATEWAY_COLORS[gw.type] ?? "hover:border-white/25"}`
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${GATEWAY_BADGE[gw.type] ?? "bg-white/10 text-white"}`}>
                                            {GATEWAY_ICONS[gw.type] ?? <CreditCard size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white">{gw.name}</p>
                                            {gw.description && <p className="text-xs text-slate-400 mt-0.5">{gw.description}</p>}
                                            {gw.test_mode && <span className="mt-1 inline-block text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full">MODO PRUEBA</span>}
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSel ? "border-[#00CFFF] bg-[#00CFFF]" : "border-slate-500"}`}>
                                            {isSel && <Check size={10} className="text-black" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedGateway?.type === "bank_transfer" && (
                            <div className="bg-[#141c2b] border border-white/10 rounded-2xl p-4 text-sm text-slate-300 space-y-1">
                                <p className="text-xs font-bold text-slate-400 mb-2">Datos para transferencia</p>
                                {selectedGateway.config.bank_name && <p>🏦 {selectedGateway.config.bank_name}</p>}
                                {selectedGateway.config.account_holder && <p>👤 {selectedGateway.config.account_holder}</p>}
                                {selectedGateway.config.account_number && <p className="font-mono">📋 {selectedGateway.config.account_number}</p>}
                            </div>
                        )}
                        {selectedGateway?.type === "cash" && (
                            <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-4">
                                <p className="text-sm text-amber-400/80">{selectedGateway.config.instructions ?? "Pagá en efectivo al retirar."}</p>
                            </div>
                        )}
                    </div>
                )}

                {gateways.length === 0 && (
                    <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-4 flex items-center gap-3">
                        <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />
                        <p className="text-sm text-yellow-400/80">No hay métodos de pago disponibles. Contactanos directamente por WhatsApp.</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-400/10 border border-red-400/20 rounded-2xl p-4 flex items-center gap-3">
                        <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                <button
                    onClick={handlePay}
                    disabled={loading || !selectedGateway || !name || !email}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#00CFFF] text-[#05080f] font-black text-base hover:bg-[#33d9ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_28px_rgba(0,207,255,0.25)]"
                >
                    {loading
                        ? <><Loader2 size={20} className="animate-spin" /> Procesando...</>
                        : selectedGateway?.type === "mercadopago"
                            ? <><CreditCard size={20} /> Pagar con MercadoPago</>
                            : selectedGateway?.type === "bank_transfer"
                                ? <><Building2 size={20} /> Confirmar pedido (Transferencia)</>
                                : selectedGateway?.type === "cash"
                                    ? <><Banknote size={20} /> Confirmar pedido (Efectivo)</>
                                    : <><ShoppingCart size={20} /> Confirmar pedido</>
                    }
                </button>
            </div>
        </div>
    );
}

function UploadReceipt({ orderId }: { orderId: number }) {
    const [uploading, setUploading] = useState(false);
    const [done, setDone] = useState(false);
    const [err, setErr] = useState("");

    const handleFile = (file: File) => {
        setUploading(true);
        setErr("");
        const reader = new FileReader();
        reader.onload = async e => {
            try {
                const file_data = e.target?.result as string;
                const res = await fetch(`/api/orders/${orderId}/upload`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ file_name: file.name, file_data, file_type: file.type, uploaded_by: "client" }),
                });
                if (!res.ok) throw new Error("Error al subir");
                setDone(true);
            } catch {
                setErr("No se pudo subir el archivo");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    if (done) return (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl text-sm text-emerald-400">
            <Check size={16} /> Comprobante enviado correctamente
        </div>
    );

    return (
        <label className="cursor-pointer block">
            <div className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed text-sm font-semibold transition-colors ${uploading ? "border-white/20 text-slate-500" : "border-emerald-500/40 text-emerald-400 hover:border-emerald-400/70 hover:bg-emerald-400/5"}`}>
                {uploading ? <><Loader2 size={16} className="animate-spin" /> Subiendo...</> : <>📎 Adjuntar comprobante de transferencia</>}
            </div>
            {err && <p className="text-xs text-red-400 mt-1 text-center">{err}</p>}
            <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                disabled={uploading}
            />
        </label>
    );
}
