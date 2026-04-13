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
    <div className="space-y-4 p-8">
      <h1 className="text-xl font-semibold">API Keys</h1>
      <div className="flex gap-2">
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
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <div className="space-y-2">
        {keys.map((record) => (
          <div key={record.id} className="rounded border p-2 text-sm">
            {record.provider} {record.maskedKey} ({record.isValid ? "valid" : "invalid"})
          </div>
        ))}
      </div>
    </div>
  );
}
