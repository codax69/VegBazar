import { useEffect, useContext } from "react";
import { OrderContext } from "../Context/OrderContext";

const BackButtonHandler = () => {
  const { currentRoute, navigate } = useContext(OrderContext);

  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();

      // Simple back navigation logic
      if (currentRoute === "/billing") {
        navigate("/order-confirmation");
      } else if (currentRoute === "/order-confirmation") {
        navigate("/select-vegetables");
      } else if (currentRoute === "/select-vegetables") {
        navigate("/offers");
      } else if (currentRoute === "/offers") {
        navigate("/");
      } else {
        // already at home, exit app / do nothing
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentRoute, navigate]);

  return null;
};

export default BackButtonHandler;
