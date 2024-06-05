import "./FriendList.css";
import React, { useEffect, useState } from "react";

import { useAuthContext } from "../context/AuthContext";

// Hooks
import { useAuth } from "../hook/useAuth";
import { Link } from "react-router-dom";
import useRealtimeMessages from "../hook/useRealtimeMessages";
import useRealtimeMessagesGroup from "../hook/useRealTimeMessageGroup";

// Components
import { IoTime } from "react-icons/io5";
import Loading from "./Loading";
import { FaUserCircle } from "react-icons/fa";

const FriendList = () => {
  const { user } = useAuthContext();
  const { getPendingRequests, getFriends, getGroups, setLoading, loading } =
    useAuth();
  const { markMessageAsRead, hasUnreadMessages } = useRealtimeMessages();
  const { markMessagesAsReadGroup, hasUnreadMessagesGroup } =
    useRealtimeMessagesGroup();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [listFriends, setListFriends] = useState([]);
  const [userGroups, setUserGroups] = useState([]);

  const handleMarkAsRead = async (friendUID) => {
    await markMessageAsRead(user.uid, friendUID);

    // Atualiza o estado local para forçar uma re-renderização
    const updatedList = listFriends.map((friend) => {
      if (friend.friendUID === friendUID) {
        return { ...friend, isUnread: 0 }; // Define isUnread para 0
      }
      return friend;
    });
    setListFriends(updatedList);
  };

  const handleMarkGroupMessagesAsRead = async (group) => {
    try {
      await markMessagesAsReadGroup(group);

      // Atualiza o estado local para forçar uma re-renderização
      const updatedUserGroups = userGroups.map((groupMessage) => {
        if (groupMessage.groupName === group.groupName) {
          return { ...groupMessage, unreadMessagesCount: 0 }; // Define unreadMessagesCount para 0
        }
        return groupMessage;
      });
      setUserGroups(updatedUserGroups);
    } catch (error) {
      console.error("Erro ao marcar mensagens do grupo como lidas:", error);
    }
  };

  useEffect(() => {
    const fetchPendingRequestsReceived = async () => {
      setLoading(true);

      try {
        const receivedRequests = await getPendingRequests(user.uid, false);
        setPendingRequests(receivedRequests);
      } catch (error) {
        console.error("Erro ao obter solicitações pendentes recebidas:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchListFriends = async () => {
      try {
        const list = await getFriends();
        const updatedList = [];

        // Verifica mensagens não lidas para cada amigo ao carregar o componente
        for (const friend of list) {
          const unreadPoint = await hasUnreadMessages(
            user.uid,
            friend.friendUID,
            friend.friendName
          );
          updatedList.push({ ...friend, isUnread: unreadPoint });
        }

        setListFriends(updatedList);
      } catch (error) {
        console.error("Erro ao obter lista de amigos:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserGroups = async () => {
      try {
        const groupsResult = await getGroups(user.uid);

        if (groupsResult.success) {
          const updatedGroups = [];

          for (const group of groupsResult.groups) {
            const unreadMessagesCount = await hasUnreadMessagesGroup(
              group.name
            );
            updatedGroups.push({ ...group, unreadMessagesCount });
          }

          setUserGroups(updatedGroups);
        } else {
          console.error("Erro ao obter grupos do usuário:", groupsResult.error);
        }
      } catch (error) {
        console.error("Erro ao obter grupos do usuário:", error);
      }
    };

    fetchUserGroups();
    fetchPendingRequestsReceived();
    fetchListFriends();
  }, [user.uid]);

  return (
    <div className="FriendList">
      {loading && <Loading />}
      {!loading && (
        <div>
          <div className="ListPeding">
            {pendingRequests.length > 0 && (
              <div>
                <h3>Solicitações Pendente:</h3>
                {pendingRequests.map((user) => (
                  <div className="list-user" key={user.receiverUID}>
                    {user && user.receiverProfileImage ? (
                      <img
                        src={user.receiverProfileImage}
                        className="profile-image"
                        alt="Profile"
                      />
                    ) : (
                      <FaUserCircle className="user-icon" />
                    )}
                    <h2>{user.receiverName}</h2>
                    <IoTime />
                  </div>
                ))}
              </div>
            )}
          </div>

          {listFriends.map((friend) => (
            <Link
              to={`/friend/${friend.friendUID}`}
              state={{ friendData: friend }}
              key={friend.friendUID}
              onClick={() => {
                handleMarkAsRead(friend.friendUID);
              }}
            >
              <div className="user-friend">
                {friend && friend.friendProfileImage ? (
                  <img
                    src={friend.friendProfileImage}
                    className="profile-image"
                    alt="Profile"
                  />
                ) : (
                  <FaUserCircle className="user-icon" />
                )}
                <h2>{friend.friendName}</h2>
                {friend.isUnread > 0 && (
                  <p className="unread-indicator">{friend.isUnread}</p>
                )}
              </div>
            </Link>
          ))}

          {userGroups &&
            userGroups.map((group) => (
              <Link
                to={`/group/${group.groupId}`}
                key={group.groupId}
                onClick={() => handleMarkGroupMessagesAsRead(group.name)}
              >
                <div className="user-friend">
                  {group && group.photoURL ? (
                    <img
                      src={group.photoURL}
                      className="profile-image"
                      alt="Profile"
                    />
                  ) : (
                    <FaUserCircle className="user-icon" />
                  )}
                  <h2>{group.name}</h2>
                  {group.unreadMessagesCount > 0 && (
                    <p className="unread-indicator">
                      {group.unreadMessagesCount}
                    </p>
                  )}
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default FriendList;
