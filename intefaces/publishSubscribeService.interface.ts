import IEvent from "./event.interface";
import ISubscriber from "./subscriber.interface";

export default interface IPublishSubscribeService {
  publish(event: IEvent): void;
  subscribe(type: string, handler: ISubscriber): void;
  unsubscribe(type: string, handler: ISubscriber): void;
}
