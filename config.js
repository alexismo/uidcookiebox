var config = {};

config.port = 8080;
config.address = 'localhost';
config.twitter_username = process.env.TWITTER_USERNAME || 'uidcookiebox';
config.twitter_password = process.env.TWITTER_PASSWORD || 'arduino';

config.keyword = 'uidcookiebox';

module.exports = config;
