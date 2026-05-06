import '../helpers/setup.js';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../src/app.js';
import Address from '../../src/models/address.model.js';
import { loginAndGetToken } from '../helpers/auth.js';
import { createUserFactory } from '../helpers/factories.js';

const addressPayload = {
  fullName: 'Nimita Malhotra',
  phone: '9999999999',
  addressLine1: '123 Street',
  addressLine2: 'Near Metro Station',
  city: 'Delhi',
  state: 'Delhi',
  postalCode: '110001',
  country: 'India',
  landmark: 'Opposite City Mall',
  addressType: 'home',
};

describe('Address API', () => {
  it('should add first address as default automatically', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send(addressPayload);

    expect(response.status).to.equal(201);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.isDefault).to.equal(true);
  });

  it('should fetch current user addresses', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send(addressPayload);

    const response = await request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data).to.have.length(1);
  });

  it('should fetch address by id', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const createResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send(addressPayload);

    const addressId = createResponse.body.data._id;

    const response = await request(app)
      .get(`/api/addresses/${addressId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data._id).to.equal(addressId);
  });

  it('should update own address', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const createResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send(addressPayload);

    const addressId = createResponse.body.data._id;

    const response = await request(app)
      .patch(`/api/addresses/${addressId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        city: 'Gurgaon',
        state: 'Haryana',
      });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.city).to.equal('Gurgaon');
    expect(response.body.data.state).to.equal('Haryana');
  });

  it('should set another address as default and unset previous default', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const firstResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...addressPayload,
        addressLine1: 'First Address',
      });

    const secondResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...addressPayload,
        addressLine1: 'Second Address',
        addressType: 'work',
      });

    const secondAddressId = secondResponse.body.data._id;

    const response = await request(app)
      .post(`/api/addresses/${secondAddressId}/set-default`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.data.isDefault).to.equal(true);

    const addresses = await Address.find({ user: user._id, isDefault: true });
    expect(addresses).to.have.length(1);
    expect(addresses[0]._id.toString()).to.equal(secondAddressId);
    expect(firstResponse.body.data.isDefault).to.equal(true);
  });

  it('should delete own address', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const createResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send(addressPayload);

    const addressId = createResponse.body.data._id;

    const response = await request(app)
      .delete(`/api/addresses/${addressId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data.deleted).to.equal(true);

    const deletedAddress = await Address.findById(addressId);
    expect(deletedAddress).to.equal(null);
  });

  it('should assign another default address after deleting current default', async () => {
    const { token, user } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const firstResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...addressPayload,
        addressLine1: 'Default Address',
      });

    await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...addressPayload,
        addressLine1: 'Backup Address',
        addressType: 'work',
      });

    await request(app)
      .delete(`/api/addresses/${firstResponse.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    const defaultAddress = await Address.findOne({
      user: user._id,
      isDefault: true,
    });

    expect(defaultAddress).to.not.equal(null);
    expect(defaultAddress.addressLine1).to.equal('Backup Address');
  });

  it('should not allow user to access another user address', async () => {
    const owner = await createUserFactory({
      email: 'owner@example.com',
      role: 'customer',
    });

    const { token } = await loginAndGetToken({
      email: 'other@example.com',
      role: 'customer',
    });

    const address = await Address.create({
      user: owner._id,
      ...addressPayload,
      isDefault: true,
    });

    const response = await request(app)
      .get(`/api/addresses/${address._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).to.equal(404);
    expect(response.body.success).to.equal(false);
  });

  it('should reject invalid address payload', async () => {
    const { token } = await loginAndGetToken({
      email: 'customer@example.com',
      role: 'customer',
    });

    const response = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...addressPayload,
        phone: '123',
      });

    expect(response.status).to.equal(400);
    expect(response.body.success).to.equal(false);
  });

  it('should block unauthenticated address access', async () => {
    const response = await request(app).get('/api/addresses');

    expect(response.status).to.equal(401);
    expect(response.body.success).to.equal(false);
  });
});