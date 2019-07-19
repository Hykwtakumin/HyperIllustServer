import { Server as HttpServer } from "http";
import * as socketIo from "socket.io";
import * as redis from "socket.io-redis";
import * as debug from "debug";

/*socketIOサーバーを立てる*/
function createSocketIOServer(server: HttpServer): socketIo.Server {
  const io = socketIo().listen(server);
  //io.adapter(redis({ host: kRedisHost, port: parseInt(kRedisPort) }));
  return io;
}

const socketIOHandler = (io: socketIo.Server) => {
  io.on("connect", socket => {
    debug("user connected");

    /*問題IDが存在する場合*/
    if (socket.handshake.query["quizId"]) {
      const { quizId } = socket.handshake.query;
      debug(`roomID : ${quizId}`);

      socket.join(quizId, () => {
        let rooms = Object.keys(socket.rooms);
        debug(`rooms : ${rooms}`);
        io.to(quizId).emit(
          "hic:message",
          `a new user has joined the room${quizId}`
        );
        socket.emit("hic:message", `you joined room${quizId}`);
      });

      socket.on("disconnect", () => {
        socket.leave(quizId);
      });
    }
  });
};

const publishUpdate = (id: string, io: socketIo.Server) => {
  console.log(`layer ${id} updated!`);
  io.to(id).emit("hic:message", `layer ${id} updated!`);
};

export { createSocketIOServer, socketIOHandler, publishUpdate };
