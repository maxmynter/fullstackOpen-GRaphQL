import { useState } from "react";
import { useQuery, gql } from "@apollo/client";

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

const Books = (props) => {
  const [filterGenre, setFilterGenre] = useState(null);
  const books = useQuery(ALL_BOOKS);

  if (!props.show) {
    return null;
  }

  if (books.loading) {
    return (
      <div>
        <span>Loading Books...</span>
      </div>
    );
  }

  return (
    <div>
      <h2>books</h2>
      {filterGenre ? (
        <>
          <h3>Showing only genre '{filterGenre}'</h3>{" "}
          <button onClick={() => setFilterGenre(null)}>Remove Filter</button>
        </>
      ) : null}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
            <th>genres</th>
          </tr>
          {books.data.allBooks
            .filter((book) => {
              if (filterGenre) {
                return book.genres.includes(filterGenre);
              } else {
                return true;
              }
            })
            .map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
                <td>
                  {a.genres.map((genre) => (
                    <p key={genre} onClick={() => setFilterGenre(genre)}>
                      {genre}
                    </p>
                  ))}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
