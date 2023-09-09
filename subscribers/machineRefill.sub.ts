import { MachineRefillEvent, MachineStockLevelOkEvent } from "../app";
import IPublishSubscribeService from "../intefaces/publishSubscribeService.interface";
import ISubscriber from "../intefaces/subscriber.interface";
import Machine from "../objects/machine.obj";

export default class MachineRefillSubscriber implements ISubscriber {
  public machines: Machine[];
  private pubSubService: IPublishSubscribeService;

  constructor(machines: Machine[], pubSubService: IPublishSubscribeService) {
    this.machines = machines;
    this.pubSubService = pubSubService;
  }

  handle(event: MachineRefillEvent): void {
    const machine = this.machines.find((m) => m.id === event.machineId());
    if (machine) {
      machine.stockLevel += event.getRefillQuantity();
      if (machine.stockLevel >= 3) {
        // Generate a StockLevelOkEvent
        this.pubSubService.publish(new MachineStockLevelOkEvent(machine.id));
      }
    }
  }
}
