import { connect, NatsConnection } from '@nats-io/transport-node';
import {
  JetStreamClient,
  JetStreamManager,
  jetstreamManager,
} from '@nats-io/jetstream';
import { Subjects } from '@raymanselltickets/common';

class NatsWrapper {
  private _connection?: NatsConnection;
  private _jsManager?: JetStreamManager;
  private _jsClient?: JetStreamClient;

  get connection() {
    if (!this._connection) {
      throw new Error('Cannot access NATS client before connecting');
    }
    return this._connection;
  }

  get jsManager() {
    if (!this._jsManager) {
      throw new Error('Cannot access NATS JetStream manager before connecting');
    }
    return this._jsManager;
  }

  get jsClient() {
    if (!this._jsClient) {
      throw new Error('Cannot access NATS JetStream client before connecting');
    }
    return this._jsClient;
  }

  async connect(clientName: string, url: string, streamName: string) {
    try {
      this._connection = await connect({
        servers: url,
        reconnect: false,
        waitOnFirstConnect: true,
        name: clientName,
      });
      this._jsManager = await jetstreamManager(this._connection);
      this._jsClient = this._jsManager.jetstream();

      await this.createStreamIfNotExists(streamName, Object.values(Subjects));

      console.log('Connected to NATS');
    } catch (error) {
      console.log('Error connecting to NATS');
      console.error(error);
    }
  }

  private async createStreamIfNotExists(
    streamName: string,
    subjects: string[]
  ) {
    const streams = await this.jsManager.streams.list().next();
    const streamExists = streams.some(
      (stream) => stream.config.name === streamName
    );

    if (!streamExists) {
      await this.jsManager.streams.add({
        name: streamName,
        subjects: subjects,
      });
      console.log(`Stream ${streamName} created.`);
    } else {
      console.log(`Stream ${streamName} already exists.`);
    }
  }
}

export const natsWrapper = new NatsWrapper();
