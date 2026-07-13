import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function Login() {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/tours';

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form);

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'company') navigate('/empresa');
      else navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Cuenta TourClick</p>
          <h1>{mode === 'login' ? 'Ingresa para reservar' : 'Crea tu cuenta de cliente'}</h1>
          <p>Clientes, empresas y administradores usan la misma puerta de acceso con roles separados.</p>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label className="field">
                <span>Nombre completo</span>
                <input required value={form.name} onChange={(event) => update('name', event.target.value)} />
              </label>
              <label className="field">
                <span>WhatsApp</span>
                <input required value={form.phone} onChange={(event) => update('phone', event.target.value)} />
              </label>
            </>
          )}
          <label className="field">
            <span>Correo</span>
            <input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
          </label>
          <label className="field">
            <span>Clave</span>
            <input required type="password" value={form.password} onChange={(event) => update('password', event.target.value)} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary btn-full">
            {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
          <button className="btn btn-soft btn-full" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'No tengo cuenta' : 'Ya tengo cuenta'}
          </button>
        </form>
        <Link to="/tours">Volver a tours</Link>
      </section>
    </div>
  );
}

export default Login;
