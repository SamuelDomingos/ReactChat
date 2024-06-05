import style from "./Home.module.css"

import { useAuthContext } from "../context/AuthContext"

import img from "../images/sapiens.png"

const Home = () => {

  const { user } = useAuthContext();

  return (
    <div className={style.home}>
      <h2>Seja bem-vindo {user.name}</h2>
      <img src={img} />
    </div>
  )
}

export default Home