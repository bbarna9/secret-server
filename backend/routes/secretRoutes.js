import express from 'express';
import Secret from '../models/Secret.js';
import CryptoJS from 'crypto-js';
import { randomBytes } from 'node:crypto';

const router = express.Router();

const today = new Date();

// Getting every secret
router.get('/', async (req, res) => {
  try {
    const secrets = await Secret.find();
    // If the secrets were found return them, otherwise return a "No secrets yet" text message.
    if (secrets) {
      res.status(200).send(secrets);
    } else {
      res.status(404).json('Nincs még titok elmentve');
    }
  } catch (err) {
    // In case of any error return it.
    res.status(500).json(err);
  }
});

// Get a single secret by it's unique hash code.
router.get('/secret/:hash', async (req, res) => {
  try {
    const secret = await Secret.findOne({ hash: req.params.hash });
    // Decrypt the secret-text using the crypto-js package
    const bytes = CryptoJS.AES.decrypt(
      secret.secretText,
      process.env.SECRET_KEY
    );
    const readableText = bytes.toString(CryptoJS.enc.Utf8);
    secret.secretText = readableText;
    // If the secret was found return it, otherwise return a "Secret not found" text message.
    if (secret) {
      // Lower the secret's remaining views property and update it in the database.
      secret.remainingViews -= 1;
      const lessViewSecret = await Secret.updateOne(
        { hash: req.params.hash },
        { remainingViews: secret.remainingViews }
      );
      // Check if the secret has expired already: if not return it, otherwise let the user know that it is expired.
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

    // In case of any errors just return it.
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add a new secret to the database
router.post('/secret', async (req, res) => {
  try {
    // Add the remaining minutes given by the user to the current date-time.
    const timeLeft = parseInt(req.body.secret.expiresat.toString());
    const expiresAt =
      timeLeft != 0
        ? new Date(new Date().setMinutes(new Date().getMinutes() + timeLeft))
        : 'never';

    // Create a new secret object with the data given by the user.

    // For the hash I'm generating some random bytes and the secret is encrypted
    //    with the same crypto-js package that I have used for the decryption as well.
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

    // If all's good return the newly added secret, otherwise the error.
    res.status(201).send(savedSecret);
  } catch (err) {
    res.status(405).json(err);
  }
});

export default router;
