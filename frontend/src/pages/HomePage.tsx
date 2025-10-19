import { useContext } from "react";
import { AuthContext } from "../App";
import AuthHomePage from "../components/HomePage/AuthHomePage";
import UnAuthHomePage from "../components/HomePage/UnAuthHomePage";
import PageTitle from "../components/PageTitle";

function HomePage() {
  const { isAuth } = useContext(AuthContext);

  return (
    <>
      <PageTitle title="Home" />
      {isAuth ? <AuthHomePage /> : <UnAuthHomePage />}
    </>
  );
}

export default HomePage;
