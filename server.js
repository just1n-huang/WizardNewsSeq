const express = require("express");
app = express();
const html = require("html-template-tag");
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

app.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      // this is like JOIN
      include: [User],
    });
    res.send(html`<body>
      <h1>Wizard News Seq</h1>
      <ul>
        ${posts.map((post) => {
          return `<li><a href="/posts/${post.id}">${post.title}</a> written by ${post.user.name}</li>`;
        })}
      </ul>
    </body>`);
  } catch (ex) {
    next(ex);
  }
});

app.get("/posts/:id", async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [User],
    });
    res.send(
      html`<html>
        <head>
          <title>Detail for ${post.title}</title>
        </head>
        <body>
          <a href="/">Back to All Posts</a>
          <h1>${post.title} by ${post.user.name}</h1>
          <p>${post.content}</p>
        </body>
      </html>`
    );
  } catch (ex) {
    next(ex);
  }
});

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
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  } catch (ex) {
    console.log(ex);
  }
};

startUp();
