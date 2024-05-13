const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const SuccessHandler = require('./successHandler');
const ErrorHandler = require('./errorHandler');
const Post = require('./models/post');

dotenv.config({ path: './config.env' });

// 連接資料庫
const DB = process.env.DATABASE_URL.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB)
  .then(() => {
    console.log('資料庫連線成功');
  })
  .catch((err) => {
    console.log(err);
  });

const requestListener = async (req, res) => {

  // 取得所有貼文資料
  if (req.url === '/posts' && req.method === 'GET'){
    let posts = await Post.find({});
    SuccessHandler(res, true, posts);
  }
  // 新增單筆貼文
  else if (req.url === '/posts' && req.method === 'POST'){
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try{
        let post = JSON.parse(body);
        await Post.create(post);
        let posts = await Post.find({});
        SuccessHandler(res, true, posts);
      }
      catch (error){
        ErrorHandler(res, 400, error.errors);
      }
    })
  }
  // 刪除所有貼文
  else if (req.url === '/posts' && req.method === 'DELETE'){
    await Post.deleteMany({});
    let posts = await Post.find({});
    SuccessHandler(res, true, posts);
  }
  // 刪除單筆貼文
  else if (req.url.startsWith('/posts/') && req.method === 'DELETE'){
    const id = req.url.split('/').pop();
    if (mongoose.isValidObjectId(id)){
      let result = await Post.findByIdAndDelete(id); // 沒有找到會回傳null, 有找到會回傳該貼文
      if (result === null){
        ErrorHandler(res, 400, '沒有該筆貼文');
      }
      else{
        let posts = await Post.find({});
        SuccessHandler(res, true, posts);
      }

    }
    else {
      ErrorHandler(res, 400, '該筆貼文Id格式不符');
    }
    
  }
  // 更新單筆貼文
  else if (req.url.startsWith('/posts/') && req.method === 'PATCH'){
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try{
        const id = req.url.split('/').pop();
        if (mongoose.isValidObjectId(id)){
          let newPost = JSON.parse(body);
          let result = await Post.findByIdAndUpdate(id, newPost, { runValidators: true }); // 沒有找到會回傳null, 有找到會回傳該貼文
          if (result === null){
            ErrorHandler(res, 400, '沒有該筆貼文');
          }
          else{
            let posts = await Post.find({});
            SuccessHandler(res, true, posts);
          }
        }
        else {
          ErrorHandler(res, 400, '該筆貼文Id格式不符');
        }
        
      }
      catch(error){
        ErrorHandler(res, 400, error.errors);
      }
    })
    
  }
  // preflight
  else if (req.method === 'OPTIONS'){
    SuccessHandler(res, false);
  }
  // 不符合所有條件
  else {
    ErrorHandler(res, 404, '沒有此網站路由');
  }
}
const server = http.createServer(requestListener);
server.listen(process.env.PORT);