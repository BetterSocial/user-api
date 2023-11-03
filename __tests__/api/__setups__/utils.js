const {exec} = require('child_process');
const {User} = require('../../../databases/models');
const TestConstants = require('../__utils__/constant');
const moment = require('moment');

if (process.env.EXECUTABLE_PHP === undefined) {
  throw new Error('Please set EXECUTABLE_PHP env');
}

if (process.env.LARAVEL_PATH === undefined) {
  throw new Error('Please set LARAVEL_PATH env');
}

const executablePhp = process.env.EXECUTABLE_PHP.replace(/ /g, '\\ ');
const laravelPath = process.env.LARAVEL_PATH.replace(/ /g, '\\ ');

const phpArtisan = async (command) =>
  new Promise((resolve, reject) => {
    exec(
      `${executablePhp} ${laravelPath}/artisan ${command}`,
      {
        env: {
          APP_ENV: 'testing',
          DB_CONNECTION: 'pgsql',
          DB_HOST: process.env.DB_HOST,
          DB_PORT: 5432,
          DB_DATABASE: process.env.DB_NAME,
          DB_USERNAME: process.env.DB_USERNAME,
          DB_PASSWORD: process.env.DB_PASSWORD
        }
      },
      (err, stdout) => {
        if (err) {
          console.error(stdout);
          reject(err);
        }
        resolve();
      }
    );
  });

const createUser = async (data) => {
  try {
    const user = await User.create({
      user_id: TestConstants.MY_USER_ID,
      human_id: 'test',
      country_code: 'ID',
      username: 'test',
      real_name: 'test',
      last_active_at: new Date(),
      status: 'Y',
      is_anonymous: false,
      created_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
      updated_at: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
      verified_status: 'VERIFIED',
      ...data
    });

    return user;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  phpArtisan,
  createUser
};
