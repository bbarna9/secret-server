import express from 'express';
import Secret from '../models/Secret.js';
import CryptoJS from 'crypto-js';
import { randomBytes } from 'node:crypto';

const router = express.Router();

const today = new Date();

router.get('/', async (req, res) => {
  try {
    const secrets = await Secret.find();
    if (secrets) {
      res.status(200).send(secrets);
    } else {
      res.status(404).json('Nincs még titok elmentve');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/secret/:hash', async (req, res) => {
  try {
    const secret = await Secret.findOne({ hash: req.params.hash });
    // const expiresAt = new Date(secret.expiresAt);
    const bytes = CryptoJS.AES.decrypt(
      secret.secretText,
      process.env.SECRET_KEY
    );
    const readableText = bytes.toString(CryptoJS.enc.Utf8);
    secret.secretText = readableText;

    console.log(secret);
    if (secret) {
      secret.remainingViews -= 1;
      const lessViewSecret = await Secret.updateOne(
        { hash: req.params.hash },
        { remainingViews: secret.remainingViews }
      );
      console.log(secret);
      if (
        (new Date() < new Date(secret.expiresAt) ||
          secret.expiresAt == 'never') &&
        secret.remainingViews > 0
      ) {
        res.status(200).send(secret);
      } else {
        res.status(404).json('Ez a titok már nem elérhető!');
      }
    } else {
      res.status(404).json('Nincs ilyen kulcsú titok');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/secret', async (req, res) => {
  try {
    const timeLeft = parseInt(req.body.secret.expiresat.toString());
    const expiresAt =
      timeLeft != 0
        ? new Date(new Date().setMinutes(new Date().getMinutes() + timeLeft))
        : 'never';
    const newSecret = new Secret({
      hash: randomBytes(10).toString('hex'),
      secretText: CryptoJS.AES.encrypt(
        req.body.secret.secrettext.toString(),
        process.env.SECRET_KEY
      ).toString(),
      createdAt: new Date(),
      expiresAt: expiresAt,
      remainingViews: parseInt(req.body.secret.remainingviews.toString()),
    });
    const savedSecret = await newSecret.save();
    res.status(201).send(savedSecret);
  } catch (err) {
    res.status(405).json(err);
  }
});

export default router;
