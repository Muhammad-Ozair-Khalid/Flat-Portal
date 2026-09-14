"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  Info,
  ArrowRight,
  Scale,
  Receipt,
  Users,
} from "lucide-react";
import { MEMBERS } from "@/lib/flat";
import { fmtDate, fmtMoney } from "@/lib/format";

type Entry = {
  id: string;
  payerId: string;
  amount: number;
  note: string;
  date: string; // yyyy-mm-dd
  participantIds: string[];
};

const STORAGE_KEY = "flat408-ledger";
const NAMES_KEY = "flat408-room-names"; // shared with the rooms floor

const ALL_IDS = MEMBERS.map((m) => m.id);

const SEED: Entry[] = [
  { id: "seed-1", payerId: "m1", amount: 4200, note: "Groceries — big Sunday run", date: "2026-09-08", participantIds: ALL_IDS },
  { id: "seed-2", payerId: "m3", amount: 3600, note: "Internet + electricity", date: "2026-09-05", participantIds: ALL_IDS },
  { id: "seed-3", payerId: "m2", amount: 2400, note: "Water bottles delivery", date: "2026-09-12", participantIds: ALL_IDS },
  { id: "seed-4", payerId: "m6", amount: 1500, note: "Cleaning supplies", date: "2026-09-11", participantIds: ALL_IDS },
];

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "?";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? first;
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}

