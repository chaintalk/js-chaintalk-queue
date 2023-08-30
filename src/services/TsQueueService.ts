import { ITsQueue } from "../interfaces/ITsQueue";
import { TsQueueMember, TsQueuePullOptions, TsQueuePullResult } from "../models/TsQueueModels";
import { PageUtil, TypeUtil } from "chaintalk-utils";
import Redis from "ioredis";
import { defaultTsQueuePullResult } from "../constants/TsQueueContants";
import { TsQueueMemberEncoder } from "../utils/TsQueueMemberEncoder";
import { Callback } from "ioredis/built/types";
import { RedisKey, Result } from "ioredis/built/utils/RedisCommander";



/**
 * 	class TsQueueService
 */
export class TsQueueService implements ITsQueue
{
	private redis : Redis = new Redis();

	constructor()
	{
	}

	/**
	 * 	@returns {Promise<boolean>}
	 */
	public async close() : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( this.redis )
				{
					await this.redis.quit();
					resolve( true );
				}
				else
				{
					reject( `Redis is not initialized` );
				}
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 * 	push a time serial data
	 *	@param channel		{string}
	 *	@param timestamp	{number}
	 *	@param data		{object}
	 */
	public async push( channel : string, timestamp : number, data : object ) : Promise<number>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const member : TsQueueMember = {
					channel : channel,
					timestamp : timestamp,
					data : data,
				};
				const json : string | null = TsQueueMemberEncoder.encode( member );
				if ( null === json )
				{
					return reject( `invalid data` );
				}

				//	...
				const result : number = await this.redis.zadd( channel, timestamp, json );
				resolve( result );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 *	@param channel		{string}
	 *	@param startTimestamp	{number} timestamp in millisecond. 0 means the beginning of the list
	 *	@param endTimestamp	{number} timestamp in millisecond. -1 means the last of the list
	 *	@param options		{TsQueuePullOptions}
	 *	@returns {TsQueuePullResult}
	 */
	public async pull
		(
			channel : string,
			startTimestamp : number,
			endTimestamp : number,
			options ?: TsQueuePullOptions
		) : Promise<TsQueuePullResult>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( endTimestamp > 0 && endTimestamp < startTimestamp )
				{
					return reject( `invalid endTimestamp` );
				}

				const pageNo : number = PageUtil.getSafePageNo( options?.pageNo );
				const pageSize : number = PageUtil.getSafePageSize( options?.pageSize );
				const startOffset : number = ( pageNo - 1 ) * pageSize;
				const list : Array<string> = await this.redis.zrangebyscore
					(
						channel,
						startTimestamp,
						endTimestamp,
						"LIMIT",
						startOffset,
						pageSize
					);
				if ( Array.isArray( list ) && list.length > 0 )
				{
					let pageKey : number = 0;
					let memberList : Array< TsQueueMember | null > = [];
					for ( const str of list )
					{
						const member : TsQueueMember | null = TsQueueMemberEncoder.decode( str );
						pageKey = ( null !== member ) ? member.timestamp : 0;

						//	...
						memberList.push( member );
					}

					return resolve( {
						total : memberList.length,
						pageKey : pageKey,
						list : memberList,
					});
				}

				resolve( defaultTsQueuePullResult );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}


	public remove( channel : string, startTimestamp : number, endTimestamp : number ) : Promise<boolean>
	{
		/**
		 * Remove all members in a sorted set within the given scores
		 * - _group_: sorted-set
		 * - _complexity_: O(log(N)+M) with N being the number of elements in the sorted set and M the number of elements removed by the operation.
		 * - _since_: 1.2.0
		 */
		//zremrangebyscore(key: RedisKey, min: number | string, max: number | string, callback?: Callback<number>): Result<number, Context>;
		return Promise.resolve( false );
	}

	public removeFromHead( channel : string, endTimestamp : number ) : Promise<boolean>
	{
		return Promise.resolve( false );
	}
}
