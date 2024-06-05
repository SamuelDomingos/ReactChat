import React from 'react';

import "./CustomButton.css"

//Components
import { MdDelete } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { ImBlocked } from "react-icons/im";
import { FaUser } from "react-icons/fa";
import Loading from './Loading';

const CustomButton = ({ onClick, loading, isClicked, text, onBlock, onDesBlock }) => {

  return (
    <button
      className={`button-delit ${isClicked ? 'clicked' : ''} ${
        loading ? 'loading' : ''
      }`}
      onClick={onClick}
    >
      {loading ? (
        <>
          <span className="icon">
            <Loading />
          </span>
          <span className="text">{text}</span>
        </>
      ) : (
        <>
          {isClicked ? (
            <span className="icon">
              <FaCheck />
            </span>
          ) : (
            <>
              <span className="text">{text}</span>
              <span className="icon">
                {onBlock ? (
                  <ImBlocked />
                ) : onDesBlock ? (
                  <FaUser />
                ) : (
                  <MdDelete />
                )}
              </span>
            </>
          )}
        </>
      )}
    </button>
  );
};

export default CustomButton;
