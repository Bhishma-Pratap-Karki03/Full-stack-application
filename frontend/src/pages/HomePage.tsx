import { useContext } from "react";
import AuthHomePage from "../components/HomePage/AuthHomePage";
import { AuthContext } from "../App";
import UnAuthHomePage from "../components/HomePage/UnAuthHomePage";

function HomePage() {
  const { isAuth } = useContext(AuthContext);
  return <div>{isAuth ? <AuthHomePage /> : <UnAuthHomePage />}</div>;
}

export default HomePage;
