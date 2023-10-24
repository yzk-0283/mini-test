const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const request = require('request');
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const { init: initDB, Counter } = require("./db");

const router = new Router();

const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});


// 订阅消息
app.get("/send", async function (req, res) {
  const { openid } = req.query // 通过 get 参数形式指定 openid
  // 在这里直接是触发性发送，也可以自己跟业务做绑定，改成事件性发送
  const info = await sendapi(openid)
  res.send(info)
});

async function sendapi(openid) {
  return new Promise((resolve, reject) => {
    request({
      url: "http://api.weixin.qq.com/cgi-bin/message/subscribe/send",
      method: "POST",
      body: JSON.stringify({
        touser: openid,
        template_id: "这 T28aWToEBXR29Ti6MVs-ujC2kgXTuapAS0Fhn0XQa_Y",
        miniprogram_state: "developer",
        data: {
          // 这里替换成自己的模板 ID 的详细事项，不要擅自添加或更改
          // 按照 key 前面的类型，对照参数限制填写，否则都会发送不成功
          //
          thing4: {
            value: "这是一个提醒",
          },
          time5: {
            value: "2022 年 4 月 26 日 21:48",
          },
        },
      }),
    },function(error,res){
      if(error) reject(error)
      resolve(res.body)
    });
  });
}


// 更新计数
router.post("/api/count", async (ctx) => {
  const { request } = ctx;
  const { action } = request.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }

  ctx.body = {
    code: 0,
    data: await Counter.count(),
  };
});

// 获取计数
router.get("/api/count", async (ctx) => {
  const result = await Counter.count();

  ctx.body = {
    code: 0,
    data: result,
  };
});

// 小程序调用，获取微信 Open ID
router.get("/api/wx_openid", async (ctx) => {
  if (ctx.request.headers["x-wx-source"]) {
    ctx.body = ctx.request.headers["x-wx-openid"];
  }
});

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();
