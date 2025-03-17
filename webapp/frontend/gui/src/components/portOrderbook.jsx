import { Component } from "react";

class PortOrderbook extends Component {
  render() {
    return (
      <div className={this.props.isOpen ? "modal is-active" : "modal"}>
        <div className="modal-background" onClick={this.props.close}></div>

        <div className="modal-card wide-modal">
          <header className="modal-card-head">
            <p className="modal-card-title">Orderbook - Port #{this.props.port.name} (Strategy #{this.props.port.strategyName})</p>
            <button className="delete" onClick={this.props.close}></button>
          </header>

          <section className="modal-card-body">
            <table className="table is-striped is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th align="center">Account Name</th>
                  <th align="center">Timestamp</th>
                  <th align="center">Instrument</th>
                  <th align="center">Trade</th>
                  <th align="center">Qty</th>
                  <th align="center">Order Type</th>
                  <th align="center">Price</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.props.port.orders.map((order, i) => (
                    <tr>
                      <td align="center">{order.accountName}</td>
                      <td align="center">{order.timestamp}</td>
                      <td align="center">{order.instrument}</td>
                      <td align="center">{order.trade}</td>
                      <td align="center">{order.qty}</td>
                      <td align="center">{order.orderType}</td>
                      <td align="center">{order.price}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </section>

          <footer className="modal-card-foot"></footer>
        </div>
      </div>
    );
  }
}

export default PortOrderbook;