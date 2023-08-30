import { describe, expect } from '@jest/globals';
import { TsQueueMember, TsQueuePullOptions, TsQueuePullResult, TsQueueService } from "../../../src";
import { TestUtil } from "chaintalk-utils";



/**
 *	unit test
 */
describe( "TsQueueService", () =>
{
	beforeAll( async () =>
	{
	} );
	afterAll( async () =>
	{
	} );

	describe( "push/pull", () =>
	{
		it( "should push serial data into Queue", async () =>
		{
			const channel = 'chat-1998';
			const tsQueueService = new TsQueueService();
			await tsQueueService.push( channel, new Date().getTime(), { msg : 'hi' } );
			await TestUtil.sleep( 100 );
			await tsQueueService.push( channel, new Date().getTime(), { msg : 'hi' } );
			await TestUtil.sleep( 100 );
			await tsQueueService.push( channel, new Date().getTime(), { msg : 'hi' } );
			await TestUtil.sleep( 100 );

			const pageOptions : TsQueuePullOptions = {
				pageNo : 1,
				pageSize : 10
			};
			const result : TsQueuePullResult = await tsQueueService.pull
				(
					channel,
					0,
					new Date().getTime(),
					pageOptions
				);
			console.log( result );
			expect( result ).toBeDefined();
			expect( result ).toHaveProperty( 'total' );
			expect( result ).toHaveProperty( 'pageKey' );
			expect( result ).toHaveProperty( 'list' );
			expect( result.total ).toBeGreaterThanOrEqual( 3 );
			expect( Array.isArray( result.list ) ).toBeTruthy();
			expect( result.list.length ).toBeGreaterThanOrEqual( 3 );
			for ( const item of result.list )
			{
				expect( item ).toHaveProperty( 'channel' );
				expect( item ).toHaveProperty( 'timestamp' );
				expect( item ).toHaveProperty( 'data' );
				if ( item )
				{
					expect( item.data ).toHaveProperty( 'msg' );
					const dataObj : any = item.data;
					if ( dataObj )
					{
						expect( 'string' === typeof dataObj.msg ).toBeTruthy();
					}
				}
			}

			//	...
			await tsQueueService.close();

		}, 60 * 10e3 );
	} );
} );
