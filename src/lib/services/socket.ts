import  { Socket } from 'socket.io';
import { schedule } from 'node-cron';

export const socketServer = async (io: any) => {
  io.on("connection", (socket: Socket) => {
    console.log(socket.id);
    let task: any;

  });
}

