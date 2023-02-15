const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const Author = require("./models/authors");
const Book = require("./models/books");
const User = require("./models/users");

const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MONGODB");
  })
  .catch((error) => {
    console.log("An error occured. Error: ", error.message);
  });

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
 */

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

/*
  you can remove the placeholder query once your first own has been implemented 
*/

const typeDefs = `
  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]
    me: User
  }
  type Book {
    title: String
    author: Author!
    published: Int
    genres: [String]!
    id:ID!
  }

  type Author {
    name: String!
    bookCount: Int
    born: Int 
  }

  type User {
    username: String!
    favouriteGenre: String!
    id:ID!
  }

  type Token {
    value: String!
  }

  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int
        genres: [String!]
    ): Book!
    addAuthor(
        name:String!
        bookCount: Int
        born: Int
    ): Author
    editAuthor(
        name:String!
        setBornTo:Int
        ): Author
    createUser(
      username:String!
      favouriteGenre:String!
    ):User
    login (
      username: String!
      password: String!
    ): Token
  }
`;

const addAuthor = async (root, args) => {
  const newAuthor = new Author({ ...args });
  await newAuthor.save();
  authorWithID = await Author.findOne({ name: args.name });
  return authorWithID;
};

const getAllAuthors = async () => {
  const authors = await Author.find({});
  return authors;
};

const getAllBooks = async () => {
  const books = await Book.find({}).populate("author");
  return books;
};

const throwNotLoggedInError = () => {
  throw new GraphQLError("Not Logged In", {
    extensions: { code: "NOT_LOGGED_IN" },
  });
};

const resolvers = {
  Query: {
    bookCount: async () => await Book.countDocuments(),
    authorCount: async () => await Author.countDocuments(),
    allBooks: async (root, args) => {
      let booksToReturn = await getAllBooks();
      if (args.author) {
        booksToReturn = booksToReturn.filter(
          (book) => book.author === args.author
        );
      }
      if (args.genre) {
        booksToReturn = booksToReturn.filter((book) =>
          book.genres.includes(args.genre)
        );
      }
      return booksToReturn;
    },
    allAuthors: async () => await getAllAuthors(),
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    bookCount: async (root) => {
      const booksToFilter = await Book.find({});
      return booksToFilter.filter((book) => book.author === root.name).length;
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throwNotLoggedInError();
      } else {
        const authors = await getAllAuthors();
        let thisBookAuthor;
        if (!authors.map((author) => author.name).includes(args.author)) {
          thisBookAuthor = await addAuthor(null, {
            name: args.author,
            bookCount: 1,
          });
        } else {
          thisBookAuthor = await Author.findOne({ name: args.author });
        }
        const newBook = new Book({
          ...args,
          author: thisBookAuthor._id.toString(),
        });
        try {
          await newBook.save();
        } catch (error) {
          throw new GraphQLError("Saving Book failed", {
            extensions: { code: "BAD_USER_INPUT", invalidArgs: args, error },
          });
        }
        return newBook;
      }
    },
    addAuthor: () => {
      try {
        addAuthor;
      } catch (error) {
        throw new GraphQLError("Adding Author failed", {
          extensions: { code: "BAD_USER_INPUT", invalidArgs: args, error },
        });
      }
    },
    editAuthor: (root, args, { currentUser }) => {
      if (!currentUser) {
        throwNotLoggedInError();
      } else {
        if (!Author.find((author) => author.name === args.name)) {
          return null;
        } else {
          authors = authors.map((author) => {
            if (author.name === args.name) {
              return { ...author, born: args.setBornTo };
            } else {
              return author;
            }
          });
          return authors.find((author) => author.name === args.name);
        }
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre,
      });
      try {
        await user.save();
      } catch (error) {
        throw new GraphQLError("Could  not create user", {
          extensions: { code: "BAD_USER_INPUT", invalidArgs: args.name, error },
        });
      }
      return User.findOne({ username: args.username });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "pw") {
        throw new GraphQLError("Wrong Login Credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const userForToken = { username: user.username, id: user._id };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
