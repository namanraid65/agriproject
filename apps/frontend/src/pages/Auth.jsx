import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket.js';
import { UserRoles } from '@open-agri/shared';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const Auth = () => {
  const { login, register, styles, isB2B, user } = useMarket();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(UserRoles.CUSTOMER);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');

  React.useEffect(() => {
    if (user) {
      const uRole = user.role?.toUpperCase();
      if (uRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const isB2BRoleSelected = [UserRoles.FARMER, UserRoles.DISTRIBUTOR, UserRoles.WHOLESALER].includes(role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let loggedUser;
      if (isLogin) {
        loggedUser = await login(email, password);
      } else {
        const payload = {
          name,
          email,
          password,
          role,
          address: { street: '', city: '', state: '', zipCode: '', country: '' }
        };
        
        if (isB2BRoleSelected) {
          payload.companyDetails = {
            companyName,
            taxId
          };
        }
        
        loggedUser = await register(payload);
      }
      
      // Navigate to redirect location or homepage after login
      const query = new URLSearchParams(window.location.search);
      let redirect = query.get('redirect');
      
      if (loggedUser && loggedUser.role === 'admin') {
        redirect = '/admin';
      } else if (!redirect) {
        redirect = '/';
      }
      
      navigate(redirect);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 shadow-xl overflow-hidden">
        {/* Header Block */}
        <div className={`p-8 text-center text-white transition-all duration-500 ${isB2B ? 'bg-stone-900' : 'bg-emerald-950'}`}>
          <div className="flex justify-center mb-2">
            <Sparkles className="h-7 w-7 animate-pulse text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to OpenAgri</h2>
          <p className="text-sm opacity-80 mt-1">
            {isLogin ? 'Sign in to access your dashboard' : 'Join our network of farmers & consumers'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200/60">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label htmlFor="auth-name" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Full Name</label>
              <input
                id="auth-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${styles.focusRing}`}
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Email Address</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${styles.focusRing}`}
              placeholder="name@farm.com"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Password</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${styles.focusRing}`}
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div className="space-y-4">


              {/* Dynamic B2B Business Profile details */}
              {isB2BRoleSelected && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 transition-all duration-300">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 uppercase tracking-wider">
                    <ShieldCheck className={`h-4 w-4 ${styles.textHighlight}`} />
                    <span>Business Verification Details</span>
                  </div>
                  <div>
                    <label htmlFor="auth-company-name" className="block text-xs font-semibold text-stone-500 mb-1">Company/Farm Name</label>
                    <input
                      id="auth-company-name"
                      name="companyName"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border border-stone-250 bg-white text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                      placeholder="Green Valley Farms LLC"
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-tax-id" className="block text-xs font-semibold text-stone-500 mb-1">Tax ID / License Number</label>
                    <input
                      id="auth-tax-id"
                      name="taxId"
                      type="text"
                      required
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border border-stone-250 bg-white text-sm focus:outline-none focus:ring-1 ${styles.focusRing}`}
                      placeholder="TX-84930-A"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold shadow-md transition-all duration-200 ${styles.primaryBg}`}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center pt-2 space-y-4">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-xs text-stone-500 hover:text-stone-700 font-bold block mx-auto"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
            <div className="pt-4 border-t border-stone-100">
              <Link
                to="/"
                className={`text-xs font-bold transition-colors ${
                  isB2B ? 'text-amber-700 hover:text-amber-900' : 'text-emerald-700 hover:text-emerald-950'
                }`}
              >
                ← Back to Marketplace
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Auth;
