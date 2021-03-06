const express = require("express");
const jwt = require("jsonwebtoken");

const { validateSignup, validateSignin } = require("../middlewares/validation");
const authMiddleware = require("../middlewares/auth");
const usersRepository = require("../repositories/usersRepository");
const registrationsRepository = require("../repositories/registrationsRepository");
const trailsRepository = require("../repositories/trailsRepository");

const router = express.Router();

router.post("/sign-up", validateSignup, async (req, res) => {
  const userParams = req.body;

  try {
    const createdUser = await usersRepository.create(userParams);
    res.status(201).send(createdUser);
  } catch (e) {
    res.status(409).send(e.message);
  }
});

router.post("/sign-in", validateSignin, async (req, res) => {
  const userParams = req.body;

  try {
    const user = await usersRepository.findByEmail(userParams);

    if (!user) return res.sendStatus(401);
    const token = jwt.sign({ id: user.id }, process.env.SECRET, {
      expiresIn: "5 days",
    });

    res.status(200).send({ ...user, token });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/countdown", (req,res) => {
  const event = new Date('December 11, 2020 18:00:00');
  res.status(200).send({event})
});

router.get("/:id/complete-reg", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = res.locals.user;
  let hotel;
  try {
    if (user.ticket === "hotel") {
      const resp = await registrationsRepository.getHotel(id);
      hotel = resp && resp.hotel;
    }
    const registration = await registrationsRepository.getUserRegistration(id);
    const trails = await trailsRepository.getUserTrails(id);
    const completeReg = { ...registration, ...trails, hotel };

    res.status(200).send(completeReg);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
