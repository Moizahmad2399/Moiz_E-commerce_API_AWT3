const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const productsRouter = require('./routes/products');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Simple request logger — helpful during grading/demoing.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// --- Health check ---
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'E-Commerce API is running',
    restBase: '/api/v1/products',
    graphql: '/graphql',
  });
});

// --- Module 1 & 2: REST resource + standardized errors ---
app.use('/api/v1/products', productsRouter);

// --- Module 3: GraphQL endpoint solving over-fetching ---
// Visit /graphql in a browser for the GraphiQL playground.
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

// Unknown routes -> standardized 404 (must come after real routes)
app.use(notFoundHandler);

// Centralized error handler -> must be registered LAST
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`   REST:    http://localhost:${PORT}/api/v1/products`);
  console.log(`   GraphQL: http://localhost:${PORT}/graphql`);
});
