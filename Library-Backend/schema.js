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
  
  type Subscription {
    bookAdded: Book!
  }
`;

module.exports = typeDefs;
