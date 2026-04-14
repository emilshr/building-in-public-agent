"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type KeyRecord = {
  id: string;
  provider: string;
  maskedKey: string;
  isValid: boolean;
};

export default function ApiKeysSettingsPage() {
  const [provider, setProvider] = useState("openai");
  const [key, setKey] = useState("");
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/keys");
    if (response.ok) {
      const data = (await response.json()) as { keys: KeyRecord[] };
      setKeys(data.keys);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveKey() {
    const validateResponse = await fetch("/api/keys/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider, key }),
    });
    if (!validateResponse.ok) {
      setMessage("Key validation failed");
      return;
    }

    const response = await fetch("/api/keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider, key }),
    });
    if (!response.ok) {
      setMessage("Failed to save key");
      return;
    }

    setKey("");
    setMessage("Saved");
    void load();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
          Integrations
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">API Keys</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Store provider keys securely so content generation can run end-to-end.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
          Add key
        </h3>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            className="border-zinc-700 bg-zinc-900/70 text-zinc-100"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            placeholder="Provider: openai"
          />
          <Input
            className="border-zinc-700 bg-zinc-900/70 text-zinc-100"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="API key"
            type="password"
          />
          <Button
            className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
            onClick={saveKey}
          >
            Save
          </Button>
        </div>
      </section>

      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}

      <section className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
          Active keys
        </h3>
        {keys.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 text-sm text-zinc-400">
            No API keys saved yet.
          </p>
        ) : null}
        {keys.map((record) => (
          <div
            key={record.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-300"
          >
            {record.provider} {record.maskedKey} (
            {record.isValid ? "valid" : "invalid"})
          </div>
        ))}
      </section>
    </div>
  );
}
