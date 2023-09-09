import { eventGenerator } from "./helper";
import IEvent from "./intefaces/event.interface";
import IPublishSubscribeService from "./intefaces/publishSubscribeService.interface";
import ISubscriber from "./intefaces/subscriber.interface";
import Machine from "./objects/machine.obj";
import MachineRefillSubscriber from "./subscribers/machineRefill.sub";
import MachineSaleSubscriber from "./subscribers/machineSale.sub";
import StockWarningSubscriber from "./subscribers/stockWarning.sub";

// implementations
export class MachineSaleEvent implements IEvent {
  constructor(
    private readonly _sold: number,
    private readonly _machineId: string
  ) {}

  machineId(): string {
    return this._machineId;
  }

  getSoldQuantity(): number {
    return this._sold;
  }

  type(): string {
    return "sale";
  }
}

export class MachineRefillEvent implements IEvent {
  constructor(
    private readonly _refill: number,
    private readonly _machineId: string
  ) {}

  machineId(): string {
    return this._machineId;
  }

  getRefillQuantity(): number {
    return this._refill;
  }

  type(): string {
    return "refill";
  }
}

export class MachineLowStockWarningEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return "lowStockWarning";
  }
}

export class MachineStockLevelOkEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return "stockLevelOk";
  }
}

// Publish-Subscribe Service Implementation
class PublishSubscribeService implements IPublishSubscribeService {
  private subscribers: Record<string, ISubscriber[]> = {};

  subscribe = (type: string, handler: ISubscriber): void => {
    if (!this.subscribers[type]) {
      this.subscribers[type] = [];
    }
    this.subscribers[type].push(handler);
  };

  publish = (event: IEvent): void => {
    const type = event.type();

    // Print event log when sale or refill event
    if (
      event instanceof MachineSaleEvent ||
      event instanceof MachineRefillEvent
    ) {
      console.log(event);
    }

    if (this.subscribers[type]) {
      this.subscribers[type].forEach((subscriber) => {
        subscriber.handle(event);

        // Print all machines log when sale or refill subscriber
        if (
          subscriber instanceof MachineSaleSubscriber ||
          subscriber instanceof MachineRefillSubscriber
        ) {
          console.log(subscriber.machines);
          console.log("========================================");
        }
      });
    }
  };

  unsubscribe = (type: string, handler: ISubscriber): void => {
    if (this.subscribers[type]) {
      this.subscribers[type] = this.subscribers[type].filter(
        (subscriber) => subscriber !== handler
      );
    }
  };
}

// program
(async () => {
  // create 3 machines with a quantity of 10 stock
  const machines: Machine[] = [
    new Machine("001"),
    new Machine("002"),
    new Machine("003"),
  ];

  const pubSubService: IPublishSubscribeService = new PublishSubscribeService();

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const saleSubscriber = new MachineSaleSubscriber(machines, pubSubService);
  const refillSubscriber = new MachineRefillSubscriber(machines, pubSubService);
  const stockWarningSubscriber = new StockWarningSubscriber();

  // subscribe subscribers to events
  pubSubService.subscribe("sale", saleSubscriber);
  pubSubService.subscribe("refill", refillSubscriber);
  pubSubService.subscribe("lowStockWarning", stockWarningSubscriber);
  pubSubService.subscribe("stockLevelOk", stockWarningSubscriber);

  // create 5 random events
  const events = [1, 2, 3, 4, 5].map((i) => eventGenerator());

  // publish the events
  events.map(pubSubService.publish);

  // unsubscribe subscribers at the end
  pubSubService.unsubscribe("sale", saleSubscriber);
  pubSubService.unsubscribe("refill", refillSubscriber);
  pubSubService.unsubscribe("lowStockWarning", stockWarningSubscriber);
  pubSubService.unsubscribe("stockLevelOk", stockWarningSubscriber);
})();
