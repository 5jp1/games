import React, { useState, useEffect, useRef } from 'react';

const CODE_LIST_URL = 'https://raw.githubusercontent.com/5jp1/gamescontansets/refs/heads/main/codelist';
const MAX_ATTEMPTS = 2;
const COOKIE_NAME = 'bm_access';
const ATTEMPTS_COOKIE = 'bm_attempts';
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${TEN_YEARS}; path=/; SameSite=Lax`;
};

// The list is a plain comma-separated string of 4-digit codes, e.g. "0000,1111,2222"
const parseCodes = (text: string): string[] =>
  text
    .split(',')
    .map((c) => c.trim())
    .filter((c) => /^\d{4}$/.test(c));

export type AccessState = 'granted' | 'locked' | 'pending';

export const getAccessState = (): AccessState => {
  const value = getCookie(COOKIE_NAME);
  if (value === 'granted' || value === 'locked') return value;
  return 'pending';
};

interface CodeGateProps {
  onUnlock: () => void;
  onLock: () => void;
}

const CodeGate: React.FC<CodeGateProps> = ({ onUnlock, onLock }) => {
  const [code, setCode] = useState('');
  const [validCodes, setValidCodes] = useState<string[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(CODE_LIST_URL, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setValidCodes(parseCodes(text));
      })
      .catch((err) => {
        console.error('Failed to load code list', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (validCodes) inputRef.current?.focus();
  }, [validCodes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(digits);
    // Don't validate (or count attempts) until the code list has loaded
    if (digits.length < 4 || !validCodes) return;

    if (validCodes.includes(digits)) {
      setCookie(COOKIE_NAME, 'granted');
      onUnlock();
      return;
    }

    const attempts = (parseInt(getCookie(ATTEMPTS_COOKIE) || '0', 10) || 0) + 1;
    setCookie(ATTEMPTS_COOKIE, String(attempts));
    if (attempts >= MAX_ATTEMPTS) {
      setCookie(COOKIE_NAME, 'locked');
      onLock();
      return;
    }
    setCode('');
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center">
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        maxLength={4}
        value={code}
        disabled={!validCodes}
        onChange={handleChange}
        aria-label="Code"
        className="w-40 text-center text-3xl tracking-[0.5em] bg-slate-900 border border-slate-700 rounded-xl py-3 text-slate-100 outline-none focus:border-blue-500 disabled:opacity-50"
      />
    </div>
  );
};

export default CodeGate;
