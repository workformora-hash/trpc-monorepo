"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

interface FormPasswordGateProps {
  formTitle: string;
  isPending: boolean;
  onSubmit: (password: string) => void;
}

export function FormPasswordGate({
  formTitle,
  isPending,
  onSubmit,
}: FormPasswordGateProps) {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && password) onSubmit(password);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d131e] p-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm bg-[#182235]/70 backdrop-blur-md border border-neutral-800 p-8 rounded-2xl shadow-2xl space-y-6 text-center">
        {/* Icon */}
        <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto text-blue-400">
          <Lock className="h-8 w-8" />
        </div>

        {/* Copy */}
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-white tracking-wide">
            Password Protected
          </h1>
          <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
            <span className="text-blue-400 font-semibold">"{formTitle}"</span>{" "}
            requires a password to access.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-3 text-left">
          <div className="relative">
            <input
              type={visible ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0a0f18] border border-neutral-800 focus:border-blue-500 rounded-xl py-3 pl-4 pr-10 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <button
            onClick={() => password && onSubmit(password)}
            disabled={isPending || !password}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Verifying…
              </>
            ) : (
              "Unlock Form"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
