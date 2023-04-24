import { Server } from 'socket.io';
// import type { NextApiRequest, NextApiResponse } from 'next';

export default function SocketHandler(req, res) {
  const io = new Server(res.socket?.server);
  res.socket.server.io = io;

  io.on('connection', socket => {});
  res.end('Pegou');
}
