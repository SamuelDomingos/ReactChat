// useRealtimeMessages.jsx
import { useState, useEffect } from 'react';
import { ref, onValue, push, update, get } from 'firebase/database';
import { realtimeDb } from '../firebase/Config';
import { useAuthContext } from '../context/AuthContext';

const useRealtimeMessagesGroup = (groupName, groupMembers) => {
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const { user } = useAuthContext();

  useEffect(() => {
    const messagesRefUser = ref(realtimeDb, `messagesGroup/${groupName}/${user.name}`);
    const messagesRefGroup = ref(realtimeDb, `messagesGroup/${groupName}`);

    setSentMessages([]);
    setReceivedMessages([]);
  
    onValue(messagesRefUser, (snapshotUser) => {
      const dataUser = snapshotUser.val();
      if (dataUser && typeof dataUser === 'object') {
        const messagesArrayUser = Object.values(dataUser);
        setSentMessages(messagesArrayUser);
      } else {
        setSentMessages([]);
      }
    });
  
    
    onValue(messagesRefGroup, (snapshotGroup) => {
      const dataGroup = snapshotGroup.val();
  
      if (dataGroup && typeof dataGroup === 'object') {
        // Verifica se user.name está presente no objeto dataGroup
        if (user.name in dataGroup) {
          // Remove as mensagens associadas ao usuário atual
          delete dataGroup[user.name];
        }
  
        // Aqui você pode fazer o que quiser com as mensagens do grupo excluindo as do usuário
        setReceivedMessages(dataGroup);
      } else {
        setReceivedMessages({});
      }
    });
    
  }, [groupName, user.name]);

  const markMessagesAsReadGroup = async (groupName) => {
    const messagesRefGroup = ref(realtimeDb, `messagesGroup/${groupName}`);
  
    try {
      const snapshot = await get(messagesRefGroup);
  
      if (snapshot.exists()) {
        const messages = snapshot.val();
  
        const updates = {};
        for (const memberId in messages) {
          const memberMessages = messages[memberId];
  
          for (const messageId in memberMessages) {
            const message = memberMessages[messageId];
  
            // Verifica se a mensagem tem a propriedade 'unread' e se o usuário ainda não a leu
            if (message.readBy[user.uid] === false) {
              // Marca a mensagem como lida pelo usuário atual
              updates[`${memberId}/${messageId}/readBy/${user.uid}`] = true;
            }
          }
        }
  
        // Use a função update somente se houver atualizações
        if (Object.keys(updates).length > 0) {
          await update(messagesRefGroup, updates);
        }
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const hasUnreadMessagesGroup = async (groupName) => {
    try {
      const messagesRefGroup = ref(realtimeDb, `messagesGroup/${groupName}`);
      const snapshot = await get(messagesRefGroup);
  
      if (snapshot.exists()) {
        const messages = snapshot.val();
  
        // Filtra mensagens não lidas para o usuário atual (excluindo as mensagens do próprio usuário)
        const unreadMessages = Object.values(messages).flatMap((memberMessages) =>
          Object.values(memberMessages).filter(
            (message) => message.readBy && message.senderUID !== user.uid && !message.readBy[user.uid]
          )
        );

        return unreadMessages.length; // Retorna a quantidade de mensagens não lidas
      }
    } catch (error) {
      console.error('Erro ao verificar mensagens não lidas:', error);
    }
  
    return 0; // Retorna 0 em caso de erro ou se não houver mensagens
  };
  
  const sendGroupMessage = async () => {
    const messagesRefGroup = ref(realtimeDb, `messagesGroup/${groupName}/${user.name}`);
  
    try {
      const senderName = user.name;
      const profileImage = user.profileImage || '';
  
      // Inicializa o objeto readBy com todos os membros do grupo, exceto o usuário atual, como não lidos
      const initialReadBy = {};
      groupMembers.forEach((member) => {
        if (member !== user.uid) {
          initialReadBy[member] = false;
        }
      });

      // Envia a mensagem para o grupo
      await push(messagesRefGroup, {
        senderUID: user.uid,
        senderName: senderName,
        profileImage: profileImage,
        message: newMessage,
        timestamp: Date.now(),
        readBy: initialReadBy,
      });
  
      setNewMessage(''); // Limpa o campo de nova mensagem após o envio
    } catch (error) {
      console.error('Erro ao enviar mensagem de grupo:', error);
    }
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
    const formattedDate = `${messageDate.getDate().toString().padStart(2, '0')}/${(messageDate.getMonth() + 1).toString().padStart(2, '0')}/${messageDate.getFullYear()}`;
    const hours = messageDate.getHours().toString().padStart(2, '0');
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    return `${formattedDate} ${hours}:${minutes}`;
  };
  

  return {
    sentMessages,
    receivedMessages,
    newMessage,
    markMessagesAsReadGroup,
    hasUnreadMessagesGroup,
    setNewMessage,
    sendGroupMessage,
    formatMessageDate
  };
};

export default useRealtimeMessagesGroup;
