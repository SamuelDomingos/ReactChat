import React, { useState } from "react";

import "./BlockFriend.css";

import Overlay from "../components/Overlay";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";

const BlockFriend = ({ data, friendID, onClose }) => {
  const { blockFriend, desBlockFriend, loading } = useAuth();

  const navigate = useNavigate();

  const [isClicked, setIsClicked] = useState(false);

  const handleBlockFriend = async () => {
    const result = await blockFriend(friendID);

    if (result.success) {
      setIsClicked(true);
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 2000);
    }
  };

  const handleDesBlockFriend = async () => {
    const result = await desBlockFriend(friendID);

    if (result.success) {
      setIsClicked(true);
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="blockFriend">
        {
          data.statusToFriend === "blocked" ? (
            <>
              <h2>Tem certeza de que deseja desbloquear o {data.friendName}?</h2>

              <div className="container-buttons">
                <CustomButton
                  onClick={handleDesBlockFriend}
                  loading={loading}
                  isClicked={isClicked}
                  text="desbloquear"
                  onDesBlock={true}
                />

                <button className="button-close" onClick={onClose}>
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
            <h2>Tem certeza de quer bloquear o {data.friendName}?</h2>

            <div className="container-buttons">
              <CustomButton
                onClick={handleBlockFriend}
                loading={loading}
                isClicked={isClicked}
                text="Bloquear"
                onBlock={true}
              />

              <button className="button-close" onClick={onClose}>
                Sair
              </button>
            </div>
            </>
          )
        }
      </div>
    </Overlay>
  );
};

export default BlockFriend;
