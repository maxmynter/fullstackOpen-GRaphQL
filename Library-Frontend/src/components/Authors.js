import { useQuery, gql, useMutation } from "@apollo/client";
import { useState } from "react";

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

const UPDATE_AUTHOR = gql`
  mutation updateAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`;

const SetBirthYear = () => {
  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    updateAuthor({ variables: { name, setBornTo: Number(born) } });
    setName("");
    setBorn("");
  };

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={handleSubmit}>
        <div>
          Name{" "}
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          ></input>
        </div>
        <div>
          born{" "}
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          ></input>
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

const Authors = (props) => {
  const authors = useQuery(ALL_AUTHORS);
  if (!props.show) {
    return null;
  }

  if (authors.loading) {
    return (
      <div>
        <span>Fetching data ...</span>
      </div>
    );
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SetBirthYear />
    </div>
  );
};

export default Authors;
