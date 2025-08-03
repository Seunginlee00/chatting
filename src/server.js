import express from "express";
import http from "http"; // ✅ 수정
import { instrument } from "@socket.io/admin-ui";
// import WebSocket from "ws";

import SocketIO from "socket.io";


const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// 서버부터 만듬 
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      //  소켓 아이디랑 , 룸이름 
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {
    socket["nickname"] = "Anon";
      socket.onAny((event) => {
        // console.log(`Socket Event: ${event}`);
      });
    socket.on("enter_room", (roomName, done) => {
      socket.join(roomName); // 방에는 room id가 있어 구분 가능 
      done();
      socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
      wsServer.sockets.emit("room_change", publicRooms());
      // setTimeout(()=>{
      //   done("hello, from the backend"); 
      //   // backend 가 실행시키는 게 아니라 프론트엔드가 backendDone 을 실행시킴,, 보안상의 문제래 쩝 
      //   // 프론트엔드가 버튼을 누른다.. 라는 느낌이램,, 쩝 ~ 모르겟당 ~~~! 
      // },10000);
  });
    socket.on("disconnecting", () => { // 모든 방에게 bye ,, 
      socket.rooms.forEach((room) => 
        socket.to(room).emit("bye", socket.nickname)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg,room,done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

});




// ws import > 이렇게 넘기면 둘다 같은 포트로 쓸수 있음 ~~ 
// WebSocket  는  api 이기 때문에 object를 string 으로 파싱하는 작업이 필요함 
// const wss = new WebSocket.Server({ server });

//socket 브라우저와의 연결 
// 이를 이용해 메세지를 주고 받을 수 있으나 저장이 필요함 > 최소 console.log

// function handleConnection(socket) {
//   console.log(socket);
// }

// 연결 

function onSocketClose() {
  console.log("Disconnected from the Browser ❌");
}

function onSocketMessage(message) {
  const text = message.toString(); // ✅ Buffer → 문자열 변환
  socket.send(text);
}

// // 연결된 사람을 넣을배열 
// const sockets = [];



// web soket 
// // object to json
// wss.on("connection", (socket) =>{
//     sockets.push(socket);
//     socket["nickname"] = "Anon"; // 없는 경우를 대비한 없는 값 
//   console.log("Connected to Brower ✅");
//   socket.on("close", onSocketClose);
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//       case "nickname":
//         socket["nickname"] = message.payload;
//     }
//     // const text = parsed.toString(); // ✅ Buffer → 문자열 변환
//   });
// });



// server.listen(3000, handleListen);
httpServer.listen(3000, handleListen);


// json 으로 두가지 message와 nickname 을 만들어서 구분 , 

//but 나를 제외하고 보내도록 수정 하는 작업이 필요 . 