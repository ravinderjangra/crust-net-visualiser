import * as WebSocket from "ws";
import connectionLogService from "./models/ConnectionLog";
import { ConnectionLog } from "Apptypes";
import { generateLogHash } from "./util/helpers";

interface QMsg {
  data: ConnectionLog;
  executor: Function;
}

class Queue {
  private messages: Array<QMsg> = new Array;
  private isRunning = false;

  private next() {
    if (this.messages.length === 0) {
      this.isRunning = false;
      return;
    }
    const tempMsg = this.messages.splice(0, 1)[0];
    tempMsg.executor(tempMsg.data, () => {
      this.next();
    });
  }

  private start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.next();
  }

  public push(msg: QMsg) {
    this.messages.push(msg);
    this.start();
  }

}


export default class WebSocketServer {
  private wss: WebSocket.Server;
  private queue: Queue;
  // private server: any;
  constructor(port: number) {
    this.wss = new WebSocket.Server({ port: port || 4444 });
    this.queue = new Queue;
  }

  private async onMsgHandler(ws: WebSocket, log: ConnectionLog, next: Function) {
    try {
      log.logDataHash = generateLogHash(log);
      const hasDuplicate = await connectionLogService.getPossibleDuplicate(log);
      if (hasDuplicate) {
        console.log("Ignored potential duplicate");
        return;
      }
      await connectionLogService.insert(log);
      this.wss.clients.forEach(function each(client: any) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(log);
        }
      });
      next();
    } catch (e) {
      console.log(e);
    }
  }

  start() {
    this.wss.on("connection", (ws: WebSocket) => {
      // send immediatly a feedback to the incoming connection
      ws.send("user connected");

      ws.on("error", function (e) {
        console.log(e);
      });

      // connection is up, let's add a simple simple event
      ws.on("message", async (message: string) => {
        // console.log(`Received -> ${message}`);
        this.queue.push({
          data: JSON.parse(message),
          executor: (data: ConnectionLog, next: Function) => {
            this.onMsgHandler(ws, data, next);
          }
        });
      });
    });
    this.wss.on("error", function (e) {
      console.log(e);
    });
  }
}
