var config = {};

config.port = 8080;
config.address = 'localhost';
config.twitter_username = process.env.TWITTER_USERNAME || '';
config.twitter_password = process.env.TWITTER_PASSWORD || '';

config.keyword = 'uidcookiebox';

module.exports = config;
