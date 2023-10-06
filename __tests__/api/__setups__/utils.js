const {exec} = require('child_process');
const {User} = require('../../../databases/models');

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

const creatUser = async (data) => {
  try {
    const user = await User.create({
      user_id: 'd24f6c17-f20e-4cc9-8df1-45f1fa4dcf52',
      human_id: 'test',
      country_code: 'ID',
      username: 'test',
      real_name: 'test',
      last_active_at: new Date(),
      status: 'Y',
      ...data
    });

    return user;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  phpArtisan,
  creatUser
};
