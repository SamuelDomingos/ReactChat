import { useEffect, useState } from "react";
import "./AddComponents.css";

// UseAuth
import { useAuth } from "../../hook/useAuth";
import { useAuthContext } from "../../context/AuthContext";

// Hooks
import { useNavigate } from "react-router-dom";

// Components
import { IoMdClose, IoIosCloseCircle } from "react-icons/io";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import { MdOutlineGroups } from "react-icons/md";
import Overlay from "../../components/Overlay";

const AddGroup = ({ onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [groupPhotoPreview, setGroupPhotoPreview] = useState(null);

  const [listFriends, setListFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const navigate = useNavigate();

  const { user } = useAuthContext();

  const { getFriends, createGroup, loading } = useAuth(user.uid);

  const handleFriendToggle = (friend) => {
    setSelectedFriends((prevFriends) => [...prevFriends, friend]);
  };

  const handleRemoveFriend = (friend) => {
    const updatedFriends = selectedFriends.filter(
      (selectedFriend) => selectedFriend.friendUID !== friend.friendUID
    );
    setSelectedFriends(updatedFriends);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    // Exibe o Toast de Loading
    const loadingToast = toast.loading("Criando grupo...", {
      autoClose: true,
      hideProgressBar: true,
    });

    // Verifica se pelo menos um amigo foi selecionado
    if (selectedFriends.length === 0) {
      toast.update(loadingToast, {
        render: "Adicione no mínimo um amigo",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
      return;
    }

    // Verifica se foi fornecido um nome para o grupo
    if (!name) {
      toast.update(loadingToast, {
        render: "Informe um nome para o grupo",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
      return;
    }

    const createGroupResult = await createGroup(
      name,
      description,
      selectedFriends,
      groupPhoto
    );

    if (createGroupResult.success) {
      const { groupData } = createGroupResult;
      navigate(`/group/${groupData.id}`);
      onClose();
      toast.update(loadingToast, {
        render: "Criado com sucesso",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    }
  };

  const handleImageClick = () => {
    // Abre a caixa de seleção de arquivo quando a imagem é clicada
    document.getElementById("fileInput").click();
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (selectedImage instanceof Blob) {
      setGroupPhoto(selectedImage);

      // Cria uma URL temporária para a imagem e a exibe no preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setGroupPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  useEffect(() => {
    const fetchListFriends = async () => {
      try {
        const list = await getFriends(user.uid);
        setListFriends(list);
      } catch (error) {
        console.error("Erro ao obter lista de amigos:", error);
      }
    };
    fetchListFriends();
  }, [user.uid]);

  return (
    <div className="addgroup">
      <Overlay onClose={onClose}>
        <div className="AddContainer">
          <button className="button-close" onClick={onClose}>
            <IoMdClose />
          </button>

          <h2>Novo grupo</h2>
          <form onSubmit={handleCreateGroup}>
            <div id="img-name-div">
              <input
                type="file"
                accept="image/*"
                id="fileInput"
                onChange={handleImageChange}
                style={{ display: "none" }} // Esconde a caixa de seleção de arquivo
              />

              <div
                className="image-preview-container"
                onClick={handleImageClick}
                style={{ cursor: "pointer" }}
              >
                {groupPhotoPreview ? (
                  <img
                    src={groupPhotoPreview}
                    alt="Preview"
                    className="preview-image"
                  />
                ) : (
                  <MdOutlineGroups className="user-icon" />
                )}
              </div>

              <input
                type="text"
                placeholder="Nome do grupo"
                onChange={(e) => setName(e.target.value)}
                value={name || ""}
              />
            </div>

            <input
              type="text"
              placeholder="Descrição do grupo"
              onChange={(e) => setDescription(e.target.value)}
              value={description || ""}
            />

            <div className="containerToggleFriend">
              <h2>Adicione seus amigos:</h2>

              <div className="containar-scroll">
                {!loading &&
                  listFriends &&
                  listFriends.map((friend) => (
                    <div
                      className={`toggleFriend ${
                        selectedFriends.some(
                          (selectedFriend) =>
                            selectedFriend.friendUID === friend.friendUID
                        )
                          ? "selected"
                          : ""
                      }`}
                      key={friend.friendUID}
                      onClick={() => handleFriendToggle(friend)}
                    >
                      {friend.friendProfileImage ? (
                        <img
                          src={friend.friendProfileImage}
                          alt="Profile"
                          className="profile-image"
                        />
                      ) : (
                        <FaUserCircle className="user-icon" />
                      )}
                      <h2>{friend.friendName}</h2>
                      {selectedFriends.some(
                        (selectedFriend) =>
                          selectedFriend.friendUID === friend.friendUID
                      ) && (
                        <button
                          className="remove-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFriend(friend);
                          }}
                        >
                          <IoIosCloseCircle />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <input type="submit" value="Criar" />
          </form>
        </div>
      </Overlay>
    </div>
  );
};

export default AddGroup;
