import MachineLowStockWarningEvent from "../events/machineLowStockWarning.event";
import MachineSaleEvent from "../events/machineSale.event";
import IPublishSubscribeService from "../intefaces/publishSubscribeService.interface";
import ISubscriber from "../intefaces/subscriber.interface";
import Machine from "../objects/machine.obj";

export default class MachineSaleSubscriber implements ISubscriber {
  public machines: Machine[];
  private pubSubService: IPublishSubscribeService;

  constructor(machines: Machine[], pubSubService: IPublishSubscribeService) {
    this.machines = machines;
    this.pubSubService = pubSubService;
  }

  handle(event: MachineSaleEvent): void {
    const machine = this.machines.find((m) => m.id === event.machineId());
    if (machine) {
      machine.stockLevel -= event.getSoldQuantity();
      if (machine.stockLevel < 3) {
        // Generate a LowStockWarningEvent
        this.pubSubService.publish(new MachineLowStockWarningEvent(machine.id));
      }
    }
  }
}
