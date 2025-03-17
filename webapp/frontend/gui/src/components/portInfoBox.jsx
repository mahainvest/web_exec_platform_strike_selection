import { Component } from "react";

class PortInfoBox extends Component {
  render() {
    return (
      <div className={this.props.isOpen ? "modal is-active" : "modal"}>
        <div className="modal-background" onClick={this.props.close}></div>

        <div className="modal-card wide-modal">
          <header className="modal-card-head">
            <p className="modal-card-title">Info Box - Port #{this.props.port.name} (Strategy #{this.props.port.strategyName})</p>
            <button className="delete" onClick={this.props.close}></button>
          </header>

          <section className="modal-card-body">
            <h5 className="is-size-5 is-underlined">Statistics</h5>
            <br />

            <table className="table is-striped is-hoverable is-fullwidth is-bordered">
              <tbody>
                <tr>
                  <th>Started:</th>
                  <td>{this.props.port.stopButton ? "No" : "Yes"}</td>
                </tr>
                <tr>
                  <th>Strategy:</th>
                  <td>{this.props.port.strategyName}</td>
                </tr>
                <tr>
                  <th>Lots Multiplier Set:</th>
                  <td>{this.props.port.lotsMultiplierSet}</td>
                </tr>
                <tr>
                  <th>Running, Booked P&L:</th>
                  <td>{this.props.port.runningPnl}, {this.props.port.bookedPnl}</td>
                </tr>
              </tbody>
            </table>

            <table className="table is-striped is-hoverable is-fullwidth is-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Ins (Token)</th>
                  <th>Strike</th>
                  <th>Ent. Und. Price</th>
                  <th>Ent. Order Msg.</th>
                  <th>Ent. Order Status</th>
                  <th>Ent. No. of Mod.</th>
                  <th>Ent. Filled Qty</th>
                  <th>Ent. Exec. Price</th>
                  <th>Ext. Order Msg.</th>
                  <th>Ext. Order Status</th>
                  <th>Ext. No. of Mod.</th>
                  <th>Ext. Filled Qty</th>
                  <th>Ext. Exec. Price</th>
                  <th>LTP</th>
                  <th>Run. | Book. P&L</th>
                </tr>
              </thead>
              <tbody>
                {this.props.port.legs.map((leg, i) => {
                  let entryOrderMessageTag;
                  let exitOrderMessageTag;
                  let entryOrderStatusTag;
                  let exitOrderStatusTag;

                  if (["sucess", "successful"].includes(leg.entryOrderMessage)) {
                    entryOrderMessageTag = "tag is-success";
                  } else if (leg.entryOrderMessage === "") {
                    entryOrderMessageTag = "tag is-warning";
                  } else {
                    entryOrderMessageTag = "tag is-danger";
                  }

                  if (["sucess", "successful"].includes(leg.exitOrderMessage)) {
                    exitOrderMessageTag = "tag is-success";
                  } else if (leg.exitOrderMessage === "") {
                    exitOrderMessageTag = "tag is-warning";
                  } else {
                    exitOrderMessageTag = "tag is-danger";
                  }

                  if (leg.entryOrderStatus === "Reject") {
                    entryOrderStatusTag = "tag is-danger";
                  } else if (leg.entryOrderStatus === "PARTIALLY_FILLED") {
                    entryOrderStatusTag = "tag is-info";
                  } else if (leg.entryOrderStatus === "Execute") {
                    entryOrderStatusTag = "tag is-success";
                  } else {
                    entryOrderStatusTag = "tag is-warning";
                  }

                  if (leg.exitOrderStatus === "Reject") {
                    exitOrderStatusTag = "tag is-danger";
                  } else if (leg.exitOrderStatus === "PARTIALLY_FILLED") {
                    exitOrderStatusTag = "tag is-info";
                  } else if (leg.exitOrderStatus === "Execute") {
                    exitOrderStatusTag = "tag is-success";
                  } else {
                    exitOrderStatusTag = "tag is-warning";
                  }

                  return (
                    <tr key={i}>
                      <td>{leg.name}</td>
                      <td>{leg.status}</td>
                      <td>{leg.enteredIns} ({leg.enteredToken})</td>
                      <td>{leg.enteredStrike}</td>
                      <td>{leg.enteredUnderlyingPrice}</td>
                      <td><span className={entryOrderMessageTag}>{leg.entryOrderMessage}</span></td>
                      <td><span className={entryOrderStatusTag}>{leg.entryOrderStatus}</span></td>
                      <td>{leg.entryNumModificationsDone}</td>
                      <td>{leg.entryFilledQty}</td>
                      <td>{leg.entryExecutedPrice}</td>
                      <td><span className={exitOrderMessageTag}>{leg.exitOrderMessage}</span></td>
                      <td><span className={exitOrderStatusTag}>{leg.exitOrderStatus}</span></td>
                      <td>{leg.exitNumModificationsDone}</td>
                      <td>{leg.exitFilledQty}</td>
                      <td>{leg.exitExecutedPrice}</td>
                      <td>{leg.ltp}</td>
                      <td>{leg.runningPnl} | {leg.bookedPnl}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <h5 className="is-size-5 is-underlined">Inputs</h5>
            <br />

            <table className="table is-striped is-hoverable is-fullwidth is-bordered">
              <tbody>
                <tr>
                  <th>Scrip / Scrip Type:</th>
                  <td>{this.props.port.scrip} / {this.props.port.scripType}</td>
                </tr>
                <tr>
                  <th>Start / Stop / Squareoff Time:</th>
                  <td>{this.props.port.startTime} / {this.props.port.stopTime} / {this.props.port.squareoffTime}</td>
                </tr>
                <tr>
                  <th>Combined SL/Target:</th>
                  <td>{this.props.port.combinedSL}/{this.props.port.combinedTarget}</td>
                </tr>
                <tr>
                  <th>To Re-Execute:</th>
                  <td>{this.props.port.toReExecute}</td>
                </tr>
                <tr>
                  <th>Trading Mode:</th>
                  <td>{this.props.port.tradingMode}</td>
                </tr>
              </tbody>
            </table>

            <table className="table is-striped is-hoverable is-fullwidth is-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Lots</th>
                  <th>IT</th>
                  <th>S.Dis.</th>
                  <th>Expiry</th>
                  <th>TT</th>
                  <th>OT</th>
                  <th>Limit %</th>
                  <th>Num. Mod.</th>
                  <th>Mod. WT</th>
                  <th>SL On</th>
                  <th>SL</th>
                  <th>Tgt</th>
                </tr>
              </thead>
              <tbody>
                {this.props.port.legs.map((leg, i) => (
                  <tr key={i}>
                    <td>{leg.name}</td>
                    <td>{leg.lots}</td>
                    <td>{leg.insType}</td>
                    <td>{leg.strikeDistance}</td>
                    <td>{leg.expiry}</td>
                    <td>{leg.tradeType}</td>
                    <td>{leg.orderType}</td>
                    <td>{leg.limitPct}</td>
                    <td>{leg.numModifications}</td>
                    <td>{leg.modificationWaitTime}</td>
                    <td>{leg.slOn}</td>
                    <td>{leg.sl}</td>
                    <td>{leg.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <footer className="modal-card-foot"></footer>
        </div>
      </div>
    );
  }
}

export default PortInfoBox;