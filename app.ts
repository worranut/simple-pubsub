import { eventGenerator } from "./helper";
import IEvent from "./intefaces/event.interface";
import IPublishSubscribeService from "./intefaces/publishSubscribeService.interface";
import ISubscriber from "./intefaces/subscriber.interface";
import Machine from "./objects/machine.obj";

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

class MachineLowStockWarningEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return "lowStockWarning";
  }
}

class MachineStockLevelOkEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return "stockLevelOk";
  }
}

class MachineSaleSubscriber implements ISubscriber {
  public machines: Machine[];

  constructor(machines: Machine[]) {
    this.machines = machines;
  }

  handle(event: MachineSaleEvent): void {
    const machine = this.machines.find((m) => m.id === event.machineId());
    if (machine) {
      machine.stockLevel -= event.getSoldQuantity();
      if (machine.stockLevel < 3) {
        // Generate a LowStockWarningEvent
        pubSubService.publish(new MachineLowStockWarningEvent(machine.id));
      }
    }
  }
}

class MachineRefillSubscriber implements ISubscriber {
  public machines: Machine[];

  constructor(machines: Machine[]) {
    this.machines = machines;
  }

  handle(event: MachineRefillEvent): void {
    const machine = this.machines.find((m) => m.id === event.machineId());
    if (machine) {
      machine.stockLevel += event.getRefillQuantity();
      if (machine.stockLevel >= 3) {
        // Generate a StockLevelOkEvent
        pubSubService.publish(new MachineStockLevelOkEvent(machine.id));
      }
    }
  }
}

class StockWarningSubscriber implements ISubscriber {
  private machinesWithLowStock: Set<string> = new Set();

  handle = (event: IEvent): void => {
    if (event instanceof MachineLowStockWarningEvent) {
      const warningEvent = event as MachineLowStockWarningEvent;
      if (!this.machinesWithLowStock.has(warningEvent.machineId())) {
        console.log(
          `**WARNING** Low stock warning for machine: ${warningEvent.machineId()}`
        );
        this.machinesWithLowStock.add(warningEvent.machineId());
      }
    } else if (event instanceof MachineStockLevelOkEvent) {
      const stockOkEvent = event as MachineStockLevelOkEvent;
      if (this.machinesWithLowStock.has(stockOkEvent.machineId())) {
        console.log(
          `**OK** Stock level is OK for machine: ${stockOkEvent.machineId()}`
        );
        this.machinesWithLowStock.delete(stockOkEvent.machineId());
      }
    }
  };
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
const pubSubService: IPublishSubscribeService = new PublishSubscribeService();

(async () => {
  // create 3 machines with a quantity of 10 stock
  const machines: Machine[] = [
    new Machine("001"),
    new Machine("002"),
    new Machine("003"),
  ];

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const saleSubscriber = new MachineSaleSubscriber(machines);
  const refillSubscriber = new MachineRefillSubscriber(machines);
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
