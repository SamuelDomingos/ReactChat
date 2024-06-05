import { useEffect, useState } from "react";

import "./ViewComponents.css";

// Hooks
import { useAuth } from "../../hook/useAuth";

// Context
import { useAuthContext } from "../../context/AuthContext";

// Components
import Overlay from "../../components/Overlay";
import Loading from "../../components/Loading";
import { FaUserCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const ViewGroup = ({ data, onClose }) => {
  const { getGroupMembersDetails, getFriends, loading } = useAuth();
  const { user } = useAuthContext();

  const [groupMembersDetails, setGroupMembersDetails] = useState([]);
  const [listFriends, setListFriends] = useState([]);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (data.members) {
        const membersDetails = await getGroupMembersDetails(data.members);
        setGroupMembersDetails(membersDetails);
      }
    };

    const fetchListFriends = async () => {
      try {
        const list = await getFriends(user.uid);

        setListFriends(list);
      } catch (error) {
        console.error("Erro ao obter lista de amigos:", error);
      }
    };

    fetchGroupMembers();
    fetchListFriends();
  }, [data.members]);

  console.log(data);
  return (
    <Overlay onClose={onClose}>
      <div className="ViewComponent viewGroup">
        {loading ? (
          <Loading />
        ) : (
          <>
            <button className="button-close" onClick={onClose}>
              <IoMdClose />
            </button>

            <div className="data DataGroup">
              {data.photoURL ? (
                <img
                  src={data.photoURL}
                  className="profile-image"
                  alt={data.name}
                />
              ) : (
                <FaUserCircle className="user-icon" />
              )}

              <h2>{data.name}</h2>

              <p>{data.description}</p>
            </div>

            <div className="listMembers">
              <h2>Todos os membros do grupo:</h2>
              <div className="ContainerListMembers">
                {groupMembersDetails &&
                  groupMembersDetails.map((member) => (
                    <div className="singleMember" key={member.id}>
                      {member.profileImage ? (
                        <img src={member.profileImage} alt={member.name} />
                      ) : (
                        <FaUserCircle className="user-icon" />
                      )}
                      <h2>{member.name}</h2>

                      {data.admin === member.id && (
                          <p>Admin</p>
                        ) 
                      }
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Overlay>
  );
};

export default ViewGroup;
