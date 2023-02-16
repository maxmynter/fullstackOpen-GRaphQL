import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "./queries";

const Login = (props) => {
  const [message, setMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, result] = useMutation(LOGIN, {
    onError: async (error) => {
      setMessage(error.graphQLErrors[0].message);
      setTimeout(() => setMessage(null), 2000);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      localStorage.setItem("user-token", token);
      props.setLoggedInTrue();
    }
  }, [result.data]); // eslint-disable-line

  if (!props.show) {
    return null;
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    await login({ variables: { username, password } });
    setUsername("");
    setPassword("");
  };

  return (
    <div>
      {message ? <h2 style={{ color: "red" }}>{message}</h2> : null}
      <form onSubmit={handleLogin}>
        <div>
          name{" "}
          <input
            onChange={({ target }) => setUsername(target.value)}
            value={username}
          />
        </div>

        <div>
          password{" "}
          <input
            type="password"
            onChange={({ target }) => setPassword(target.value)}
            value={password}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
