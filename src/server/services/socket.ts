// import { Server as HttpServer } from "http";
// import * as socketIo from "socket.io";
// import * as redis from "socket.io-redis";
// import * as debug from "debug";

// /*socketIOサーバーを立てる*/
// function createSocketIOServer(server: HttpServer): socketIo.Server {
//   const io = socketIo().listen(server);
//   io.adapter(redis({ host: kRedisHost, port: parseInt(kRedisPort) }));
//   return io;
// }

// const socketIOHandler = (io: socketIo.Server) => {
//   io.on("connect", socket => {
//     debug("user connected");

//     /*問題IDが存在する場合*/
//     if (socket.handshake.query["quizId"]) {
//       const { quizId } = socket.handshake.query;
//       debug(`roomID : ${quizId}`);

//       socket.join(quizId, () => {
//         let rooms = Object.keys(socket.rooms);
//         debug(`rooms : ${rooms}`);
//         io.to(quizId).emit(
//           "lnq:message",
//           `a new user has joined the room${quizId}`
//         );
//         socket.emit("lnq:message", `you joined room${quizId}`);
//       });

//       socket.on("disconnect", () => {
//         socket.leave(quizId);
//       });
//     }
//   });
// };

// const publishQuizUpdate = (id: string, io: socketIo.Server) => {
//   io.to(id).emit("lnq:message", `quiz${id} updated!`);
// };

// export { createSocketIOServer, socketIOHandler, publishQuizUpdate };