export function LedgerBook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  // form state
  const [payerId, setPayerId] = useState<string>(MEMBERS[0]?.id ?? "");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [participants, setParticipants] = useState<string[]>(ALL_IDS);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setEntries(raw ? (JSON.parse(raw) as Entry[]) : SEED);
    } catch {
      setEntries(SEED);
    }
    try {
      const rawNames = localStorage.getItem(NAMES_KEY);
      if (rawNames) setNames(JSON.parse(rawNames) as Record<string, string>);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* storage may be unavailable */
    }
  }, [entries, loaded]);

  const displayName = useMemo(
    () => (id: string) => {
      const m = MEMBERS.find((x) => x.id === id);
      return names[id]?.trim() || m?.name || "Unknown";
    },
    [names],
  );

  // balances: net = paid − share, per member
  const { balances, totalSpent } = useMemo(() => {
    const paid: Record<string, number> = {};
    const share: Record<string, number> = {};
    let total = 0;
    for (const e of entries) {
      const parts = e.participantIds.length ? e.participantIds : ALL_IDS;
      const per = e.amount / parts.length;
      paid[e.payerId] = (paid[e.payerId] ?? 0) + e.amount;
      for (const p of parts) share[p] = (share[p] ?? 0) + per;
      total += e.amount;
    }
    const rows = MEMBERS.map((m) => ({
      id: m.id,
      net: (paid[m.id] ?? 0) - (share[m.id] ?? 0),
    })).sort((a, b) => b.net - a.net);
    return { balances: rows, totalSpent: total };
  }, [entries]);

  // settle-up: greedy min-cash-flow
  const settlements = useMemo(() => {
    const debtors = balances
      .filter((b) => b.net < -0.005)
      .map((b) => ({ id: b.id, amt: -b.net }))
      .sort((a, b) => b.amt - a.amt);
    const creditors = balances
      .filter((b) => b.net > 0.005)
      .map((b) => ({ id: b.id, amt: b.net }))
      .sort((a, b) => b.amt - a.amt);
    const out: { from: string; to: string; amount: number }[] = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i];
      const c = creditors[j];
      if (!d || !c) break;
      const pay = Math.min(d.amt, c.amt);
      if (pay > 0.005) out.push({ from: d.id, to: c.id, amount: pay });
      d.amt -= pay;
      c.amt -= pay;
      if (d.amt < 0.005) i++;
      if (c.amt < 0.005) j++;
    }
    return out;
  }, [balances]);

  function toggleParticipant(id: string) {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function addEntry(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!payerId) return setError("Pick who paid.");
    if (!Number.isFinite(value) || value <= 0) return setError("Enter an amount greater than zero.");
    if (participants.length === 0) return setError("Split between at least one person.");
    setEntries((prev) => [
      {
        id: newId(),
        payerId,
        amount: Math.round(value * 100) / 100,
        note: note.trim() || "Shared expense",
        date,
        participantIds: participants,
      },
      ...prev,
    ]);
    setAmount("");
    setNote("");
    setError("");
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [entries],
  );

  return (
    <div>
      {/* Header */}
      <div className="ambient relative mb-6 overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 elevate-lg sm:p-8">
        <div className="relative z-[1]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Wallet className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Ledger
              </h1>
              <p className="text-muted-foreground">The flat&rsquo;s shared khata — who paid, who owes.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Receipt className="h-4 w-4 text-accent" /> {entries.length} entries
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Scale className="h-4 w-4 text-accent" /> {fmtMoney(totalSpent)} logged
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4 text-accent" /> {MEMBERS.length} members
            </span>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Local demo — entries are saved on this device. Connect Supabase to sync for everyone.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: add + list */}
        <div className="space-y-6 lg:col-span-3">
          <form onSubmit={addEntry} className="rounded-2xl border border-border/70 bg-card p-5 elevate">
            <h2 className="font-display text-base font-semibold text-foreground">Add an expense</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">Who paid</span>
                <select
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                >
                  {MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {displayName(m.id)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">Amount (Rs)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-foreground">What for</span>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Groceries, bills, water…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-foreground">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40 sm:w-56"
                />
              </label>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Split between</span>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setParticipants(ALL_IDS)}
                    className="press rounded-md px-2 py-1 font-medium text-primary hover:bg-primary/10"
                  >
                    Everyone
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipants([])}
                    className="press rounded-md px-2 py-1 font-medium text-muted-foreground hover:bg-muted"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {MEMBERS.map((m) => {
                  const on = participants.includes(m.id);
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => toggleParticipant(m.id)}
                      aria-pressed={on}
                      className={`press rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        on
                          ? "border-primary bg-primary/12 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {displayName(m.id)}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-danger">{error}</p>}

            <button
              type="submit"
              className="press raise mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground elevate hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" /> Add to ledger
            </button>
          </form>

          {/* Entries */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 elevate">
            <h2 className="font-display text-base font-semibold text-foreground">Recent entries</h2>
            {sortedEntries.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No entries yet. Add the first shared expense above.
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {sortedEntries.map((e) => {
                  const parts = e.participantIds.length ? e.participantIds : ALL_IDS;
                  const payer = displayName(e.payerId);
                  return (
                    <li
                      key={e.id}
                      className="group flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-xs font-bold text-primary">
                        {initialsOf(payer)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{e.note}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {payer} paid · {fmtDate(e.date)} · split {parts.length} way{parts.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-foreground">{fmtMoney(e.amount)}</span>
                      <button
                        type="button"
                        onClick={() => removeEntry(e.id)}
                        className="press rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                        aria-label={`Delete ${e.note}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right: balances + settle-up */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border/70 bg-card p-5 elevate">
            <h2 className="font-display text-base font-semibold text-foreground">Balances</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Net of what each person paid vs. their share.</p>
            <ul className="mt-4 space-y-1.5">
              {balances.map((b) => {
                const settled = Math.abs(b.net) < 0.005;
                return (
                  <li key={b.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-bold text-muted-foreground">
                      {initialsOf(displayName(b.id))}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{displayName(b.id)}</span>
                    <span
                      className={`text-sm font-semibold ${
                        settled ? "text-muted-foreground" : b.net > 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {settled ? "settled" : b.net > 0 ? `+${fmtMoney(b.net)}` : fmtMoney(b.net)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5 elevate">
            <h2 className="font-display text-base font-semibold text-foreground">Settle up</h2>
            {settlements.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">All square — nobody owes anyone right now. 🎉</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {settlements.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2.5 text-sm"
                  >
                    <span className="min-w-0 truncate font-medium text-foreground">{displayName(s.from)}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">{displayName(s.to)}</span>
                    <span className="shrink-0 font-semibold text-primary">{fmtMoney(s.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
