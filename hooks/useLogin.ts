import { router } from "expo-router";
import { useState } from "react";

const VALID_EMAIL = "juanito@example.com";
const VALID_PASSWORD = "1234";

export function useLogin() {
  const [email, setEmail] = useState(VALID_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleLogin = () => {
    const emailNormalizado = email.trim().toLowerCase();

    if (emailNormalizado !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setError("Credenciales incorrectas");
      return;
    }

    setError("");
    router.replace({
      pathname: "/(tabs)",
    });
  };

  return {
    email,
    password,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
  };
}
