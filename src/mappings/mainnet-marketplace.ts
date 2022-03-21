import { log } from "@graphprotocol/graph-ts"

import { Token, Order } from "../types/schema";

import {
    OrdedAdded as OrderAddedEvent,
    OrderExecuted as OrderExecutedEvent,
    OrderRemoved as OrderRemovedEvent,
} from "../types/AlphaLostWorldsMarketplace/AlphaLostWorldsMarketplace";


export function handleAlphaLostWorldsMarketplaceV1OrderAdded (event: OrderAddedEvent): void {
    handleOrderAdded(event, "AlphaLostWorldsMarketplaceV1", "V1");
}

function handleOrderAdded (event: OrderAddedEvent, marketplace: string, idPrefix: string): void {    
    let id = idPrefix + "-" + event.params.orderId.toString();
    let lostWorld = event.params.token.toHexString().toLowerCase();

    let order = new Order(id);
    order.orderId = event.params.orderId;
    order.token = lostWorld + "-" + event.params.tokenId.toString();
    order.lostWorld = event.params.token.toHexString().toLowerCase();
    order.marketplace = marketplace;
    order.price = event.params.price;
    order.seller = event.params.seller;
    order.isOpen = true;
    order.isExecuted = false;
    order.createdTimestamp = event.block.timestamp.toI32();
    order.updatedTimestamp = event.block.timestamp.toI32();

    let token = Token.load(order.token);
    if (token) {
        order.variation = token.variation;
        token.hasActiveOrder = true;
        token.activeOrder = order.id;
        token.updatedTimestamp = event.block.timestamp.toI32();
        token.save();
    }
    order.save();
}


export function handleAlphaLostWorldsMarketplaceV1OrderExecuted (event: OrderExecutedEvent): void {
    handleOrderExecuted(event, "V1");
}

function handleOrderExecuted (event: OrderExecutedEvent, idPrefix: string): void {
    let id = idPrefix + "-" + event.params.orderId.toString();
    let order = Order.load(id);
    if (!order) {
        return;
    }
    order.isOpen = false;
    order.isExecuted = true;
    order.buyer = event.params.buyer;
    order.updatedTimestamp = event.block.timestamp.toI32();
    order.save();

    let token = Token.load(order.token);
    if (token) {
        token.hasActiveOrder = false;
        token.activeOrder = null;
        token.updatedTimestamp = event.block.timestamp.toI32();
        token.save();
    }
}


export function handleAlphaLostWorldsMarketplaceV1OrderRemoved (event: OrderRemovedEvent): void {
    handleOrderRemoved(event, "V1");
}


function handleOrderRemoved (event: OrderRemovedEvent, idPrefix: string): void {
    let id = idPrefix + "-" + event.params.orderId.toString();
    let order = Order.load(id);
    if (!order) {
        return;
    }
    order.isOpen = false;
    order.updatedTimestamp = event.block.timestamp.toI32();
    order.save();

    let token = Token.load(order.token);
    if (token) {
        token.hasActiveOrder = false;
        token.activeOrder = null;
        token.updatedTimestamp = event.block.timestamp.toI32();
        token.save();
    }
}
