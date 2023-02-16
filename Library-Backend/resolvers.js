const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const Author = require("./models/authors");
const Book = require("./models/books");
const User = require("./models/users");

const pubsub = new PubSub();

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
      if (!root.bookCount) {
        // Set Book Count if book Count not saved in DB. For Backwards Compatibility.
        const booksToFilter = await Book.find({});
        const bookCount = booksToFilter.filter((book) =>
          book.author.equals(root._id)
        ).length;
        Author.findOneAndUpdate({ name: root.name }, { bookCount }).exec();
        return bookCount; // author is saved as ID String}
      } else {
        return root.bookCount;
      }
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

        const newBookWithAuthor = await Book.findOne({
          title: args.title,
        }).populate("author");

        pubsub.publish("BOOK_ADDED", { bookAdded: newBookWithAuthor });
        return newBookWithAuthor;
      }
    },
    addAuthor: (root, args) => {
      try {
        addAuthor(null, args);
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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
