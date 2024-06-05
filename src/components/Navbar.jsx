import "./Navbar.css";
import { useEffect, useState } from "react";

// Components
import AddFriend from "../interface/AddComponents/AddFriend";
import Notification from "../interface/Notification";
import AddGroup from "../interface/AddComponents/AddGroup";
import FriendList from "./FriendList";

// Icons
import { IoIosAdd, IoMdPersonAdd } from "react-icons/io";
import { IoAddCircleSharp } from "react-icons/io5";
import { FaUserCircle, FaBell } from "react-icons/fa";
import { RiLogoutBoxFill } from "react-icons/ri";
import { AiOutlineHome } from "react-icons/ai";

// Hooks
import { useAuth } from "../hook/useAuth";
import { Link, useLocation} from "react-router-dom";

// Context
import { useAuthContext } from "../context/AuthContext";

const Navbar = ({isOpen}) => {
  console.log(isOpen);
  const { logoutUser, getPendingRequests } = useAuth();
  const { user } = useAuthContext();

  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [pendingRequestsReceived, setPendingRequestsReceived] = useState([]);
  const [friendUID, setFriendUID] = useState(null);
  const [groupId, setGroupId] = useState(null);

  const [MenuOpen, setMenuOpen] = useState(false);
  const [addGroup, setAddGroup] = useState(false);
  const [AddToggle, setAddToggle] = useState(false);
  const [notiToggle, setNotiToggle] = useState(false);
  const [isAddFriendVisible, setAddFriendVisible] = useState(false);

  // Função para definir o friendUID
  Navbar.setFriendUID = (newFriendUID) => {
    setFriendUID(newFriendUID);
  };

  // Função para definir o friendUID
  Navbar.setGroupId = (newGroupId) => {
    setGroupId(newGroupId);
  };

  const handleMenuToggle = () => {
    setMenuOpen(!MenuOpen);
  };

  const handleAddToggle = () => {
    setAddToggle((prevToggle) => !prevToggle);
  };

  // button add group
  const handleAddGroup = () => {
    setAddGroup(!addGroup);
  };

  // button notification
  const handleNotiToggle = () => {
    setNotiToggle(!notiToggle);
    setHasNewMessages(false);
  };

  // button add friend
  const handleButtonFriend = () => {
    setAddFriendVisible(!isAddFriendVisible);
  };

  useEffect(() => {
    const checkNewMessages = async () => {
      try {
        const receivedRequests = await getPendingRequests(user.uid, true);
        setHasNewMessages(receivedRequests.length > 0);
        setPendingRequestsReceived(receivedRequests);
      } catch (error) {
        console.error("Erro ao obter solicitações pendentes recebidas:", error);
      }
    };

    // Verificar novas mensagens ao montar o componente
    checkNewMessages();
  }, [user.uid, setHasNewMessages]);

  const location = useLocation();
  const isUserProfilePage = location.pathname === `/user/${user.uid}`;
  const isFriendPage = location.pathname === `/friend/${friendUID}`;
  const isGroup = location.pathname.startsWith(
    `/group/${groupId}`
  );
  const isHome = location.pathname === `/`;

  return (
    <div className={`navbar ${isOpen ? 'open' : ''}`}>
      {isAddFriendVisible && <AddFriend onClose={handleButtonFriend} />}
      {notiToggle && (
        <Notification
          ListPendingRequestsReceived={pendingRequestsReceived}
          setRefleshRequests={setPendingRequestsReceived}
          onClose={handleNotiToggle}
        />
      )}
      {addGroup && <AddGroup onClose={handleAddGroup} />}

      <div className="add-channels">
        <h2>ReactChat</h2>

        <div>
          <div className="notification-container">
            <FaBell onClick={handleNotiToggle} className="notification" />
            {hasNewMessages && <div className="red-dot"></div>}
          </div>

          <IoIosAdd className="add" onClick={handleAddToggle} />

          {AddToggle && (
            <div className="container-add">
              <button onClick={handleAddGroup}>
                <span>
                  <IoAddCircleSharp />
                </span>
                Criar Grupo
              </button>

              <button onClick={handleButtonFriend}>
                <span>
                  <IoMdPersonAdd />
                </span>
                Adicionar amigo
              </button>
            </div>
          )}
        </div>
      </div>

      <FriendList />

      <div className="container-user" onClick={handleMenuToggle}>
        {user && user.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="profile-image"
            onClick={() => setProfileImage(null)}
          />
        ) : (
          <FaUserCircle />
        )}
        <div className="user-info">
          <h2>{user.name}</h2>
        </div>

        {MenuOpen && (
          <div className="user-menu">
            {isUserProfilePage && (
              <Link to="/" className="home-link">
                <span>
                  <AiOutlineHome />
                </span>{" "}
                Home
              </Link>
            )}

              {(isFriendPage || isGroup || isHome) && (
                <Link to={`/user/${user.uid}`} className="user-profile-link">
                  <FaUserCircle /> Perfil
                </Link>
              )}

            <button className="button-logout" onClick={logoutUser}>
              <span>
                <RiLogoutBoxFill />
              </span>
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
