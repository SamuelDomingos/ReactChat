import { useEffect, useReducer, useState } from "react";
import "./EditGroup.css";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../hook/useAuth";

// Hooks
import { useParams } from "react-router-dom";

// Context
import { useAuthContext } from "../context/AuthContext";

// Components
import { TiUserDelete } from "react-icons/ti";
import { IoMdClose, IoMdPersonAdd } from "react-icons/io";
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import DeleteGroup from "./DeleteGroup";
import Overlay from "../components/Overlay";

const EditGroup = ({ data, onClose }) => {
  const [name, setName] = useState((data && data.name) || "");
  const [description, setDescription] = useState(
    (data && data.description) || ""
  );
  const { id } = useParams();

  const [groupPhoto, setGroupPhoto] = useState(null);
  const [groupPhotoPreview, setGroupPhotoPreview] = useState(null);

  const [showAddFriendsList, setShowAddFriendsList] = useState(false);
  const [isDeleteGroupVisible, setIsDeleteGroupVisible] = useState(false);

  const {
    getGroupMembersDetails,
    getFriends,
    EditGroup,
    removeUserFromGroup,
    addUserToGroup,
    loading,
  } = useAuth();
  const { user } = useAuthContext();

  const [groupMembersDetails, setGroupMembersDetails] = useState([]);
  const [listFriends, setListFriends] = useState([]);

  // button DeleteGroup
  const handleButtonDeleteGroup = () => {
    setIsDeleteGroupVisible(!isDeleteGroupVisible);
  };

  const handleImageClick = () => {
    // Abre a caixa de seleção de arquivo quando a imagem é clicada
    document.getElementById("fileInput").click();
  };

  const toggleAddFriendsList = () => {
    setShowAddFriendsList(!showAddFriendsList);
  };

  const handleImageChange = async (e) => {
    const selectedImage = e.target.files[0];

    if (selectedImage instanceof Blob) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64String = event.target.result;
        setGroupPhoto(base64String);
        setGroupPhotoPreview(URL.createObjectURL(selectedImage));
      };

      reader.readAsDataURL(selectedImage);
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();

    // Verifica se houve alguma alteração nos dados do grupo
    const isDataChanged =
      name !== data.name ||
      description !== data.description ||
      (groupPhoto !== null && groupPhoto !== undefined);

    if (!isDataChanged) {
      // Nenhum dado foi alterado, você pode retornar ou exibir uma mensagem
      console.log("Nenhum dado foi alterado.");
      return;
    }

    // Exibe o Toast de Loading
    const loadingToast = toast.loading("Editando dados...", {
      autoClose: true,
      hideProgressBar: true,
    });

    try {
      const { success, error } = await EditGroup(
        id,
        name,
        description,
        groupPhoto
      );

      if (success) {
        toast.update(loadingToast, {
          render: "Dados do grupo editados com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });

        // Recarrega a página após o sucesso da edição
        window.location.reload();
      } else {
        toast.update(loadingToast, {
          render: error,
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.log("Erro ao editar dados do grupo:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    // Exibe o Toast de Loading
    const loadingToast = toast.loading("Removendo usuario...", {
      autoClose: true,
      hideProgressBar: true,
    });

    try {
      await removeUserFromGroup(id, userId);

      // Atualizar o estado local removendo o usuário da lista
      setGroupMembersDetails((prevMembers) =>
        prevMembers.filter((member) => member.id !== userId)
      );

      toast.update(loadingToast, {
        render: "Removido com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    } catch (error) {
      console.error("Erro ao remover usuário do grupo:", error.message);
    }
  };

  const handleAddToMember = async (userId) => {
    // Exibe o Toast de Loading
    const loadingToast = toast.loading("Adicionando usuario...", {
      autoClose: true,
      hideProgressBar: true,
    });

    try {
      await addUserToGroup(id, userId);

      // Atualizar o estado local removendo o usuário da lista
      setGroupMembersDetails((prevMembers) =>
        prevMembers.filter((member) => member.id !== userId)
      );

      toast.update(loadingToast, {
        render: "Adicionado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    } catch (error) {
      console.error("Erro ao remover usuário do grupo:", error.message);
    }
  };

  const friendsNotInGroup = listFriends.filter((friend) => {
    // Verifica se o amigo não está na lista de membros do grupo
    return !groupMembersDetails.some(
      (member) => member.id === friend.friendUID
    );
  });

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

  return (
    <Overlay onClose={onClose}>
      <div className="container-edit">
        {loading ? (
          <Loading />
        ) : (
          <>
            {isDeleteGroupVisible && (
              <DeleteGroup onClose={handleButtonDeleteGroup} />
            )}
  
            <div className="EditGroup">
              <button className="button-close" onClick={onClose}>
                <IoMdClose />
              </button>
  
              <form onSubmit={handleEditGroup}>
                <input
                  type="file"
                  accept="image/*"
                  id="fileInput"
                  style={{ display: "none" }} // Esconde a caixa de seleção de arquivo
                  onChange={handleImageChange}
                />
  
                <div
                  className="image-preview-container"
                  onClick={handleImageClick}
                  style={{ cursor: "pointer" }}
                >
                  {data.photoURL || groupPhotoPreview ? (
                    <img
                      src={groupPhotoPreview || data.photoURL}
                      alt="Preview"
                      className="preview-image"
                    />
                  ) : (
                    <FaUserCircle className="user-icon" />
                  )}
                </div>
  
                <label>
                  Nome:
                  <input
                    type="text"
                    placeholder="Nome do grupo"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                  />
                </label>
  
                <label>
                  Descrição:
                  <input
                    type="text"
                    placeholder="Descrição do grupo"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                  />
                </label>
  
                <input type="submit" value="Editar" />
              </form>
  
              <button onClick={handleButtonDeleteGroup}>DELETAR GRUPO</button>
            </div>
  
            <div className="listMembers">
              {showAddFriendsList ? (
                <div className="ContainerListMembers">
                  <h2>Adicionar Amigos:</h2>
  
                  {friendsNotInGroup &&
                    friendsNotInGroup.map((friend) => (
                      <div className="singleMember" key={friend.friendUID}>
                        {friend.friendProfileImage ? (
                          <img src={friend.friendProfileImage} alt={friend.friendName} />
                        ) : (
                          <FaUserCircle className="user-icon" />
                        )}
                        <h2>{friend.friendName}</h2>
  
                        <button
                          className="addGroup"
                          onClick={() => handleAddToMember(friend.friendUID)}
                        >
                          <IoMdPersonAdd />
                        </button>
                      </div>
                    ))}
  
                  <button className="addFriends" onClick={toggleAddFriendsList}>
                    <FaCircleMinus />
                  </button>
                </div>
              ) : (
                <div className="ContainerListMenbers">
                  <h2>Todos os membros do grupo:</h2>
                  {groupMembersDetails &&
                    groupMembersDetails.map((member) => (
                      <div className="singleMember" key={member.id}>
                        {member.profileImage ? (
                          <img src={member.profileImage} alt={member.name} />
                        ) : (
                          <FaUserCircle className="user-icon" />
                        )}
                        <h2>{member.name}</h2>
  
                        {data.admin === member.id ? (
                          <p>Admin</p>
                        ) : (
                          data.admin !== member.id && (
                            <button
                              className="deleteGroup"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <TiUserDelete />
                            </button>
                          )
                        )}
                      </div>
                    ))}
  
                  <button className="addFriends" onClick={toggleAddFriendsList}>
                    <FaCirclePlus />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Overlay>
  );  
};

export default EditGroup;
