const request = require('supertest');
const app = require('../../../app');

describe('POST /users/password-verify-user', () => {
  test('valid password should return 200 OK with Password is valid', async () => {
    const originalBackdoorPassword = process.env.BACKDOOR_PASSWORD;
    process.env.BACKDOOR_PASSWORD = '$2a$04$lBAQtG7VtLvJPxxyZ1aC1.W8tdDv4GkLku3cGsznaghxovXj85MsC'; // secretpassword

    const response = await request(app).post('/users/password-verify-user').send({
      password: 'secretpassword'
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({message: 'Password is valid', code: 200});

    process.env.BACKDOOR_PASSWORD = originalBackdoorPassword;
  });

  test('invalid password should return 400 with Password is invalid', async () => {
    const originalBackdoorPassword = process.env.BACKDOOR_PASSWORD;
    process.env.BACKDOOR_PASSWORD = '$2a$04$lBAQtG7VtLvJPxxyZ1aC1.W8tdDv4GkLku3cGsznaghxovXj85MsC'; // secretpassword

    const response = await request(app).post('/users/password-verify-user').send({
      password: 'invalidpassword'
    });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({message: 'Password is invalid', code: 400});

    process.env.BACKDOOR_PASSWORD = originalBackdoorPassword;
  });

  test('empty password should return 403 with message of objects', async () => {
    const response = await request(app).post('/users/password-verify-user').send({
      password: ''
    });
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 403,
        status: 'error validation'
      })
    );
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'password',
          message: expect.any(String)
        })
      ])
    );
  });

  test('10 times request in 1 hour should return 429 with Too many requests, please try again later.', async () => {
    jest.useFakeTimers();

    const originalBackdoorPassword = process.env.BACKDOOR_PASSWORD;
    process.env.BACKDOOR_PASSWORD = '$2a$04$lBAQtG7VtLvJPxxyZ1aC1.W8tdDv4GkLku3cGsznaghxovXj85MsC'; // secretpassword

    const requestPromises = [];
    for (let i = 0; i < 10; i++) {
      requestPromises.push(
        request(app).post('/users/password-verify-user').send({
          password: ''
        })
      );
    }

    // test 11th request
    await Promise.all(requestPromises);
    const response = await request(app).post('/users/password-verify-user').send({
      password: ''
    });
    expect(response.statusCode).toBe(429);

    // test 12th request after 1 hour
    jest.advanceTimersByTime(1000 * 60 * 60);
    const response2 = await request(app).post('/users/password-verify-user').send({
      password: 'secretpassword'
    });
    expect(response2.statusCode).toBe(200);

    process.env.BACKDOOR_PASSWORD = originalBackdoorPassword;
  });
});
