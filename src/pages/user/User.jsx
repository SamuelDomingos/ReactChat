import "./User.css";
import { useAuthContext } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { useAuth } from "../../hook/useAuth";

// Components
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";

const User = () => {
  const { updateUserProfile, updateProfileImage, MessageError, loading } = useAuth();
  const { user } = useAuthContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdate = async(e) => {
    e.preventDefault();

    // Exibe o Toast de Loading
    const loadingToast = toast.loading('Atualizando...', { autoClose: true, hideProgressBar: true });

    try {

      const { success, error } = await updateUserProfile({
        name: name,
        bio: bio,
        newPassword: newPassword
      });
    
      if (success) {
        toast.update(loadingToast, { render: 'Atualizado com sucesso', type: 'success', isLoading: false, autoClose: 1500 });
      } else {
        const errorMessage = MessageError(error);
        toast.update(loadingToast, { render: errorMessage, type: 'error', isLoading: false, autoClose: 1500 });
      }
    } catch (error) {
      console.error("Erro ao realizar login:", error);
    }
  }

   // Função para lidar com a alteração do arquivo
   const handleFileChange = async(event) => {
    const selectedFile = event.target.files[0];
    setProfileImage(selectedFile);

    // Exibe o Toast de Loading
    const loadingToast = toast.loading('Atualizando...', { autoClose: true, hideProgressBar: true });

    try {

      const { success, error } = await updateProfileImage(selectedFile);
   
    
      if (success) {
        toast.update(loadingToast, { render: 'Atualizado com sucesso', type: 'success', isLoading: false, autoClose: 1500 });
      } else {
        const errorMessage = MessageError(error);
        toast.update(loadingToast, { render: errorMessage, type: 'error', isLoading: false, autoClose: 1500 });
      }
    } catch (error) {
      console.error("Erro ao realizar login:", error);
    }
  };

  useEffect(() => {
    // Atualiza os campos com os dados do usuário quando houver mudanças no contexto
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setNewPassword(user.password || "");
      setBio(user.bio || "");
      setProfileImage(user.profileImage || "")
    }
  }, [user]);

  return (
    <div className="profile">
      <div className="profile-data">
       {loading && <Loading/>}
        {!loading && (
         <form className="user-Form" onSubmit={handleUpdate}>

         {user && user.profileImage ? (
         <label>
           <img
             src={user.profileImage}
             alt="Profile"
             className="profile-image"
             onClick={() => setProfileImage(null)}
           />
           <input
             type="file"
             accept="image/*"
             style={{ display: 'none' }}
             onChange={handleFileChange}
           />
         </label>
       ) : (
         <label className="user-icon-label">
           <FaUserCircle className="user-icon" />
           <input
             type="file"
             accept="image/*"
             style={{ display: 'none' }}
             onChange={handleFileChange}
           />
         </label>
       )}
 
 
           <label>Usuario:</label>
           <input
             type="text"
             placeholder="Nome"
             onChange={(e) => setName(e.target.value)}
             value={name}
           />
 
           <input type="email" placeholder="E-mail" disabled value={email} />
 
           <label>Bio:</label>
           <input
             type="text"
             placeholder="Escreva um pouco sobre voce..."
             onChange={(e) => setBio(e.target.value)}
             value={bio}
           />
 
           <label>Quer alterar a senha?</label>
           <input
             type="password"
             placeholder="Senha"
             onChange={(e) => setNewPassword(e.target.value)}
             value={newPassword}
           />
 
             {loading && <Loading/>}
             {!loading && <input type="submit" value="Atualizar" />}
         </form>
       )}
      </div>
    </div>
  );
};

export default User;
