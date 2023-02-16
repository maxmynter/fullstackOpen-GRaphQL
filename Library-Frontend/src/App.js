import { useState } from "react";
import { gql, useSubscription } from "@apollo/client";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Reccomend from "./components/Reccomend";

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      author {
        name
      }
    }
  }
`;

const App = () => {
  const [page, setPage] = useState("authors");
  const [loggedIn, setLoggedIn] = useState(false);
  const [newBookAlert, setNewBookAlert] = useState(null);

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log("SubscribeCall", data);
      console.log("data.bookAdded", data.data.bookAdded);
      setNewBookAlert(data.data.bookAdded);
      setTimeout(() => {
        setNewBookAlert(null);
      }, 5000);
      console.log("After TimeOut");
    },
  });

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
      {newBookAlert ? (
        <div>
          <span>
            '{newBookAlert.title}' by '{newBookAlert.author.name}' was added to
            the book database.
          </span>
        </div>
      ) : null}

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
