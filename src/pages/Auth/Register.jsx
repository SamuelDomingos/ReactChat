import "./Auth.css";
import { useState } from "react";

// Components
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoChatbubbleEllipses } from "react-icons/io5";

// hooks
import { useAuth } from "../../hook/useAuth";
import { Link, useNavigate } from "react-router-dom";

// Context
import { useAuthContext } from "../../context/AuthContext";

const Register = () => {
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { registerUser, loading, MessageError} = useAuth();
  const { setIsAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();



    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }

     // Exibe o Toast de Loading
     const loadingToast = toast.loading('Criando sua conta...', { autoClose: true, hideProgressBar: true });

    try {
      const { user, code } = await registerUser(name, email, password);

      if (user) {
        setIsAuthenticated(true);
        navigate('/');
        toast.update(loadingToast, { render: 'Usuário cadastrado com sucesso!', type: 'success', isLoading: false, autoClose: 1500 });
      } else {
        const errorMessage = MessageError(code);
        toast.update(loadingToast, { render: errorMessage, type: 'error', isLoading: false, autoClose: 1500 });
      }

    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
    }

  };

  return (
    <div className="auth">
      <h2>Entre no melhor app de conversa!</h2>
      <p>
        ReactChat <IoChatbubbleEllipses />
      </p>

      <form className="auth-Form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          onChange={(e) => setName(e.target.value)}
          value={name || ""}
        />

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

        <input
          type="password"
          placeholder="Confirmar senha"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword || ""}
        />

        <input type="submit" value="Criar conta" />
      </form>

      <p>Já tem uma conta? <Link to="/login">Click aqui!</Link></p>
    </div>
  );
};

export default Register;
