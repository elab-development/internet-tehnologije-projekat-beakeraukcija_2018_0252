import beaker
import pyteal as pt


class AuctionState:

    previous_bidder = beaker.GlobalStateValue(
        stack_type=pt.TealType.bytes, default=pt.Bytes("")
    )

    previous_bid = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64, default=pt.Int(0)
    )

    auction_end = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64, default=pt.Int(0)
    )

    asa = beaker.GlobalStateValue(stack_type=pt.TealType.uint64, default=pt.Int(0))

    asa_amount = beaker.GlobalStateValue(
        stack_type=pt.TealType.uint64, default=pt.Int(0)
    )

    claimable_amount = beaker.LocalStateValue(
        stack_type=pt.TealType.uint64, default=pt.Int(0)
    )


app = beaker.Application("Auction", state=AuctionState)


@app.create(bare=True)
def create() -> pt.Expr:
    return app.initialize_global_state()


@app.external(authorize=beaker.Authorize.only(pt.Global.creator_address()))
def opt_into_asset(asset: pt.abi.Asset) -> pt.Expr:
    return pt.Seq(
        pt.Assert(app.state.asa == pt.Int(0)),
        app.state.asa.set(asset.asset_id()),
        pt.InnerTxnBuilder.Execute(
            {
                pt.TxnField.type_enum: pt.TxnType.AssetTransfer,
                pt.TxnField.asset_receiver: pt.Global.current_application_address(),
                pt.TxnField.xfer_asset: asset.asset_id(),
                pt.TxnField.asset_amount: pt.Int(0),
                pt.TxnField.fee: pt.Int(0),
            }
        ),
    )


@app.external(authorize=beaker.Authorize.only(pt.Global.creator_address()))
def start_auction(
    starting_price: pt.abi.Uint64,
    length: pt.abi.Uint64,
    axfer: pt.abi.AssetTransferTransaction,
) -> pt.Expr:
    return pt.Seq(
        pt.Assert(app.state.auction_end.get() == pt.Int(0)),
        app.state.previous_bid.set(starting_price.get()),
        app.state.auction_end.set(length.get() + pt.Global.latest_timestamp()),
        pt.Assert(
            axfer.get().asset_receiver() == pt.Global.current_application_address()
        ),
        app.state.asa_amount.set(axfer.get().asset_amount()),
        app.state.asa.set(axfer.get().xfer_asset()),
    )


@app.opt_in(bare=True)
def opt_in() -> pt.Expr:
    return app.state.claimable_amount[pt.Txn.sender()].set_default()


@app.external
def bid(payment: pt.abi.PaymentTransaction) -> pt.Expr:
    return pt.Seq(
        pt.Assert(app.state.auction_end.get() > pt.Global.latest_timestamp()),
        pt.Assert(app.state.auction_end.get() != pt.Int(0)),
        pt.Assert(payment.get().amount() > app.state.previous_bid.get()),
        pt.Assert(payment.get().receiver() == pt.Global.current_application_address()),
        app.state.previous_bidder.set(payment.get().sender()),
        app.state.previous_bid.set(payment.get().amount()),
        app.state.claimable_amount[pt.Txn.sender()].set(
            app.state.claimable_amount[pt.Txn.sender()] + payment.get().amount()
        ),
    )


@pt.Subroutine(pt.TealType.none)
def pay(receiver: pt.Expr, amount: pt.Expr) -> pt.Expr:
    return pt.InnerTxnBuilder.Execute(
        {
            pt.TxnField.type_enum: pt.TxnType.Payment,
            pt.TxnField.fee: pt.Int(0),
            pt.TxnField.amount: amount,
            pt.TxnField.receiver: receiver,
        }
    )


@app.external
def reclaim_bids() -> pt.Expr:

    return pt.Seq(
        pt.If(pt.Txn.sender() == app.state.previous_bidder.get())
        .Then(
            pt.Seq(
                pay(
                    pt.Txn.sender(),
                    app.state.claimable_amount[pt.Txn.sender()].get()
                    - app.state.previous_bid.get(),
                ),
                app.state.claimable_amount[pt.Txn.sender()].set(
                    app.state.previous_bid.get()
                ),
            )
        )
        .Else(
            pt.Seq(
                pay(pt.Txn.sender(), app.state.claimable_amount[pt.Txn.sender()].get()),
                app.state.claimable_amount[pt.Txn.sender()].set(pt.Int(0)),
            )
        )
    )


@app.external
def claim_asset() -> pt.Expr:
    return pt.Seq(
        pt.Assert(pt.Global.latest_timestamp() > app.state.auction_end.get()),
        pt.InnerTxnBuilder.Execute(
            {
                pt.TxnField.type_enum: pt.TxnType.AssetTransfer,
                pt.TxnField.asset_receiver: app.state.previous_bidder.get(),
                pt.TxnField.xfer_asset: app.state.asa.get(),
                pt.TxnField.asset_amount: app.state.asa_amount.get(),
                pt.TxnField.asset_close_to: app.state.asa_amount.get(),
                pt.TxnField.fee: pt.Int(0),
            }
        ),
    )


@app.delete(bare=True)
def delete() -> pt.Expr:
    return pt.Seq(
        pt.Assert(pt.Global.latest_timestamp() > app.state.auction_end.get()),
        pt.InnerTxnBuilder.Execute(
            {
                pt.TxnField.type_enum: pt.TxnType.Payment,
                pt.TxnField.receiver: pt.Global.creator_address(),
                pt.TxnField.amount: pt.Int(0),
                pt.TxnField.close_remainder_to: pt.Global.creator_address(),
            }
        ),
    )
