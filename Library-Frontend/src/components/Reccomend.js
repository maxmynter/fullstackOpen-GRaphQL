import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { useEffect } from "react";

const GET_FAV_GENRE = gql`
  query Query {
    me {
      favouriteGenre
    }
  }
`;
const GET_BOOKS_OF_FAV_GENRE = gql`
  query Query($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
    }
  }
`;

const ReccomendedBooksOfGenre = ({ genre }) => {
  const books = useQuery(GET_BOOKS_OF_FAV_GENRE, {
    variables: { genre },
  });

  if (books.loading) {
    return (
      <div>
        <span>Loading Books of genre {genre}...</span>
      </div>
    );
  }
  return (
    <>
      <h2>books</h2>
      <table>
        <tbody>
          {books.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const Reccomend = (props) => {
  const favGenre = useQuery(GET_FAV_GENRE);

  if (!props.show) {
    return null;
  }

  if (favGenre.loading) {
    return (
      <div>
        <span>Loading Your Favourite Genre...</span>
      </div>
    );
  }

  return <ReccomendedBooksOfGenre genre={favGenre.data.favouriteGenre} />;
};

export default Reccomend;
