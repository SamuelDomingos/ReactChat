import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import './ButtonMenu.css';

const ButtonMenu = ({ isOpen, onClick }) => {
  return (
    <button className={`button-menu ${isOpen ? 'open' : ''}`} onClick={onClick}>
      <FaArrowRight />
    </button>
  );
}


export default ButtonMenu;
