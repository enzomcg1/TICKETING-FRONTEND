import { ArrowRight, ShieldCheck, Ticket, Waves } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern';
import { GlowCard } from '@/components/magicui/glow-card';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import logo from '../media/etkTicketing.webp';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#7f1d1d_100%)]" />
      <AnimatedGridPattern className="-z-10 opacity-90" />
      <div className="absolute inset-x-0 top-[-14rem] -z-10 mx-auto h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_58%)] blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="flex flex-col justify-center text-white">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md">
              <Waves className="h-4 w-4 text-rose-300" />
              Magic UI como capa visual, sin tocar el flujo
            </div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
              Soporte interno con una interfaz mas clara, rapida y preparada para produccion.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-200 sm:text-lg">
              Conservamos la autenticacion y el flujo actual, pero llevamos el acceso a una capa
              visual mas moderna para que el sistema se sienta mas confiable desde el primer uso.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <GlowCard className="border-white/15 bg-white/8 text-white shadow-none">
                <Ticket className="h-5 w-5 text-amber-300" />
                <p className="mt-4 text-sm font-semibold">Tickets visibles al instante</p>
                <p className="mt-2 text-sm text-slate-300">Acceso mas limpio a listas, estados y prioridad.</p>
              </GlowCard>
              <GlowCard className="border-white/15 bg-white/8 text-white shadow-none">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <p className="mt-4 text-sm font-semibold">Misma seguridad</p>
                <p className="mt-2 text-sm text-slate-300">No cambiamos sesiones, roles ni endpoints.</p>
              </GlowCard>
              <GlowCard className="border-white/15 bg-white/8 text-white shadow-none">
                <ArrowRight className="h-5 w-5 text-rose-300" />
                <p className="mt-4 text-sm font-semibold">Base para el rediseño</p>
                <p className="mt-2 text-sm text-slate-300">Login y listados sirven como referencia para el resto.</p>
              </GlowCard>
            </div>
          </div>

          <GlowCard className="mx-auto w-full max-w-xl rounded-[32px] border-white/20 bg-white/88 p-6 sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-rose-600">
                  Acceso seguro
                </div>
                <h2 className="mt-4 text-3xl font-bold text-slate-950">Inicia sesion</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Usa tu usuario o correo corporativo para entrar al sistema.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white/90 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
                <img src={logo} alt="ETK Ticketing" className="h-14 w-auto object-contain" />
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-group mb-0">
                <label htmlFor="email">Usuario o email</label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin o usuario@empresa.com"
                  autoComplete="username"
                />
              </div>

              <div className="form-group mb-0">
                <label htmlFor="password">Contrasena</label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Ingresa tu contrasena"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              <div className="pt-2">
                <ShimmerButton type="submit" className="w-full py-3.5 text-sm sm:text-base" disabled={loading}>
                  {loading ? 'Iniciando sesion...' : 'Iniciar sesion'}
                  <ArrowRight className="h-4 w-4" />
                </ShimmerButton>
              </div>
            </form>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">No tienes una cuenta?</span>{' '}
              <Link to="/request-register" className="font-semibold text-rose-600 transition hover:text-rose-700">
                Solicita un registro
              </Link>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}

export default Login;
