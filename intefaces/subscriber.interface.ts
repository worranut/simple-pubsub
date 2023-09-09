import IEvent from "./event.interface";

export default interface ISubscriber {
  handle(event: IEvent): void;
}
