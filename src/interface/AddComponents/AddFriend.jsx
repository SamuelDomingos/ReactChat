import { useEffect, useState } from "react";
import "./AddComponents.css";

// Components
import { IoMdClose, IoIosAddCircle } from "react-icons/io";
import { IoTime } from "react-icons/io5";
import { useAuth } from "../../hook/useAuth";
import { FaUserCircle, FaUser } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import Overlay from "../../components/Overlay";

const AddFriend = ({ onClose }) => {
  const { user, searchUsers, sendFriendRequest, loading } = useAuth();
  const [nameUser, setNameUser] = useState("");
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchUser = async (e) => {
    e.preventDefault();

    const results = await searchUsers(nameUser);
    setSearchResults(results);
    // Reset do estado quando uma nova pesquisa é feita
    setFriendRequestSent(false);
  };

  const handleAddUser = async (recipientUID) => {
    if (friendRequestSent) {
      return;
    }

    const loadingToast = toast.loading('Atualizando...', { autoClose: true, hideProgressBar: true });

    try {
      const { success, error } = await sendFriendRequest(recipientUID);
      toast.update(loadingToast, { render: 'Solicitação enviada', type: 'success', isLoading: false, autoClose: 1500 });
      setFriendRequestSent(true);
    } catch (error) {
      console.error("Erro ao enviar solicitação de amizade:", error);
    }
  };

  useEffect(() => {
    const initialSearch = async () => {
      if (user) {
        const results = await searchUsers('', user.uid);
        setSearchResults(results);
      }
    };    

    initialSearch();
  }, [searchUsers, user]);

  return (
    <div className="addFriend">
      <Overlay onClose={onClose}>
        <div className="AddContainer">
          <h2>Procurar amigo</h2>
          <button className="button-close" onClick={onClose}><IoMdClose/></button>

          <form onSubmit={handleSearchUser}>
            <input
              type="text"
              placeholder="Procure pelo nome ou id do seu amigo..."
              onChange={(e) => setNameUser(e.target.value)}
              value={nameUser || ""}
            />
            <input type="submit" value="Procurar" />
          </form>

          {loading && <Loading/>}
          {!loading && (
            <div className="listResults">
              {searchResults.length > 0 && searchResults.map((user) => (
                <button
                  onClick={() => handleAddUser(user.uid)}
                  className="result-user"
                  key={user.uid}
                  disabled={user.isFriend || friendRequestSent || user.friendRequestExists}
                >
                  {user && user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" />
                  ) : (
                    <FaUserCircle className="user-icon" />
                  )}
                  <p>{user.name}</p>
                  {user.isFriend ? (
                    <FaUser className="friend" />
                  ) : user.friendRequestSent ? (
                    <FaCheck />
                  ) : user.friendRequestExists ? (
                    <IoTime className="existsrequest" />
                  ) : (
                    <IoIosAddCircle />
                  )}
                </button>
              ))}
            </div>
          )}

        </div>
      </Overlay>
    </div>
  );
};

export default AddFriend;
