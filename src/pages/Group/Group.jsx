import "./Group.css";

// Context
import { useAuthContext } from "../../context/AuthContext";

// Hooks
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useRealtimeMessagesGroup from "../../hook/useRealTimeMessageGroup";

// Components
import { IoIosArrowBack } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";
import Picker from "@emoji-mart/react";
import Navbar from "../../components/Navbar";
import EditGroup from "../../interface/EditGroup";
import { useAuth } from "../../hook/useAuth";
import ViewGroup from "../../interface/ViewComponents/ViewGroup";

const Group = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [data, setData] = useState([]);

  const [isToggleVisible, setIsToggleVisible] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { getGroupData } = useAuth();

  const {
    sentMessages,
    receivedMessages,
    newMessage,
    setNewMessage,
    sendGroupMessage,
    formatMessageDate,
  } = useRealtimeMessagesGroup(data.name, data.members);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newMessage === "") {
      return;
    }

    // Envia a mensagem para o grupo
    sendGroupMessage(data.name, newMessage);
  };

  // Converter as mensagens recebidas de objeto para array
  const receivedMessagesArray = Object.values(receivedMessages || {}).map(
    (userMessages) => Object.values(userMessages)
  );

  // Flatten para garantir que as mensagens estejam em um único array
  const allReceivedMessages = [].concat(...receivedMessagesArray);

  const allMessages = [...allReceivedMessages, ...(sentMessages || [])];
  allMessages.sort((a, b) => a.timestamp - b.timestamp);

  const groupConsecutiveMessages = (messagesArray) => {
    if (!messagesArray || messagesArray.length === 0) {
      return [];
    }

    return messagesArray.reduce((groups, message, index) => {
      if (
        index === 0 ||
        message.senderUID !== groups[groups.length - 1][0].senderUID
      ) {
        // Inicia um novo grupo se for a primeira mensagem ou se o remetente for diferente da mensagem anterior
        groups.push([message]);
      } else {
        // Adiciona à mensagem existente se o remetente for o mesmo da mensagem anterior
        groups[groups.length - 1].push(message);
      }
      return groups;
    }, []);
  };

  useEffect(() => {
    const isGroupPage = window.location.pathname.startsWith("/group/");
    if (isGroupPage && id) {
      Navbar.setGroupId(id);
    }

    // Encontrar o elemento do último item na lista de mensagens
    const messagesContainer = document.querySelector(".container-messages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    const fetchData = async () => {
      try {
        const dataGroup = await getGroupData(id);
        setData(dataGroup);
      } catch (error) {
        console.error("Erro ao buscar dados do grupo:", error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="Group">
      {data && (
        <>
          {isToggleVisible && (
            data.admin === user.uid ? (
              <EditGroup data={data} onClose={handleButtonToggle} />
            ) : (
              <ViewGroup data={data} onClose={handleButtonToggle}/>
            )
          )}

          <div className="dataGroup">
            <Link to={"/"}>
              <IoIosArrowBack />
            </Link>
            {data && data.photoURL ? (
              <img
                src={data.photoURL}
                className="profile-image"
                alt="Profile"
              />
            ) : (
              <FaUserCircle className="user-icon" />
            )}
            <h2>{data.name}</h2>
            <div className="container-toggle">
              <button className="toggle" onClick={handleButtonToggle}>
                <HiDotsVertical />
              </button>
            </div>
          </div>

          <div className="container-messages">
            {groupConsecutiveMessages(allMessages).map((group, groupIndex) => (
              <div
                key={`group-${groupIndex}`}
                className={`message-group ${
                  group[0].senderUID === user.uid ? "sent" : "received"
                }`}
              >
                {group[0].senderUID !== user.uid && (
                  <div
                    key={`${group[0].timestamp}-info`}
                    className="message-content-received"
                  >
                    {group[0].profileImage ? (
                      <img
                        src={group[0].profileImage}
                        className="profile-image"
                        alt="Profile"
                        onError={() =>
                          console.error(
                            `Erro ao carregar imagem: ${group[0].profileImage}`
                          )
                        }
                      />
                    ) : (
                      <FaUserCircle className="user-icon" />
                    )}
                  </div>
                )}

                <div className="messages">
                  {group[0].senderUID !== user.uid && (
                    <div
                      key={`${group[0].timestamp}-name`}
                      className="sender-name"
                    >
                      <h2>{group[0].senderName}</h2>
                    </div>
                  )}

                  {group.map((mess) => (
                    <div key={mess.timestamp} className={`singleMess`}>
                      <div
                        className={`message-background ${
                          mess.senderUID === user.uid ? "sent" : "received"
                        }`}
                      >
                        <p>{mess.message}</p>
                      </div>
                    </div>
                  ))}

                  <div className="message-time">
                    {formatMessageDate(group[0].timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
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
        </>
      )}
    </div>
  );
};

export default Group;
