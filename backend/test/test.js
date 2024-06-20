import express from 'express';
import { expect } from 'chai';
import supertest from 'supertest';
import { app } from '../index.js';

const api = supertest(app);

describe('POST Create Secret', () => {
  const secret = {
    secret: {
      secrettext: 'SomethingSecret',
      expiresat: 20,
      remainingviews: 100,
    },
  };

  // Code for testing the new object creation
  it('Create a secret', async () => {
    const response = await api.post('/secret').send(secret);
    // Secret should be created
    expect(response.status).to.equal(201);
    // Secret's secret-text should be enycrypted
    expect(response.body.secretText.slice(0, 7)).to.equal('U2FsdGV');
    // Secret's expiring date should be 20 minutes from now
    expect(new Date(response.body.expiresAt).getMinutes()).to.equal(
      new Date(new Date().setMinutes(new Date().getMinutes() + 20)).getMinutes()
    );
  });

  it('Encrypt secret-text', async () => {
    const response = await api.post('/secret').send(secret);
    // Secret's secret-text should be enycrypted
    expect(response.body.secretText.slice(0, 7)).to.equal('U2FsdGV');
  });

  it('Add expiration', async () => {
    const response = await api.post('/secret').send(secret);
    // Secret's expiring date should be 20 minutes from now
    expect(new Date(response.body.expiresAt).getMinutes()).to.equal(
      new Date(new Date().setMinutes(new Date().getMinutes() + 20)).getMinutes()
    );
  });
});

describe('GET Learn a Secret', () => {
  const hash = '69c299c37a1ae52e5de2';
  const expiredHash = '9f10f16ef9e1d12bb6c2';
  let views = 0;

  /*  This is the selected secret:
    
        "hash": "e2f391c8b74df1a3e201",
        "secretText": "U2FsdGVkX1/o+a1p34rfxBAWbs05vHatNx6iOu0qFJ0=", (decrypted: "SomethingSecret")
        "createdAt": "Thu Jun 20 2024 10:54:13 GMT+0200 (közép-európai nyári idő)",
        "expiresAt": "never",
        "remainingViews": 100,    
    
    */

  // Code for testing the new object creation
  it('Return the selected secret', async () => {
    const response = await api.get(`/secret/${hash}`);
    views = response.body.remainingViews;
    // Secret should be returned
    expect(response.status).to.equal(200);
  });

  it('Lower available views', async () => {
    const response = await api.get(`/secret/${hash}`);
    // Secret's remaining views should be equal to the views variable
    expect(response.body.remainingViews).to.equal(views - 1);
  });

  it('Decrypt secret', async () => {
    const response = await api.get(`/secret/${hash}`);
    // Secret's secret-text should be decrypted and equal to "SomethingSecret"
    expect(response.body.secretText).to.equal('SomethingSecret');
  });

  it('Hide secret', async () => {
    const response = await api.get(`/secret/${expiredHash}`);
    // Secret should be hidden if the expiree date is smaller than the "current date" (fake date in this case)
    expect(response.body).to.equal('Ez a titok már nem elérhető!');
  });
});
