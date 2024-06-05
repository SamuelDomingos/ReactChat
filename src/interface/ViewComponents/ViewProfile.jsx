import { useState } from "react";

import "./ViewComponents.css";

// Hooks
import { useAuth } from "../../hook/useAuth";

// Components
import { FaUserCircle } from "react-icons/fa";
import Overlay from "../../components/Overlay";
import Loading from "../../components/Loading";
import BlockFriend from "../BlockFriend";

const ViewProfile = ({ data, onClose }) => {
  const { loading } = useAuth();
  console.log(data);

  const [blockedFriend, setBlockedFriend] = useState(false);

  const handleButtonBlocked = () => {
    setBlockedFriend(!blockedFriend);
  }

  return (
    <Overlay onClose={onClose}>
      <div className="ViewComponent ViewProfile">
        {blockedFriend && <BlockFriend data={data} friendID={data.friendUID} onClose={handleButtonBlocked} />}

        <div className="data">
          {loading ? (
            <Loading />
          ) : (
            <div>
              {data && data.friendProfileImage ? (
                <img
                  src={data.friendProfileImage}
                  className="profile-image"
                  alt="Profile"
                />
              ) : (
                <FaUserCircle className="user-icon" />
              )}
              <h2>{data.friendName}</h2>
              <p>{data.friendBio}</p>

                {data.statusToFriend === "blocked" ? (
                  <button className="desBlockedBtn" onClick={handleButtonBlocked}>
                    Desbloquear amigo
                  </button>
                ) : (
                  <button className="blockedBtn" onClick={handleButtonBlocked}>
                    Bloquear Amizade
                  </button>
                )}

              <span>ID: {data.friendUID}</span>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
};

export default ViewProfile;
