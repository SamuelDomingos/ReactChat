import React, { useState } from "react";

import "./DeleteGroup.css";

// Hooks
import { useAuth } from "../hook/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

// Components
import Overlay from "../components/Overlay";
import Loading from "../components/Loading";
import CustomButton from "../components/CustomButton";

const DeleteGroup = ({ onClose }) => {
  const { deleteGroup, loading } = useAuth();

  const { id } = useParams();

  const navigate = useNavigate();

  const [isClicked, setIsClicked] = useState(false);

  const handleButtonDelete = async() => {

    try {
      
      const {success, error} = await deleteGroup(id);

      if (success) {
        setIsClicked(true);
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 2000);
      }

      console.log(error);

    } catch (error) {
      console.log(error);
    }

  };

  return (
    <Overlay onClose={onClose}>
      <div className="container-DeleteGroup">
        <h2>Tem certeza que deseja deletar o grupo?</h2>
        <div className="container-buttons">
          <CustomButton
          onClick={handleButtonDelete}
          loading={loading}
          isClicked={isClicked}
          text="Deletar"
        />

          <button className="button-close" onClick={onClose}>
            Sair
          </button>
        </div>
      </div>
    </Overlay>
  );
};

export default DeleteGroup;
