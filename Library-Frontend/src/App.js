import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Reccomend from "./components/Reccomend";

const App = () => {
  const [page, setPage] = useState("authors");
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {loggedIn ? (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("reccomend")}>recomend</button>
            <button
              onClick={() => {
                setPage("authors");
                localStorage.clear();
                setLoggedIn(false);
              }}
            >
              logout
            </button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />
      <NewBook show={page === "add"} />
      <Reccomend show={page === "reccomend"} />
      <Login
        show={page === "login"}
        setLoggedInTrue={() => {
          setLoggedIn(true);
          setPage("authors");
        }}
      />
    </div>
  );
};

export default App;
