import type { NextApiRequest, NextApiResponse } from 'next';
import express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server);

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'John Doe' });
}
