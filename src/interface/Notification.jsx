import "./Notification.css";
import React, { useState, useEffect } from "react";

// Icons
import { IoMdClose } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";
import { MdBlockFlipped } from "react-icons/md";

import { useAuth } from "../hook/useAuth";
import { useAuthContext } from "../context/AuthContext";
import Loading from "../components/Loading";
import { toast } from "react-toastify";
import Overlay from "../components/Overlay";

const Notification = ({ onClose, ListPendingRequestsReceived, setRefleshRequests }) => {
  const { getPendingRequests, addFriend, loading, setLoading } = useAuth();
  const { user } = useAuthContext();
  console.log(ListPendingRequestsReceived);

  const handleAddFriend = async (friendUID) => {
    setLoading(true);  // Defina o loading como true antes de fazer a chamada assíncrona
  
    try {
      const result = await addFriend(friendUID);
  
      if (result.success) {
        toast.success("Amizade realizada", { autoClose: true, hideProgressBar: true, isLoading: false, autoClose: 1500 });
        const receivedRequests = await getPendingRequests(user.uid, true);
        setRefleshRequests(receivedRequests)
      } else {
        toast.error("Erro ao adicionar amigo", { autoClose: true, hideProgressBar: true, isLoading: false, autoClose: 1500 });
      }
    } catch (error) {
      toast.error("Erro ao adicionar amigo", { autoClose: true, hideProgressBar: true, isLoading: false, autoClose: 1500 });
    } finally {
      setLoading(false);  // Garanta que setLoading(false) seja chamado independentemente do resultado da chamada assíncrona
    }
  };

  return (
    <div className="Notification">
      <Overlay onClose={onClose}>
        <div className="container-notifications">
          <h2>Notificações</h2>

          <button className="button-close" onClick={onClose}>
            <IoMdClose />
          </button>

          {loading && <Loading />}
          {!loading && (
            <div className="container-user-received">
              {ListPendingRequestsReceived.length > 0 ? (
                <>
                  <h3>Nova solicitação de amizade</h3>
                  {ListPendingRequestsReceived.map((user) => (
                    <div className="user-received" key={user.requestID}>
                      {user && user.receiverProfileImage ? (
                        <img src={user.receiverProfileImage} alt="Profile" />
                      ) : (
                        <FaUserCircle className="user-icon" />
                      )}
                      <h3>{user.receiverName}</h3>
                      <div className="buttons-functions">
                        <IoPersonAdd
                          onClick={() => handleAddFriend(user.senderUID)}
                          className="addFriend"
                        />
                        <MdBlockFlipped className="block" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p>Sem novas mensagem...</p>
              )}
            </div>
          )}

        </div>
      </Overlay>
    </div>
  );
};

export default Notification;
