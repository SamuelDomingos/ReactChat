import "./FriendProfile.css";

import { Link, useLocation } from "react-router-dom";

// Components
import { IoSend } from "react-icons/io5";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import Picker from "@emoji-mart/react";
import { FaUserCircle } from "react-icons/fa";

// Hooks
import useRealtimeMessages from "../../hook/useRealtimeMessages";

// Context
import { useAuthContext } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { HiDotsVertical } from "react-icons/hi";
import ViewProfile from "../../interface/ViewComponents/ViewProfile";

const FriendProfile = () => {
  const { state } = useLocation();
  const { user } = useAuthContext();
  const data = state.friendData || null;

  const [newMessage, setNewMessage] = useState("");

  const [isToggleVisible, setIsToggleVisible] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { sentMessages, receivedMessages, sendMessage, formatMessageDate } =
    useRealtimeMessages(
      data.friendUID,
      data.friendName, // Nome do destinatário (amigo)
      newMessage,
      setNewMessage
    );

  const handleEmoji = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji.native);
  };

  // button Toggle
  const handleButtonToggle = () => {
    setIsToggleVisible(!isToggleVisible);
  };
  
  const allMessages = data.status !== "blocked" ? [...receivedMessages, ...sentMessages] : [];
  allMessages.sort((a, b) => a.timestamp - b.timestamp);
  
  // useEffect para verificar e passar data.friendUID para o Navbar
  useEffect(() => {
    const isFriendPage = window.location.pathname.startsWith("/friend/");
    if (isFriendPage && data.friendUID) {
      Navbar.setFriendUID(data.friendUID);
    }
  
    // Encontrar o elemento do último item na lista de mensagens
    const messagesContainer = document.querySelector(".container-messages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [data.friendUID, allMessages]);
  

  return (
    <div className="FriendProfile">
      {isToggleVisible && (
        <ViewProfile data={data} onClose={handleButtonToggle} />
      )}

      <div className="dataFriend">
        <Link to={"/"}>
          <IoIosArrowBack />
        </Link>
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

        <div className="container-toggle">
          <button className="toggle" onClick={handleButtonToggle}>
            <HiDotsVertical />
          </button>
        </div>
      </div>

      <div className="container-messages">
        {allMessages.map((mess) => (
          <div
            key={mess.timestamp}
            className={`singleMess ${
              mess.senderUID === user.uid
                ? "singleSentMess"
                : "singleReceivedMess"
            }`}
          >
            <p>{formatMessageDate(mess.timestamp)}</p>
            <h2>{mess.message}</h2>
          </div>
        ))}
      </div>

      {data.statusFromFriendPerspective === "blocked" ? (
        <p className="textBlocked">Você está bloqueado para esse usuário.</p>
      ) : (
        <form onSubmit={sendMessage}>
          <MdOutlineEmojiEmotions onClick={handleEmoji} />
          <input
            type="text"
            value={newMessage || ""}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">
            <IoSend />
          </button>

          {showEmojiPicker && (
            <div className="container-emoji">
              <Picker
                emojiSize={20}
                emojiTooltip
                autoFocus={false}
                onEmojiSelect={handleEmojiSelect}
              />
            </div>
          )}
        </form>
      )}

    </div>
  );
};

export default FriendProfile;
