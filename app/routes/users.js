const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const dotEnv = require("dotenv");
const isAuthorized = require("../middlewares/auth");


dotEnv.config();

const secret = process.env.JWT_TOKEN;

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error trying finding the users by author" });
  }
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error registering new user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) res.status(401).json({ error: "Incorrect email or password." });
    else {
      user.isPasswordCorrect(password, function (err, same) {
        if (!same)
          res.status(401).json({ error: "Incorrect email or password." });
        else {
          const token = jwt.sign({ email }, secret, { expiresIn: "7d" });
          res.json({ user: user, token: token });
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal error, please try again" });
  }
});


router.put('/', isAuthorized, async (req, res) => {
  const { name, email } = req.body
  
  try {
    let user = await User.findOneAndUpdate(
      {_id: req.user._id},
      {$set: {name: name, email: email}},
      {upsert: true, 'new': true}
    )

    res.json(user)
  } catch (error) {
    res.status(401).json({error: error})
  }
})

router.put('/password', isAuthorized, async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findOne({_id: req.user._id})
    user.password = password
    user.save()
    
    res.json(user)
  } catch (error) {
    res.status(401).json({error: error})
  }
})

router.delete('/', isAuthorized, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user._id})
    await user.delete()

    res.json({message: `${user.name} successfully deleted`}).status(201)
  } catch (error) {
    res.status(500).json({error: error})
  }
})

module.exports = router;
