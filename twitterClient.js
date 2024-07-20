const {TwitterApi} =require('twitter-api-v2');
const dotenv=require('dotenv');
dotenv.config();
// Instantiate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi({
    appKey:process.env.APPKEY,
    appSecret:process.env.APPSECRET,
    accessToken:process.env.ACCESSTOKEN,
    accessSecret:process.env.ACCESSSECRET,
});


const rwClient = twitterClient.readWrite;

module.exports=rwClient;
