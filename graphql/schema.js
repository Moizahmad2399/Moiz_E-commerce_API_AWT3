const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
} = require('graphql');
const productsDb = require('../data/products');

/**
 * VendorType and DimensionsType exist so the client can drill into
 * nested data too, but — this is the whole point — the client only
 * pays for what it actually asks for in its query.
 */
const VendorType = new GraphQLObjectType({
  name: 'Vendor',
  fields: {
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    country: { type: GraphQLString },
  },
});

const DimensionsType = new GraphQLObjectType({
  name: 'Dimensions',
  fields: {
    l: { type: GraphQLFloat },
    w: { type: GraphQLFloat },
    h: { type: GraphQLFloat },
  },
});

const ProductType = new GraphQLObjectType({
  name: 'Product',
  fields: {
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    price: { type: GraphQLFloat },
    category: { type: GraphQLString },
    description: { type: GraphQLString },
    stock: { type: GraphQLInt },
    sku: { type: GraphQLString },
    rating: { type: GraphQLFloat },
    reviewCount: { type: GraphQLInt },
    images: { type: new GraphQLList(GraphQLString) },
    vendor: { type: VendorType },
    weightKg: { type: GraphQLFloat },
    dimensionsCm: { type: DimensionsType },
    warrantyMonths: { type: GraphQLInt },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    /**
     * products(category: "electronics") { title price }
     * -> The client picks EXACTLY the fields it wants (e.g. just
     * title + price for a home screen banner) instead of receiving
     * the full ~15-field object every time. This is the direct fix
     * for the REST over-fetching problem described in the brief.
     */
    products: {
      type: new GraphQLList(ProductType),
      args: { category: { type: GraphQLString } },
      resolve: (_parent, args) => {
        const all = productsDb.getAll();
        if (args.category) {
          return all.filter((p) => p.category === args.category.toLowerCase());
        }
        return all;
      },
    },
    product: {
      type: ProductType,
      args: { id: { type: GraphQLInt } },
      resolve: (_parent, args) => productsDb.getById(args.id),
    },
  },
});

const schema = new GraphQLSchema({ query: QueryType });

module.exports = schema;
