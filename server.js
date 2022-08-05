// put in data first

const Sequelize = require("sequelize"); // brought in with a capital S since it's used as a constructor
const client = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/wnews_seq_db"
);

// Sequelize will pluralize
// use CAPS for models
const Post = client.define("post", {
  title: {
    type: Sequelize.STRING,
  },
  content: {
    type: Sequelize.TEXT,
  },
});
const User = client.define("user", {
  name: {
    type: Sequelize.STRING,
  },
});

// connect the two models
Post.belongsTo(User);

const startUp = async () => {
  try {
    await client.sync({ force: true }); // will error if db doesn't exist
    // create three users
    // const moe = await User.create({ name: "moe" });
    // const lucy = await User.create({ name: "lucy" });
    // const larry = await User.create({ name: "larry" });

    // array destructuring
    const [moe, lucy, larry] = await Promise.all([
      User.create({ name: "moe" }),
      User.create({ name: "lucy" }),
      User.create({ name: "larry" }),
      User.create({ name: "ethyl" }),
    ]);

    await Promise.all([
      Post.create({ title: "foo", content: "moes foo post", userId: moe.id }),
      Post.create({ title: "bar", content: "moes bar post", userId: moe.id }),
      Post.create({ title: "bazz", content: "lucy post", userId: lucy.id }),
    ]);
  } catch (ex) {
    console.log(ex);
  }
};

startUp();
