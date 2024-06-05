// useAuth.js
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from "../firebase/Config";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore/lite";

// Context
import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    user,
    setUser: setAuthUser,
    isAuthenticated,
    setIsAuthenticated,
  } = useAuthContext();

  // Register user
  const registerUser = async (name, email, password) => {
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });

      const userDocRef = doc(db, `users/${userCredential.user.uid}`);
      await setDoc(userDocRef, {
        name: name,
        email: email,
        password: password,
      });

      // Atualiza o usuário no contexto com os dados do Firestore
      setAuthUser({
        uid: userCredential.user.uid,
        name: name,
        email: email,
        password: password,
      });

      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", JSON.stringify(true));
      setLoading(false);
      return { user: userCredential.user, error: null, code: null };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return { user: null, error: error, code: error.code };
    }
  };

  // Login user
  const loginUser = async (email, password) => {
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Recupera os dados do usuário do Firestore
      const userDocRef = doc(db, `users/${userCredential.user.uid}`);
      const userDoc = await getDoc(userDocRef);

      const userData = userDoc.data();

      // Atualiza o usuário no contexto com os dados do Firestore
      setAuthUser({
        uid: userCredential.user.uid,
        name: userCredential.user.displayName,
        email: userCredential.user.email,
        bio: userData.bio,
        password: userData.password,
        ...userData,
      });

      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", JSON.stringify(true));

      return { user: userCredential.user, error: null, code: null };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return { user: null, error: error, code: error.code };
    }
  };

  const updateUserProfile = async (updates) => {
    setLoading(true);

    try {
      // Reautentica o usuário antes de permitir a atualização da senha
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        user.password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Atualiza a senha, se fornecida
      if (updates.newPassword) {
        await updatePassword(auth.currentUser, updates.newPassword);

        // Atualiza o usuário no contexto com os dados do Firestore
        setAuthUser((prevUser) => ({
          ...prevUser,
          password: updates.newPassword || prevUser.password,
        }));
      }

      // Atualiza o perfil do usuário no Firebase Auth
      if (updates.name || updates.profileImage) {
        await updateProfile(auth.currentUser, {
          displayName: updates.name || auth.currentUser.displayName,
          photoURL: updates.profileImage || auth.currentUser.photoURL,
        });
      }

      // Atualiza os dados do usuário no Firestore
      const userDocRef = doc(db, `users/${auth.currentUser.uid}`);
      const userData = {};
      if (updates.name) userData.name = updates.name;
      if (updates.profileImage) userData.profileImage = updates.profileImage;
      if (updates.newPassword) userData.password = updates.newPassword;
      if (updates.bio) userData.bio = updates.bio;

      await setDoc(userDocRef, userData, { merge: true });

      // Atualiza o usuário no contexto com os dados do Firestore
      setAuthUser((prevUser) => ({
        ...prevUser,
        uid: auth.currentUser.uid,
        name: updates.name || prevUser.name,
        email: auth.currentUser.email,
        bio: updates.bio,
        profileImage: updates.profileImage || prevUser.profileImage,
        // Adicione outros campos do usuário conforme necessário
      }));

      setLoading(false);

      return { success: true, error: null };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      console.log(error);
      return { success: false, error: error.message };
    }
  };

  const updateProfileImage = async (imageFile) => {
    setLoading(true);

    try {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `profile_images/${user.uid}/${imageFile.name}`
      );

      // Faz o upload do arquivo
      await uploadBytes(storageRef, imageFile);

      // Obtém a URL de download do arquivo recém-carregado
      const downloadURL = await getDownloadURL(storageRef);

      // Atualiza a imagem do perfil no Firestore e no contexto
      const userDocRef = doc(db, `users/${user.uid}`);
      await setDoc(userDocRef, { profileImage: downloadURL }, { merge: true });

      // Atualiza o usuário no contexto com a nova URL da imagem de perfil
      setAuthUser((prevUser) => ({
        ...prevUser,
        profileImage: downloadURL,
      }));

      setLoading(false);

      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao atualizar imagem do perfil:", error);
      return { success: false, error: error.message };
    }
  };

  const searchUsers = async (searchTerm) => {
    const db = getFirestore();
    const auth = getAuth();
    setLoading(true);

    let userUID = null;

    // Obtém o UID do usuário autenticado
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userUID = user.uid;
      }
    });

    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = [];

      await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const userData = docSnap.data();
          const name = userData?.name;

          if (
            name &&
            docSnap.id !== userUID &&
            name.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            // Verifica se o usuário está na lista de amigos
            const isFriend =
              userData.friends &&
              userData.friends.some(
                (friend) =>
                  friend.friendUID === userUID && friend.status === "accepted"
              );

            // Verifica se já existe uma solicitação de amizade pendente do usuário autenticado
            const receiverRequestDocRef = doc(
              collection(db, "users", docSnap.id, "receivedFriendRequests"),
              userUID
            );
            const receiverRequestSnapshot = await getDoc(receiverRequestDocRef);
            const friendRequestExists =
              receiverRequestSnapshot.exists && receiverRequestSnapshot.data();

            users.push({
              uid: docSnap.id,
              name,
              profileImage: userData?.profileImage,
              isFriend,
              friendRequestExists,
            });
          }
        })
      );

      setLoading(false);
      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
  };

  const sendFriendRequest = async (receiverUID) => {
    setLoading(true);

    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!receiverUID) {
        throw new Error("receiverUID não está definido");
      }

      // Cria uma referência para o documento da solicitação no banco do remetente
      const senderRequestDocRef = doc(
        collection(db, "users", user.uid, "sentFriendRequests"),
        receiverUID
      );
      const senderRequestData = {
        receiverUID: receiverUID,
        status: "pending",
      };

      // Salva os detalhes da solicitação no banco do remetente
      await setDoc(senderRequestDocRef, senderRequestData);

      // Cria uma referência para o documento da solicitação no banco do destinatário
      const receiverRequestDocRef = doc(
        collection(db, "users", receiverUID, "receivedFriendRequests"),
        user.uid
      );
      const receiverRequestData = {
        senderUID: user.uid,
        status: "pending",
      };

      // Salva os detalhes da solicitação no banco do destinatário
      await setDoc(receiverRequestDocRef, receiverRequestData);

      setLoading(false);
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao enviar solicitação de amizade:", error);
      throw error;
    }
  };

  const getPendingRequests = async (userUID, received = true) => {
    const db = getFirestore();
    const collectionPath = received
      ? `users/${userUID}/receivedFriendRequests`
      : `users/${userUID}/sentFriendRequests`;

    const requestsQuery = query(
      collection(db, collectionPath),
      where("status", "==", "pending")
    );

    setLoading(true);

    try {
      const requestsSnapshot = await getDocs(requestsQuery);

      const requests = await Promise.all(
        requestsSnapshot.docs.map(async (docSnapshot) => {
          const request = docSnapshot.data();
          const otherUID = received ? request.senderUID : docSnapshot.id;

          const userDocRef = doc(db, "users", otherUID);
          const userDocSnapshot = await getDoc(userDocRef);
          const userData = userDocSnapshot.data();

          return {
            requestID: docSnapshot.id,
            senderUID: received ? request.senderUID : userUID,
            receiverUID: received ? userUID : request.receiverUID,
            status: request.status,
            receiverName: userData.name || "Nome não disponível",
            receiverProfileImage: userData.profileImage || null,
          };
        })
      );

      setLoading(false);
      return requests;
    } catch (error) {
      console.error("Erro ao obter solicitações de amizade:", error);
      throw error;
    }
  };

  const getFriends = async () => {
    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
  
    try {
      // Obter o documento do usuário
      const userDoc = await getDoc(userRef);
  
      // Armazenar dados do usuário para evitar chamadas repetitivas
      const userData = userDoc.data() || {};
      const friendsList = userData.friends || [];
  
      // Mapear a lista de amigos usando Promise.all
      const friendsData = await Promise.all(
        friendsList.map(async (friendData) => {
          const friendUID = friendData.friendUID;
          const friendDocRef = doc(db, "users", friendUID);
  
          try {
            const friendDoc = await getDoc(friendDocRef);
  
            if (friendDoc.exists()) {
              const friends = friendDoc.data().friends || [];
              const friendStatusData = friends.find((friend) => friend.friendUID === user.uid);
              const statusFromFriendPerspective = friendStatusData ? friendStatusData.status || null : null;
  
              // Verifica como você está em relação ao amigo
              const statusToFriend = friendData.status || null;
  
              return {
                friendUID: friendDoc.id,
                friendName: friendDoc.data().name,
                friendProfileImage: friendDoc.data().profileImage || null,
                friendBio: friendDoc.data().bio || null,
                statusFromFriendPerspective,
                statusToFriend,
              };
            } else {
              return null; // Se o amigo não existir, retorna null
            }
          } catch (error) {
            console.error("Erro ao obter dados do amigo:", error);
            return null;
          }
        })
      );
  
      return friendsData.filter((friend) => friend !== null); // Filtra amigos nulos (que não existem)
    } catch (error) {
      console.error("Erro ao obter amigos:", error);
      return [];
    }
  };  

  // Add Friend received and sent
  const addFriend = async (friendUID) => {
    const db = getFirestore();
    const result = { success: false, error: null };

    try {
      // Adiciona o amigo à subcoleção 'friends' dentro do documento do usuário que aceitou a amizade
      const userRef = doc(db, "users", user.uid);
      const friendData = {
        friendUID,
        status: "accepted", // ou outro status que você desejar
      };

      await updateDoc(userRef, {
        friends: arrayUnion(friendData), // Adiciona o amigo à lista de amigos
      });

      // Adiciona o usuário atual à subcoleção 'friends' dentro do documento do usuário que enviou o pedido
      const friendRef = doc(db, "users", friendUID);
      const userData = {
        friendUID: user.uid,
        status: "accepted", // ou outro status que você desejar
      };

      await updateDoc(friendRef, {
        friends: arrayUnion(userData), // Adiciona o usuário atual à lista de amigos do amigo
      });

      // Remove o pedido de amizade pendente específico da coleção 'receivedFriendRequests'
      const receivedRequestsRef = doc(
        db,
        `users/${user.uid}/receivedFriendRequests/${friendUID}`
      );
      await deleteDoc(receivedRequestsRef);

      // Remove o pedido de amizade pendente específico da coleção 'sentFriendRequests'
      const sentRequestsRef = doc(
        db,
        `users/${friendUID}/sentFriendRequests/${user.uid}`
      );
      await deleteDoc(sentRequestsRef);

      result.success = true;
    } catch (error) {
      console.error("Erro ao adicionar amigo:", error);
      result.error = error.message || "Erro ao adicionar amigo";
    }

    return result;
  };

  // Função para remover um amigo
  const blockFriend = async (friendId) => {
    setLoading(true);

    try {
      // Referências para os documentos do usuário e do amigo
      const userRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userRef);
      const userFriends = userDocSnapshot.data()?.friends || [];

      // Encontra o amigo na lista e altera o status para "blocked"
      const updatedFriends = userFriends.map((friend) =>
        friend.friendUID === friendId
          ? { ...friend, status: "blocked" }
          : friend
      );

      // Atualiza a lista de amigos no documento do usuário
      await updateDoc(userRef, {
        friends: updatedFriends,
      });

      setLoading(false);
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao bloquear amigo:", error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

   // Função para remover um amigo
   const desBlockFriend = async (friendId) => {
    setLoading(true);

    try {
      // Referências para os documentos do usuário e do amigo
      const userRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userRef);
      const userFriends = userDocSnapshot.data()?.friends || [];

      // Encontra o amigo na lista e altera o status para "accepted"
      const updatedFriends = userFriends.map((friend) =>
        friend.friendUID === friendId
          ? { ...friend, status: "accepted" }
          : friend
      );

      // Atualiza a lista de amigos no documento do usuário
      await updateDoc(userRef, {
        friends: updatedFriends,
      });

      setLoading(false);
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao bloquear amigo:", error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const createGroup = async (
    groupName,
    groupDescription,
    selectedFriends,
    groupPhoto
  ) => {
    setLoading(true);

    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      let photoURL = null;

      if (groupPhoto) {
        const storageRef = getStorage();
        const imageName = `${user.uid}_${Date.now()}`;
        const imageRef = ref(storageRef, `group_photos/${imageName}`);

        await uploadBytes(imageRef, groupPhoto);
        photoURL = await getDownloadURL(imageRef);
      }

      // Cria um novo documento para o grupo
      const groupDocRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        description: groupDescription,
        admin: user.uid,
        members: [
          user.uid,
          ...selectedFriends.map((friend) => friend.friendUID),
        ],
        photoURL: photoURL, // Adiciona o URL da foto do grupo
      });

      const groupData = {
        id: groupDocRef.id,
        name: groupName,
        description: groupDescription,
        admin: user.uid,
        members: [
          user.uid,
          ...selectedFriends.map((friend) => friend.friendUID),
        ],
        photoURL: photoURL, // Adiciona o URL da foto do grupo
      };

      // Adiciona o grupo à lista de grupos do usuário como administrador
      await updateDoc(doc(db, "users", user.uid), {
        groups: arrayUnion({
          groupId: groupData.id,
          name: groupData.name,
          status: "admin",
        }),
      });

      setLoading(false);

      return { success: true, error: null, groupData };
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      setLoading(false);
      return { success: false, error: error.message, data: null };
    }
  };

  const getGroups = async (userId) => {
    setLoading(true);
    const db = getFirestore();

    try {
      // Obtém a lista de grupos onde o usuário é um membro
      const groupsQuery = query(
        collection(db, "groups"),
        where("members", "array-contains", userId)
      );
      const groupsSnapshot = await getDocs(groupsQuery);

      // Mapeia os documentos do snapshot para obter os grupos
      const groups = groupsSnapshot.docs.map((doc) => ({
        groupId: doc.id,
        ...doc.data(),
      }));

      setLoading(false);
      return { success: true, groups, error: null };
    } catch (error) {
      console.error("Erro ao obter grupos do usuário:", error);
      return { success: false, error: error.message };
    }
  };

  const getGroupData = async (GroupId) => {
    setLoading(true);

    try {
      const groupDocRef = doc(db, "groups", GroupId);
      const groupDocSnapshot = await getDoc(groupDocRef);

      if (groupDocSnapshot.exists()) {
        const groupData = groupDocSnapshot.data();
        setLoading(false);

        return groupData;
      } else {
        console.log("Grupo não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do grupo:", error.message);
    }
  };

  const getGroupMembersDetails = async (groupMembers) => {
    setLoading(true);
    const memberDetails = [];

    for (const memberId of groupMembers) {
      const memberRef = doc(db, "users", memberId);

      try {
        const memberDoc = await getDoc(memberRef);

        if (memberDoc.exists()) {
          const memberData = memberDoc.data();
          memberDetails.push({ id: memberId, ...memberData });
        } else {
          console.log(
            `Documento do usuário com ID ${memberId} não encontrado.`
          );
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao obter detalhes do membro:", error.message);
      }
    }

    return memberDetails;
  };

  const removeUserFromGroup = async (groupId, userId) => {
    setLoading(true);
    const groupRef = doc(db, "groups", groupId);

    try {
      // Atualize o array de membros do grupo removendo o userId
      await updateDoc(groupRef, {
        members: arrayRemove(userId),
      });
      setLoading(false);
    } catch (error) {
      console.error("Erro ao remover usuário do grupo:", error.message);
    }
  };

  const addUserToGroup = async (groupId, userId) => {
    setLoading(true);
    const groupRef = doc(db, "groups", groupId);

    try {
      // Atualize o array de membros do grupo adicionando o userId
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
      });
      setLoading(false);
    } catch (error) {
      console.error("Erro ao adicionar usuário ao grupo:", error.message);
    }
  };

  const EditGroup = async (
    groupId,
    nameGroup,
    descriptionGroup,
    photoGroup
  ) => {
    if (!groupId || !nameGroup || !descriptionGroup) {
      console.error("Parâmetros inválidos para EditGroup");
      return { success: null, error: "Parâmetros inválidos" };
    }

    setLoading(true);
    const groupRef = doc(db, "groups", groupId);

    try {
      // Atualize os dados do grupo
      await updateDoc(groupRef, {
        description: descriptionGroup,
        name: nameGroup,
        photoURL: photoGroup || null, // Garanta que photoGroup seja nulo ou definido
        dataEdit: Date.now(),
      });

      setLoading(false);
      console.log("EditGroup success");
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro ao editar dados do grupo:", error.message);
      setLoading(false);
      return { success: null, error: error.message };
    }
  };

  const deleteGroup = async (groupId) => {
    setLoading(true);

    const groupRef = doc(db, "groups", groupId);
    const userRef = doc(db, "users", user.uid);

    try {
      const userDocSnapshot = await getDoc(userRef);
      const userGroups = userDocSnapshot.data()?.groups || [];
      console.log("User Groups:", userGroups);

      // Verifique se o grupo a ser excluído está na lista do usuário
      if (userGroups.some((group) => group.groupId === groupId)) {
        // Remove a referência do grupo do array 'groups' no documento do usuário
        await updateDoc(userRef, {
          groups: userGroups.filter((group) => group.groupId !== groupId),
        });

        console.log("User Groups Updated:", userGroups);

        // Deleta o grupo
        await deleteDoc(groupRef);

        console.log("Group Deleted Successfully");

        setLoading(false);
        return { success: true, error: null };
      } else {
        console.log("Group not found in User Groups");
        setLoading(false);
        return { success: false, error: "Group not found in User Groups" };
      }
    } catch (error) {
      console.error("Erro ao excluir grupo:", error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Message Error
  const MessageError = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Este e-mail já está em uso.";
      case "auth/invalid-email":
        return "E-mail inválido.";
      case "auth/missing-password":
        return "Está faltando a senha.";
      case "auth/weak-password":
        return "Senha fraca. A senha deve ter pelo menos 6 caracteres.";
      case "auth/invalid-login-credentials":
        return "Senha incorreta";
      default:
        return "Erro desconhecido ao cadastrar usuário.";
    }
  };

  // Logout User
  const logoutUser = async () => {
    setLoading(true);

    try {
      await signOut(auth);

      setIsAuthenticated(false);
      localStorage.setItem("isAuthenticated", JSON.stringify(false));

      setLoading(false);
      // Remova a linha abaixo se você não estiver usando setUser
      // setUser(null);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  return {
    registerUser,
    loginUser,
    updateUserProfile,
    updateProfileImage,
    searchUsers,
    sendFriendRequest,
    getPendingRequests,
    addFriend,
    createGroup,
    getFriends,
    blockFriend,
    desBlockFriend,
    getGroups,
    getGroupData,
    getGroupMembersDetails,
    removeUserFromGroup,
    addUserToGroup,
    EditGroup,
    deleteGroup,
    logoutUser,
    MessageError,
    loading,
    setLoading,
    error,
    isAuthenticated,
  };
};
