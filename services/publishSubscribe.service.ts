import MachineRefillEvent from "../events/machineRefill.event";
import MachineSaleEvent from "../events/machineSale.event";
import IEvent from "../intefaces/event.interface";
import IPublishSubscribeService from "../intefaces/publishSubscribeService.interface";
import ISubscriber from "../intefaces/subscriber.interface";
import MachineRefillSubscriber from "../subscribers/machineRefill.sub";
import MachineSaleSubscriber from "../subscribers/machineSale.sub";

// Publish-Subscribe Service Implementation
export default class PublishSubscribeService
  implements IPublishSubscribeService
{
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
