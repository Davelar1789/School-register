import { useEffect, useState } from "react";

function HandleWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  function handleWidth() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener("resize", handleWidth);

    return () => {
      window.removeEventListener("resize", handleWidth);
    };
  }, []);

  return width;
}

export default HandleWidth;
