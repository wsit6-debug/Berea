import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Persist lockout across page refreshes via sessionStorage
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem('berea_auth_failures');
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    try {
      const stored = sessionStorage.getItem('berea_auth_lockout');
      const ts = stored ? parseInt(stored, 10) : null;
      if (ts && ts > Date.now()) return ts;
      return null;
    } catch {
      return null;
    }
  });

  // Countdown timer for lockout
  React.useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null);
        try {
          sessionStorage.removeItem('berea_auth_lockout');
        } catch {}
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const computeHash = async (str: string, salt: string = ''): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const timingSafeEqual = (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSecs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Too many failed attempts. Please wait ${remainingSecs}s.`);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const salt = import.meta.env.VITE_APP_PASSWORD_SALT || '';
      const inputHash = await computeHash(password, salt);
      const expectedHash = import.meta.env.VITE_APP_PASSWORD_HASH;
      const expectedPlain = import.meta.env.VITE_APP_PASSWORD;

      const isHashValid = expectedHash ? timingSafeEqual(inputHash, expectedHash) : false;
      const isPlainValid = expectedPlain ? timingSafeEqual(password, expectedPlain) : false;
      const isValid = isHashValid || isPlainValid;

      if (isValid) {
        setFailedAttempts(0);
        setLockoutUntil(null);
        try {
          sessionStorage.removeItem('berea_auth_failures');
          sessionStorage.removeItem('berea_auth_lockout');
        } catch {}
        onLogin();
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        try {
          sessionStorage.setItem('berea_auth_failures', String(nextAttempts));
        } catch {}

        if (nextAttempts >= 5) {
          const lockoutTime = Date.now() + 30000;
          setLockoutUntil(lockoutTime);
          try {
            sessionStorage.setItem('berea_auth_lockout', String(lockoutTime));
          } catch {}
          setError('Too many failed attempts. Locked for 30 seconds.');
        } else {
          setError(`Incorrect password. Please try again (${5 - nextAttempts} attempts remaining).`);
        }

        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while verifying the password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="berea-login-wrap">
      <div className={`berea-login-card ${isShaking ? 'animate-shake' : 'animate-fadeIn'}`}>
        {/* Brand Monogram */}
        <div className="berea-login-logo">
          <img
            src="/berea-logo.jpg"
            alt="Berea Emblem"
          />
        </div>

        {/* Title & Tagline */}
        <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#26221F', margin: 0 }}>
              Berea
            </h1>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 600, 
              color: '#B4793D', 
              backgroundColor: '#FAF5ED', 
              border: '1px solid #EBE5DC', 
              padding: '2px 6px', 
              borderRadius: '9999px' 
            }}>
              Acts 17:11
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#78716C', margin: 0, lineHeight: 1.4 }}>
            Examining the Scriptures Daily
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="berea-password" 
              style={{ 
                display: 'block', 
                textAlign: 'center',
                fontSize: '0.6875rem', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em', 
                color: '#78716C', 
                marginBottom: '0.5rem' 
              }}
            >
              Access Password
            </label>

            <div className="berea-login-input-wrap">
              <span className="berea-login-input-icon">
                <Lock style={{ width: '16px', height: '16px' }} />
              </span>

              <input
                id="berea-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                autoFocus
                autoComplete="current-password"
                placeholder="Enter password"
                className="berea-login-input"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="berea-login-eye-btn"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff style={{ width: '16px', height: '16px' }} />
                ) : (
                  <Eye style={{ width: '16px', height: '16px' }} />
                )}
              </button>
            </div>

            {error && (
              <div className="berea-login-error">
                <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Boolean(lockoutUntil && Date.now() < lockoutUntil)}
            className="berea-login-btn"
          >
            <span>Unlock Berea</span>
            <ArrowRight style={{ width: '16px', height: '16px', color: '#D4A373' }} />
          </button>
        </form>

        {/* Footer Security Badge */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid #F0EAE1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.375rem',
          color: '#A8A29E',
          fontSize: '0.6875rem'
        }}>
          <ShieldCheck style={{ width: '14px', height: '14px', color: '#B4793D' }} />
          <span>Private Theological Study Access</span>
        </div>
      </div>
    </div>
  );
};
