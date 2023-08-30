import { TsQueuePullOptions, TsQueuePullResult } from "../models/TsQueueModels";

/**
 * 	Time Series Queue
 */
export interface ITsQueue
{
	push( channel : string, timestamp : number, data : object ) : Promise<number>;
	pull( channel : string, startTimestamp : number, endTimestamp : number, options ?: TsQueuePullOptions ) : Promise<TsQueuePullResult>;

	removeFromHead( channel : string, endTimestamp : number ) : Promise<boolean>;
	remove( channel : string, startTimestamp : number, endTimestamp : number ) : Promise<boolean>;
}

