export type TsQueueMember =
{
	channel : string,
	timestamp : number,
	data : object,
};

export type TsQueuePullOptions =
{
	pageNo ?: number,
	pageSize ?: number,
	pageKey ?: number,
};

export type TsQueuePullResult =
{
	total : number,
	pageKey : number,
	list : Array< TsQueueMember | null >,
};
