import { Server as HttpServer } from "http";
import * as socketIo from "socket.io";
import * as redis from "socket.io-redis";
import * as debug from "debug";

/*socketIOサーバーを立てる*/
/*TODO スケールアウトできるようにする*/
function createSocketIOServer(server: HttpServer): socketIo.Server {
  const io = socketIo().listen(server);
  //io.adapter(redis({ host: kRedisHost, port: parseInt(kRedisPort) }));
  return io;
}

const socketIOHandler = (io: socketIo.Server) => {
  io.on("connect", socket => {
    debug("user connected");

    /*問題IDが存在する場合*/
    if (socket.handshake.query["hicId"]) {
      const { hicId, userId } = socket.handshake.query;
      debug(`roomID : ${hicId}`);
      debug(`joined userID : ${userId}`);

      socket.join(hicId, () => {
        let rooms = Object.keys(socket.rooms);
        debug(`rooms : ${rooms}`);
        io.to(hicId).emit(
          "hic:message",
          `new user: ${userId} has joined the room ${hicId}`
        );
        socket.emit("hic:message", `you joined room ${hicId}`);
      });

      socket.on("disconnect", () => {
        socket.leave(hicId);
      });
    }
  });
};

const publishUpdate = (id: string, io: socketIo.Server) => {
  console.log(`layer ${id} updated!`);
  io.to(id).emit("hic:message", `layer ${id} updated!`);
};

export { createSocketIOServer, socketIOHandler, publishUpdate };
