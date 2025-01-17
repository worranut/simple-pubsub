import { eventGenerator } from "./helper";
import IPublishSubscribeService from "./intefaces/publishSubscribeService.interface";
import Machine from "./objects/machine.obj";
import PublishSubscribeService from "./services/publishSubscribe.service";
import MachineRefillSubscriber from "./subscribers/machineRefill.sub";
import MachineSaleSubscriber from "./subscribers/machineSale.sub";
import StockWarningSubscriber from "./subscribers/stockWarning.sub";

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
