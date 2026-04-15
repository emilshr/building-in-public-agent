"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          API Keys
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Store provider keys so content generation can run end-to-end.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Add key
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            placeholder="Provider: openai"
          />
          <Input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="API key"
            type="password"
          />
          <Button onClick={saveKey}>Save</Button>
        </div>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Active keys
        </h3>
        {keys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              No API keys saved yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a provider key above to enable content generation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border">
            {keys.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{record.provider}</p>
                  <p className="text-xs text-muted-foreground">
                    {record.maskedKey}
                  </p>
                </div>
                <Badge variant={record.isValid ? "default" : "destructive"}>
                  {record.isValid ? "Valid" : "Invalid"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
