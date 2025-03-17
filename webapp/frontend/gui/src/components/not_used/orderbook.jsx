import { Component } from "react";

class Orderbook extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getOrders();
  }

  render() {
    console.log(this.props.orders);

    return (
      <div className="columns">
        <div className="column is-8-tablet is-offset-2-tablet">
          <div className="card m-2">
            <header className="card-header text-center">
              <h5 className="card-header-title">Orderbook</h5>
            </header>

            <section className="card-content overflow-auto">
              <div className="columns is-mobile">
                <span className="column is-half py-0">
                  <button className="button is-info is-fullwidth" onClick={this.props.getOrders}>Refresh</button>
                </span>
                <span className="column is-half py-0">
                  <button className="button is-danger is-fullwidth" onClick={this.props.clearOrders}>Clear</button>
                </span>
              </div>

              <hr />

              <table className="table is-hoverable is-striped has-text-centered is-fullwidth is-bordered">
                <thead>
                  <tr>
                    <th align="center">Timestamp</th>
                    <th align="center">Instrument</th>
                    <th align="center">Side</th>
                    <th align="center">Quantity</th>
                    <th align="center">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.orders.map((order, i) => (
                    <tr key={order.id}>
                      <td>{order.timestamp}</td>
                      <td>{order.instrument}</td>
                      <td>{order.side}</td>
                      <td>{order.qty}</td>
                      <td>{order.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default Orderbook;
