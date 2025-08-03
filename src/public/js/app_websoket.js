// 서버로와의 연결
const socket = new WebSocket(`ws://${window.location.host}`);
const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

// string to object
function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}



// 받기 위한 준비 
function handleOpen() {
  console.log("Connected to Server ✅");
}
socket.addEventListener("open", handleOpen);


// 메세지를 받음
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

// 받고 종료
socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

// 채팅이 여러개 받는다면 함수로 하여 분리해줄 필요가 있다. 
function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = `YOU : ${input.value}`;
  messageList.append(li);
  input.value = "";
}


// 닉네임 선택 
function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);


