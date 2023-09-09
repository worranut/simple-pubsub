import { MachineLowStockWarningEvent, MachineStockLevelOkEvent } from "../app";
import IEvent from "../intefaces/event.interface";
import ISubscriber from "../intefaces/subscriber.interface";

export default class StockWarningSubscriber implements ISubscriber {
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
