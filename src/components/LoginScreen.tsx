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

  const computeSha256 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const inputHash = await computeSha256(password);
      const expectedHash = import.meta.env.VITE_APP_PASSWORD_HASH;
      const expectedPlain = import.meta.env.VITE_APP_PASSWORD;

      const isValid = (expectedHash && inputHash === expectedHash) || 
                      (expectedPlain && password === expectedPlain);

      if (isValid) {
        onLogin();
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setError('Incorrect password. Please try again.');
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
            disabled={isSubmitting}
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
