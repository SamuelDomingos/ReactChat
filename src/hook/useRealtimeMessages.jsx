import { useState, useEffect } from 'react';
import { ref, onValue, push, update, set, get } from 'firebase/database';
import { realtimeDb } from '../firebase/Config';
import { useAuthContext } from '../context/AuthContext';

const useRealtimeMessages = (friendUID, friendDisplayName, newMessage, setNewMessage) => {
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);

  const {user} = useAuthContext();

  useEffect(() => {
    const [firstUser, secondUser] = [user.uid, friendUID].sort();
    const conversationName = `${firstUser}_${secondUser}`;
    const messagesRef = ref(realtimeDb, `messages/${conversationName}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        const messagesArray = Object.values(data);

        // Filtrar apenas as mensagens destinadas ao usuário atual
        const sent = messagesArray.filter(msg => msg.senderUID === user.uid && msg.receiverUID === friendUID);
        const received = messagesArray.filter(msg => msg.senderUID === friendUID && msg.receiverUID === user.uid);

        setSentMessages(sent);
        setReceivedMessages(received);
      } else {
        setSentMessages([]);
        setReceivedMessages([]);
      }
    });

    // Retornar uma função de cleanup para limpar o listener quando o componente é desmontado
    return () => {
      unsubscribe(); // Isso remove o listener quando o componente é desmontado
    };

  }, [user.uid, friendUID]);
  

  const sendMessage = async (e) => {
    e.preventDefault();
  
    if (newMessage === "") {
      return;
    }
  
    // Determine a ordem alfabética dos nomes dos usuários
    const [firstUser, secondUser] = [user.uid, friendUID].sort();
  
    const conversationName = `${firstUser}_${secondUser}`;
    const messagesRef = ref(realtimeDb, `messages/${conversationName}`);
    const newMessageData = {
      senderUID: user.uid,
      receiverUID: friendUID,
      receiverName: friendDisplayName,
      message: newMessage,
      timestamp: Date.now(),
      unread: true,
    };
  
    // Adicionar a nova mensagem à conversa existente
    push(messagesRef, newMessageData);
    setNewMessage("");
  };  

  const markMessageAsRead = async (friendUID) => {
    const [firstUser, secondUser] = [user.uid, friendUID].sort();
    const conversationName = `${firstUser}_${secondUser}`;
    const messagesRefFriend = ref(realtimeDb, `messages/${conversationName}`);
  
    try {
      const snapshot = await get(messagesRefFriend);
  
      if (snapshot.exists()) {
        const messages = snapshot.val();
  
        // Marca todas as mensagens como lidas
        const updates = {};
        for (const senderUID in messages) {
          for (const messageKey in messages[senderUID]) {
            const message = messages[senderUID][messageKey];
            if (message.receiverUID === user.uid && message.unread) {
              updates[`${senderUID}/${messageKey}/unread`] = false;
            }
          }
        }
  
        await update(messagesRefFriend, updates);
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };  

  const hasUnreadMessages = async (friendUID, friendName) => {
    try {
      // Determine a ordem alfabética dos nomes dos usuários
      const [firstUser, secondUser] = [user.uid, friendUID].sort();
  
      const conversationName = `${firstUser}_${secondUser}`;
      const messagesRefFriend = ref(realtimeDb, `messages/${conversationName}/${friendName}`);
  
      const snapshot = await get(messagesRefFriend);
  
      if (snapshot.exists()) {
        const messages = snapshot.val();
  
        // Filtra as mensagens não lidas
        const unreadMessages = Object.values(messages).filter(
          (message) =>
            message.senderUID === friendUID &&
            message.receiverUID === user.uid &&
            message.unread
        );
  
        return unreadMessages.length; // Retorna a quantidade de mensagens não lidas
      }
    } catch (error) {
      console.error('Erro ao verificar mensagens não lidas:', error);
    }
  
    return 0; // Retorna 0 em caso de erro ou se não houver mensagens
  };  

  const formatMessageDate = (timestamp) => {
    const currentDate = new Date();
    const messageDate = new Date(timestamp);
  
    if (
      currentDate.getDate() === messageDate.getDate() &&
      currentDate.getMonth() === messageDate.getMonth() &&
      currentDate.getFullYear() === messageDate.getFullYear()
    ) {
      // Mensagem enviada hoje
      const hours = messageDate.getHours().toString().padStart(2, '0');
      const minutes = messageDate.getMinutes().toString().padStart(2, '0');
      return `hoje ${hours}:${minutes}`;
    }
  
    // Calcula a diferença em dias
    const timeDiff = currentDate.getTime() - messageDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
    if (daysDiff === 1) {
      const hours = messageDate.getHours().toString().padStart(2, '0');
      const minutes = messageDate.getMinutes().toString().padStart(2, '0');
      return `ontem ${hours}:${minutes}`;
    }
  
    // Se não for hoje nem ontem, retorna a data e horário real
    const formattedDate = `${messageDate.getDate()}/${messageDate.getMonth() + 1}/${messageDate.getFullYear()}`;
    const hours = messageDate.getHours().toString().padStart(2, '0');
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    return `${formattedDate} ${hours}:${minutes}`;
  }
  
  return {
    sentMessages,
    receivedMessages,
    sendMessage,
    formatMessageDate,
    markMessageAsRead,
    hasUnreadMessages
  };
};

export default useRealtimeMessages;