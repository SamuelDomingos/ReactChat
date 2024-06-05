import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hook/useAuth';

// Components
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoChatbubbleEllipses } from "react-icons/io5";

// Context
import { useAuthContext } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const {loginUser, loading, MessageError} = useAuth();
  const { setIsAuthenticated } = useAuthContext();

  const handleSubmit = async(e) => {
      e.preventDefault();

      // Exibe o Toast de Loading
      const loadingToast = toast.loading('Entrando na conta...', { autoClose: true, hideProgressBar: true });

      try {
        const { user, error, code } = await loginUser(email, password);
      
        if (user) {
          setIsAuthenticated(true);
          navigate('/');
          toast.update(loadingToast, { render: 'Seja bem-vindo :)', type: "success", isLoading: false, autoClose: 1500 });
        } else {
          const errorMessage = MessageError(code);
          toast.update(loadingToast, { render: errorMessage, type: 'error', isLoading: false, autoClose: 1500 });
        }
      } catch (error) {
        console.error("Erro ao realizar login:", error);
      }
      
  }

  return (
    <div className='auth'>
      <h2>Entre no melhor app de conversa!</h2>
      <p>
        ReactChat <IoChatbubbleEllipses />
      </p>

      <form className="auth-Form" onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="E-mail"
          onChange={(e) => setEmail(e.target.value)}
          value={email || ""}
        />

        <input
          type="password"
          placeholder="senha"
          onChange={(e) => setPassword(e.target.value)}
          value={password || ""}
        />

        <input type="checkbox" name="Lembre-me"/>
        <span>Lembre-me</span>

        <input type="submit" value="Entrar" />
      </form>

      <p>Ainda não tem uma conta criada? <Link to="/register">Click aqui!</Link></p>
    </div>
  )
}

export default Login