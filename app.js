require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');
const { Configuration, OpenAIApi } = require("openai");
// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
// event handler
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
	  //將字串轉小寫，之後的條件判斷使用 ltext.startsWith來判斷，但是程式碼呼叫時還是使用原字串event.message.text
    var ltext = event.message.text.toLowerCase();

    //判斷hi bot 0.5
    if (ltext.startsWith("hi bot")) {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: event.message.text.substring(7),
        temperature: 0.5,
        max_tokens: 1000,
      })
      const echo = { type: "text", text: completion.data.choices[0].text.trim() };
      // use reply API
      return client.replyMessage(event.replyToken, echo);
    }
  
    // 花花 1
    else if (ltext.startsWith("hi 花花")) {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: event.message.text.substring(7),
        temperature: 1,
        max_tokens: 1000
      })
      const echo = { type: "text", text: completion.data.choices[0].text.trim() };
      // use reply API
      return client.replyMessage(event.replyToken, echo);
    }
  
    
    // fuck 3.5
    else if (ltext.startsWith('hi pochi')) {
      const { data } = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: 'user',
            content: '今後的對話中，你名字是' + 'pochi' + '，你的生日是02/21，你會替我分析我的問題並給我一些建議與答案，盡量使用繁體中文回答。'
          },
          {
            role: 'user',
            content: event.message.text.substring('hi pochi'),
          }
        ],
        max_tokens: 1000,
      });
      // create a echoing text message
      const [choices = {}] = data.choices;
      const echo = { type: 'text', text: choices.message.content.trim() };
      console.log("回應內容:", choices.message.content.trim());
      return client.replyMessage(event.replyToken, echo);
    }
    else if (ltext.startsWith("pochi")) {
      const { data } = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: 'user',
            content: '今後的對話中，你名字是pochi，替我分析我的問題並給我一些建議與答案，請盡量使用繁體中文回答，並在回答前加上"My loard:"'
          },
          {
            role: 'user',
            content: event.message.text.substring("5"),
          }
        ],
        max_tokens: 1000,
      });
      // create a echoing text message
      const [choiceskk = {}] = data.choices;
      const echo = { type: 'text', text: choiceskk.message.content.trim() };
      console.log("My loard回應內容:", choiceskk.message.content.trim());
      return client.replyMessage(event.replyToken, echo);
    }
    else if (ltext.startsWith("hi 狂花")) {
    const completion = await openai.createImage({
        prompt: ltext.substring("hi 狂花"),
        n: 1,
        size: "256x256",
    });
    const image_url = completion.data.data[0].url;
    // create an echoing image message
    const echo = {
        type: 'image',
        originalContentUrl: image_url,
        previewImageUrl: image_url
    };
    console.log("回應內容:", echo);
    }
    //判斷提供功能表
    else if (ltext == "help") {
      const response = {
        type: "text",
        text: "請依照以下規則：\n" +
          "'hi bot + 描述'，一半創意一半制式\n" +
          "'hi 花花 + 描述'，回答比較創意，每次都不一樣\n" +
          "'pochi + 描述'，ChatGpt3.5的回答\n" +
	  "'hi 狂花 + 描述'，製圖\n"
      }
      // use reply API
      return client.replyMessage(event.replyToken, response);
    }
  
    //判斷wake
    else if (ltext.startsWith("wake")) {
      const response = {
        type: "text",
        text: "我起床了，此版本是ver.03162009LL"
      }
      // use reply API
      return client.replyMessage(event.replyToken, response);
    }
  
    //此外不做事
    else {
      return Promise.resolve(null);
    }
  }


// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
