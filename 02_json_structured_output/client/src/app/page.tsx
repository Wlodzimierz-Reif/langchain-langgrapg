"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";

type Answer = {
  summary: string;
  confidence: number;
};

export default function Home() {
  // Local UI state for the current query, collected answers, and in-flight request flag.
  const [query, setQuery] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);

  // Refs used for form access and restoring keyboard focus after submit.
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const q = query.trim();

    if (!q || loading) return;
    setLoading(true);

    try {
      // Proxy through the Next.js API route that talks to the backend model.
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }
      console.log({ data });

      const { summary, confidence } = data as Answer;

      // Prepend the newest answer so recent results stay at the top.
      setAnswers((prev) => [{ summary, confidence }, ...prev]);
      setQuery("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Failed to fetch answer", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-zinc-50">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-24 pt-8">
        <header className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">
            Hello Agent - Ask Anything
          </h1>
        </header>

        {/* Answers feed */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {answers.length === 0 ? (
              <p className="text-sm text-zinc-600">
                No answers yet. Ask a question below
              </p>
            ) : (
              answers.map((answer, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-200 p-3"
                >
                  <div className="text-sm leading-6">{answer.summary}</div>
                  <div className="mt-1 text-xs text-cinc-500">
                    Confidence: {answer.confidence.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sticky composer pinned to the bottom */}
        <form
          className="fixed inset-x-0 bottom-0 mx-auto w-full max-2 max-w-2xl px-4 py-4 backdrop-blur"
          ref={formRef}
          onSubmit={handleQuerySubmit}
        >
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your questions and press Enter"
              disabled={loading}
              className="h-11"
            />
            <Button type="submit" disabled={loading} className="h-11">
              {loading ? "Asking..." : "Ask"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
