import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../hooks/useBranding';
import { getErrorMessage } from '../services/api';

const rolePillars = [
  {
    label: 'Admins',
    description: 'Approve parents and review school-wide communication.'
  },
  {
    label: 'Teachers',
    description: 'Compose clear class updates with media in a lightweight flow.'
  },
  {
    label: 'Parents',
    description: 'Read school messages in a clean, focused notification feed.'
  }
];

const initialLogin = {
  email: '',
  password: ''
};

const initialSignup = {
  name: '',
  email: '',
  phone: '',
  password: ''
};

export const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const branding = useBranding();
  const isSignup = location.pathname === '/signup';

  const [loginForm, setLoginForm] = useState(initialLogin);
  const [signupForm, setSignupForm] = useState(initialSignup);
  const [status, setStatus] = useState({ error: '', success: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSignup && location.state?.success) {
      setStatus({ error: '', success: location.state.success });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [isSignup, location.pathname, location.state, navigate]);

  const authCopy = useMemo(
    () =>
      isSignup
        ? {
            title: 'Parent sign up',
            subtitle: 'Create your account and wait for school admin approval.',
            action: 'Request access',
            secondaryText: 'Already approved?',
            secondaryLink: '/login',
            secondaryLabel: 'Log in'
          }
        : {
            title: branding.loginTitle,
            subtitle: branding.loginSubtitle,
            action: 'Log in',
            secondaryText: 'Need a parent account?',
            secondaryLink: '/signup',
            secondaryLabel: 'Sign up'
          },
    [branding.loginSubtitle, branding.loginTitle, isSignup]
  );

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ error: '', success: '' });
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signup(signupForm);
        setSignupForm(initialSignup);
        navigate('/login', {
          state: {
            success: 'Your request has been submitted. You can log in after admin approval.'
          }
        });
      } else {
        const data = await login(loginForm);
        navigate(`/${data.user.role}`);
      }
    } catch (error) {
      setStatus({
        success: '',
        error: getErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="page-shell order-2 space-y-6 lg:order-1">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {branding.logo ? (
              <img
                src={branding.logo}
                alt={`${branding.schoolName} logo`}
                className="h-14 w-14 rounded-2xl object-cover shadow-soft"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-semibold text-white shadow-soft"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {(branding.schoolName || 'S').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">School Portal</p>
              <p className="text-lg font-semibold tracking-tight text-ink">{branding.schoolName}</p>
            </div>
          </div>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {isSignup ? 'Parent access, kept simple.' : branding.loginTitle}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {isSignup
              ? `Create your account for ${branding.schoolName} and wait for school approval before signing in.`
              : branding.loginSubtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {rolePillars.map((item) => (
            <Card key={item.label} className="soft-panel space-y-3 p-5">
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="text-sm leading-6 text-muted">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="order-1 lg:order-2">
        <Card className="mx-auto w-full max-w-xl rounded-[32px] p-6 sm:p-8">
          <div className="mb-8 space-y-3">
            <div
              className="inline-flex rounded-full p-1"
              style={{ backgroundColor: 'rgba(var(--primary-color-rgb), 0.08)' }}
            >
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm transition"
                style={
                  !isSignup
                    ? { backgroundColor: '#fff', color: '#1d1d1f', boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)' }
                    : { color: '#6e6e73' }
                }
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full px-4 py-2 text-sm transition"
                style={
                  isSignup
                    ? { backgroundColor: '#fff', color: '#1d1d1f', boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)' }
                    : { color: '#6e6e73' }
                }
              >
                Parent signup
              </Link>
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">{authCopy.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{authCopy.subtitle}</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignup ? (
              <>
                <Input
                  label="Full name"
                  name="name"
                  placeholder="Aarav Sharma"
                  value={signupForm.name}
                  onChange={handleSignupChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="parent@school.com"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={signupForm.phone}
                  onChange={handleSignupChange}
                  required
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  required
                />
              </>
            ) : (
              <>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@school.com"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />
              </>
            )}

            {status.error ? (
              <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{status.error}</p>
            ) : null}

            {status.success ? (
              <p className="rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">{status.success}</p>
            ) : null}

            <Button type="submit" className="w-full py-3.5 text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : authCopy.action}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {authCopy.secondaryText}{' '}
            <Link to={authCopy.secondaryLink} className="brand-link font-medium">
              {authCopy.secondaryLabel}
            </Link>
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
            <Link to="/terms" className="brand-link font-medium">
              Terms of Use
            </Link>
            <Link to="/privacy" className="brand-link font-medium">
              Privacy Policy
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
};
