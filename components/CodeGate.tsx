import React, { useState, useEffect, useRef } from 'react';

const VALID_CODES = ['8282', '2828', '1014'];
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(digits);
    if (digits.length < 4) return;

    if (VALID_CODES.includes(digits)) {
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
        onChange={handleChange}
        aria-label="Code"
        className="w-40 text-center text-3xl tracking-[0.5em] bg-slate-900 border border-slate-700 rounded-xl py-3 text-slate-100 outline-none focus:border-blue-500"
      />
    </div>
  );
};

export default CodeGate;
